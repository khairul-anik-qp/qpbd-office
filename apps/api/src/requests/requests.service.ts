import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { RequestStatus, UserRole } from "@prisma/client";
import type { CreateRequestResponse, Request, User } from "@office/shared";
import { isEmployeeRole, isVisibleToStaff } from "@office/shared";
import { AssignmentService } from "../assignment/assignment.service";
import { PrismaService } from "../prisma/prisma.service";
import { PushService } from "../push/push.service";
import { SseService } from "../sse/sse.service";
import { UsersService } from "../users/users.service";
import { toRequest } from "./request.mapper";
import type { CreateRequestDto } from "./dto/requests.dto";

@Injectable()
export class RequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly assignment: AssignmentService,
    private readonly sse: SseService,
    private readonly push: PushService,
  ) {}

  async listForUser(user: User): Promise<Request[]> {
    if (isEmployeeRole(user.role)) {
      const records = await this.prisma.request.findMany({
        where: { requesterId: user.id },
        orderBy: { createdAt: "desc" },
      });
      return records.map(toRequest);
    }

    // staff — server-side visibility (plan §6)
    const records = await this.prisma.request.findMany({
      where: {
        OR: [
          { status: "new", OR: [{ assigneeId: user.id }, { assigneeId: null }] },
          { status: "progress", acceptedById: user.id },
          { status: "done", doneById: user.id },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    return records.map(toRequest);
  }

  async create(user: User, dto: CreateRequestDto): Promise<CreateRequestResponse> {
    if (!isEmployeeRole(user.role) || user.status !== "active") {
      throw new ForbiddenException("Only active employees can create requests");
    }

    if (dto.assignee) {
      const target = await this.users.findById(dto.assignee);
      if (!target || target.role !== "staff" || target.status !== "active") {
        throw new BadRequestException("Invalid assignee");
      }
    }

    const routing = await this.assignment.route(dto.assignee ?? null);

    const record = await this.prisma.request.create({
      data: {
        type: dto.type,
        requester: user.nameEn,
        requesterId: user.id,
        note: dto.note?.trim() ?? "",
        urg: dto.urg ?? "normal",
        loc: dto.loc,
        assigneeId: routing.assignee,
        status: "new",
      },
    });

    const request = toRequest(record);
    this.sse.emit("request.created", request);
    void this.push.sendNewRequest(routing.pushTargets, request);

    const busyNotice = routing.busyNotice
      ? `All staffs are busy. ${routing.busyNotice.staffName} will pick your request once available`
      : undefined;

    return { request, busyNotice };
  }

  async accept(user: User, id: string): Promise<Request> {
    this.assertStaff(user);
    const record = await this.getRecordOrThrow(id);
    const current = toRequest(record);

    if (current.status !== "new") {
      throw new BadRequestException("Request is not in New status");
    }
    if (!isVisibleToStaff(current, user.id)) {
      throw new ForbiddenException("Request not visible to you");
    }

    const now = new Date();
    const updated = await this.prisma.request.update({
      where: { id },
      data: {
        status: RequestStatus.progress,
        acceptedById: user.id,
        acceptedAt: now,
        // Claim unassigned "anyone" requests on accept
        assigneeId: record.assigneeId ?? user.id,
      },
    });

    await this.users.updateLastAcceptedAt(user.id, now);

    const request = toRequest(updated);
    this.sse.emit("request.updated", request);
    return request;
  }

  async forward(user: User, id: string, targetStaffId: string): Promise<Request> {
    this.assertStaff(user);
    if (targetStaffId === user.id) {
      throw new BadRequestException("Cannot forward to yourself");
    }

    const target = await this.users.findById(targetStaffId);
    if (!target || target.role !== "staff" || target.status !== "active") {
      throw new BadRequestException("Invalid forward target");
    }

    const record = await this.getRecordOrThrow(id);
    const current = toRequest(record);

    if (current.status !== "new") {
      throw new BadRequestException("Only new requests can be forwarded");
    }
    if (!isVisibleToStaff(current, user.id)) {
      throw new ForbiddenException("Request not visible to you");
    }

    const updated = await this.prisma.request.update({
      where: { id },
      data: {
        assigneeId: targetStaffId,
        forwardedById: user.id,
        status: "new",
      },
    });

    const request = toRequest(updated);
    this.sse.emit("request.updated", request);
    void this.push.sendForwarded(targetStaffId, request);
    return request;
  }

  async complete(user: User, id: string): Promise<Request> {
    this.assertStaff(user);
    const record = await this.getRecordOrThrow(id);
    const current = toRequest(record);

    if (current.status !== "progress") {
      throw new BadRequestException("Request is not in progress");
    }
    if (current.acceptedBy !== user.id) {
      throw new ForbiddenException("Only the accepting staff can complete");
    }

    const now = new Date();
    const updated = await this.prisma.request.update({
      where: { id },
      data: {
        status: RequestStatus.done,
        doneById: user.id,
        doneAt: now,
      },
    });

    const request = toRequest(updated);
    this.sse.emit("request.updated", request);
    return request;
  }

  private assertStaff(user: User) {
    if (user.role !== "staff" || user.status !== "active") {
      throw new ForbiddenException("Staff only");
    }
  }

  private async getRecordOrThrow(id: string) {
    const record = await this.prisma.request.findUnique({ where: { id } });
    if (!record) throw new NotFoundException("Request not found");
    return record;
  }
}
