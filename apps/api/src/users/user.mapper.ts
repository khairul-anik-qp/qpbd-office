import type { User as PrismaUser } from "@prisma/client";
import type { User } from "@office/shared";

export function toUser(record: PrismaUser): User {
  return {
    id: record.id,
    googleId: record.googleId,
    email: record.email,
    nameEn: record.nameEn,
    nameBn: record.nameBn ?? undefined,
    photoUrl: record.photoUrl ?? undefined,
    role: record.role,
    status: record.status,
    brandColor: record.brandColor ?? undefined,
    availability: record.availability ?? undefined,
    lastAcceptedAt: record.lastAcceptedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    approvedAt: record.approvedAt?.toISOString() ?? null,
  };
}
