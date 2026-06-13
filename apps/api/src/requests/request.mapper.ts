import type { Request as PrismaRequest } from "@prisma/client";
import type { Request } from "@office/shared";

export function toRequest(record: PrismaRequest): Request {
  return {
    id: record.id,
    type: record.type,
    requester: record.requester,
    requesterId: record.requesterId,
    note: record.note,
    urg: record.urg,
    loc: record.loc,
    assignee: record.assigneeId,
    status: record.status,
    forwardedBy: record.forwardedById,
    acceptedBy: record.acceptedById,
    acceptedAt: record.acceptedAt?.toISOString() ?? null,
    doneBy: record.doneById,
    doneAt: record.doneAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
  };
}
