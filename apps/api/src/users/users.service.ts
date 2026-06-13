import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Availability, UserRole } from "@prisma/client";
import { pickStaffBrandColor } from "@office/shared";
import { PrismaService } from "../prisma/prisma.service";
import { toUser } from "./user.mapper";

export interface GoogleProfile {
  googleId: string;
  email: string;
  nameEn: string;
  photoUrl?: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private bootstrapEmails(): Set<string> {
    const raw = this.config.get<string>("BOOTSTRAP_ADMIN_EMAILS") ?? "";
    return new Set(
      raw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    );
  }

  isBootstrapAdmin(email: string): boolean {
    return this.bootstrapEmails().has(email.toLowerCase());
  }

  async findByGoogleId(googleId: string) {
    const record = await this.prisma.user.findUnique({ where: { googleId } });
    return record ? toUser(record) : null;
  }

  async findById(id: string) {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? toUser(record) : null;
  }

  async createBootstrapAdmin(profile: GoogleProfile) {
    const record = await this.prisma.user.create({
      data: {
        googleId: profile.googleId,
        email: profile.email,
        nameEn: profile.nameEn,
        photoUrl: profile.photoUrl,
        role: UserRole.admin,
        status: "active",
        approvedAt: new Date(),
      },
    });
    return toUser(record);
  }

  async register(profile: GoogleProfile, role: "employee" | "staff") {
    const existing = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (existing?.status === "active") {
      throw new Error("ALREADY_ACTIVE");
    }

    if (existing?.status === "rejected" || existing?.status === "pending") {
      const record = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          role: role as UserRole,
          status: "pending",
          nameEn: profile.nameEn,
          photoUrl: profile.photoUrl,
          email: profile.email,
          approvedAt: null,
          brandColor: null,
          availability: null,
          nameBn: null,
        },
      });
      return toUser(record);
    }

    const record = await this.prisma.user.create({
      data: {
        googleId: profile.googleId,
        email: profile.email,
        nameEn: profile.nameEn,
        photoUrl: profile.photoUrl,
        role: role as UserRole,
        status: "pending",
      },
    });
    return toUser(record);
  }

  async listPending() {
    const records = await this.prisma.user.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
    });
    return records.map(toUser);
  }

  async approveEmployee(userId: string) {
    const record = await this.prisma.user.update({
      where: { id: userId },
      data: { status: "active", approvedAt: new Date() },
    });
    return toUser(record);
  }

  async approveStaff(userId: string) {
    const used = await this.prisma.user.findMany({
      where: { brandColor: { not: null } },
      select: { brandColor: true },
    });
    const brandColor = pickStaffBrandColor(
      used.map((u) => u.brandColor!).filter(Boolean),
    );

    const record = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: "active",
        approvedAt: new Date(),
        brandColor,
        availability: Availability.available,
        availabilityChangedAt: new Date(),
      },
    });
    return toUser(record);
  }

  async reject(userId: string) {
    const record = await this.prisma.user.update({
      where: { id: userId },
      data: { status: "rejected" },
    });
    return toUser(record);
  }

  async listActiveStaff() {
    const records = await this.prisma.user.findMany({
      where: { role: UserRole.staff, status: "active" },
      orderBy: { nameEn: "asc" },
    });
    return records.map(toUser);
  }

  async listActiveAdminIds(): Promise<string[]> {
    const records = await this.prisma.user.findMany({
      where: { role: UserRole.admin, status: "active" },
      select: { id: true },
    });
    return records.map((record) => record.id);
  }

  async updateAvailability(userId: string, status: Availability) {
    const record = await this.prisma.user.update({
      where: { id: userId },
      data: { availability: status, availabilityChangedAt: new Date() },
    });
    return toUser(record);
  }

  async updateLastAcceptedAt(userId: string, at: Date) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastAcceptedAt: at },
    });
  }
}
