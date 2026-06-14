import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { User } from "@office/shared";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { EmailService } from "../email/email.service";
import { PrismaService } from "../prisma/prisma.service";
import { SseService } from "../sse/sse.service";
import { UsersService } from "../users/users.service";

export interface StaffResponseStat {
  staffId: string;
  nameEn: string;
  avgMinutes: number;
  completedCount: number;
}

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminController {
  constructor(
    private readonly users: UsersService,
    private readonly sse: SseService,
    private readonly email: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  @Get("stats/response-time")
  async responseTimeStats(): Promise<StaffResponseStat[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const done = await this.prisma.request.findMany({
      where: { status: "done", doneAt: { gte: startOfDay }, doneById: { not: null } },
      select: { doneById: true, createdAt: true, doneAt: true, doneBy: { select: { nameEn: true } } },
    });

    const byStaff = new Map<string, { nameEn: string; totalMs: number; count: number }>();
    for (const r of done) {
      if (!r.doneById || !r.doneAt) continue;
      const ms = r.doneAt.getTime() - r.createdAt.getTime();
      const existing = byStaff.get(r.doneById);
      if (existing) {
        existing.totalMs += ms;
        existing.count += 1;
      } else {
        byStaff.set(r.doneById, { nameEn: r.doneBy?.nameEn ?? "", totalMs: ms, count: 1 });
      }
    }

    return Array.from(byStaff.entries()).map(([staffId, { nameEn, totalMs, count }]) => ({
      staffId,
      nameEn,
      avgMinutes: Math.round(totalMs / count / 60000),
      completedCount: count,
    }));
  }

  @Get("pending")
  pending(): Promise<User[]> {
    return this.users.listPending();
  }

  @Post("approve/:userId")
  async approve(@Param("userId") userId: string): Promise<User> {
    const user = await this.users.findById(userId);
    if (!user || user.status !== "pending") {
      throw new NotFoundException("Pending user not found");
    }

    const approved =
      user.role === "staff"
        ? await this.users.approveStaff(userId)
        : await this.users.approveEmployee(userId);

    this.sse.emit("user.approved", approved);
    void this.email.sendApprovalNotice(approved.email, approved.nameEn);
    return approved;
  }

  @Post("reject/:userId")
  async reject(@Param("userId") userId: string): Promise<User> {
    const user = await this.users.findById(userId);
    if (!user || user.status !== "pending") {
      throw new NotFoundException("Pending user not found");
    }
    const rejected = await this.users.reject(userId);
    this.sse.emit("user.rejected", rejected);
    void this.email.sendRejectionNotice(rejected.email, rejected.nameEn);
    return rejected;
  }
}
