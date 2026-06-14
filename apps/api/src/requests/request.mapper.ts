import type { Request as PrismaRequest, User as PrismaUser } from "@prisma/client";
import type { Request } from "@office/shared";
import { staffFirstName } from "@office/shared";

type RequestRecord = PrismaRequest & { assignee?: PrismaUser | null };

export function toRequest(record: RequestRecord): Request {
  return {
    id: record.id,
    type: record.type,
    requester: record.requester,
    requesterId: record.requesterId,
    note: record.note,
    urg: record.urg,
    loc: record.loc,
    assignee: record.assigneeId,
    assigneeName: record.assignee?.nameEn
      ? staffFirstName(record.assignee.nameEn)
      : null,
    status: record.status,
    isFavorite: record.isFavorite,
    forwardedBy: record.forwardedById,
    acceptedBy: record.acceptedById,
    acceptedAt: record.acceptedAt?.toISOString() ?? null,
    doneBy: record.doneById,
    doneAt: record.doneAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
  };
}
