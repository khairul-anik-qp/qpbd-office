import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RequestStatus, type Prisma } from "@prisma/client";
import type { CreateRequestResponse, ListRequestsPage, Request, User } from "@office/shared";
import {
  getStaffOperatingWindow,
  isEmployeeRole,
  isVisibleToStaff,
  OFFICE_TIMEZONE,
} from "@office/shared";
import { AssignmentService } from "../assignment/assignment.service";
import { PrismaService } from "../prisma/prisma.service";
import { PushService } from "../push/push.service";
import { SseService } from "../sse/sse.service";
import { UsersService } from "../users/users.service";
import { toRequest } from "./request.mapper";
import type { CreateRequestDto, ListRequestsQueryDto } from "./dto/requests.dto";
import { decodeRequestCursor, encodeRequestCursor } from "./request-cursor";

const REQUEST_INCLUDE = { assignee: true } as const;

@Injectable()
export class RequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly assignment: AssignmentService,
    private readonly sse: SseService,
    private readonly push: PushService,
    private readonly config: ConfigService,
  ) {}

  private get officeTimezone(): string {
    return this.config.get<string>("OFFICE_TIMEZONE") ?? OFFICE_TIMEZONE;
  }

  private staffOperatingWindowWhere(): Prisma.RequestWhereInput {
    const { start, end } = getStaffOperatingWindow(new Date(), this.officeTimezone);
    return { createdAt: { gte: start, lte: end } };
  }

  private withStaffShift(
    user: User,
    where: Prisma.RequestWhereInput,
  ): Prisma.RequestWhereInput {
    if (user.role !== "staff") return where;
    return { AND: [this.staffOperatingWindowWhere(), where] };
  }

  async listForUser(
    user: User,
    query?: ListRequestsQueryDto,
  ): Promise<Request[] | ListRequestsPage> {
    if (!query?.limit) {
      return this.listAllForUser(user);
    }
    return this.listPageForUser(user, query);
  }

  private async listAllForUser(user: User): Promise<Request[]> {
    const where = this.buildVisibilityWhere(user);
    const records = await this.prisma.request.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: REQUEST_INCLUDE,
    });
    return records.map(toRequest);
  }

  private async listPageForUser(
    user: User,
    query: ListRequestsQueryDto,
  ): Promise<ListRequestsPage> {
    const limit = query.limit!;
    const baseWhere = this.buildVisibilityWhere(user, query.status);
    const cursorFilter = this.buildCursorFilter(query.cursor);
    const where: Prisma.RequestWhereInput = {
      AND: [baseWhere, ...(cursorFilter ? [cursorFilter] : [])],
    };

    const [total, records] = await Promise.all([
      this.prisma.request.count({ where: baseWhere }),
      this.prisma.request.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit + 1,
        include: REQUEST_INCLUDE,
      }),
    ]);

    const hasMore = records.length > limit;
    const page = hasMore ? records.slice(0, limit) : records;
    const last = page.at(-1);

    return {
      items: page.map(toRequest),
      nextCursor: hasMore && last ? encodeRequestCursor(last) : null,
      total,
    };
  }

  private buildVisibilityWhere(
    user: User,
    status?: ListRequestsQueryDto["status"],
  ): Prisma.RequestWhereInput {
    if (isEmployeeRole(user.role)) {
      return {
        requesterId: user.id,
        ...(status ? { status } : {}),
      };
    }

    if (status === "new") {
      return this.withStaffShift(user, {
        status: "new",
        AND: [
          { OR: [{ forwardedById: null }, { forwardedById: { not: user.id } }] },
          { OR: [{ assigneeId: user.id }, { assigneeId: null }] },
        ],
      });
    }
    if (status === "progress") {
      return this.withStaffShift(user, { status: "progress", acceptedById: user.id });
    }
    if (status === "done") {
      return this.withStaffShift(user, { status: "done", doneById: user.id });
    }

    return this.withStaffShift(user, {
      OR: [
        {
          status: "new",
          AND: [
            { OR: [{ forwardedById: null }, { forwardedById: { not: user.id } }] },
            { OR: [{ assigneeId: user.id }, { assigneeId: null }] },
          ],
        },
        { status: "progress", acceptedById: user.id },
        { status: "done", doneById: user.id },
      ],
    });
  }

  private buildCursorFilter(cursor?: string): Prisma.RequestWhereInput | null {
    if (!cursor) return null;
    const decoded = decodeRequestCursor(cursor);
    return {
      OR: [
        { createdAt: { lt: decoded.createdAt } },
        { createdAt: decoded.createdAt, id: { lt: decoded.id } },
      ],
    };
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
      include: REQUEST_INCLUDE,
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
      throw new BadRequestException(
        current.status === "progress"
          ? "Another staff member already accepted this request"
          : "Request is not in New status",
      );
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
      include: REQUEST_INCLUDE,
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
    if (current.forwardedBy && current.forwardedBy === targetStaffId) {
      throw new BadRequestException("Cannot forward back to the staff who forwarded this request");
    }

    const updated = await this.prisma.request.update({
      where: { id },
      data: {
        assigneeId: targetStaffId,
        forwardedById: user.id,
        status: RequestStatus.new,
      },
      include: REQUEST_INCLUDE,
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
      include: REQUEST_INCLUDE,
    });

    const request = toRequest(updated);
    this.sse.emit("request.updated", request);
    return request;
  }

  async cancel(user: User, id: string): Promise<Request> {
    if (!isEmployeeRole(user.role)) {
      throw new ForbiddenException("Only employees can cancel requests");
    }
    const record = await this.getRecordOrThrow(id);
    const current = toRequest(record);
    if (current.requesterId !== user.id) {
      throw new ForbiddenException("You can only cancel your own requests");
    }
    if (current.status !== "new") {
      throw new ConflictException("Only new requests can be cancelled");
    }
    const updated = await this.prisma.request.update({
      where: { id },
      data: { status: RequestStatus.discarded },
      include: REQUEST_INCLUDE,
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
    const record = await this.prisma.request.findUnique({
      where: { id },
      include: REQUEST_INCLUDE,
    });
    if (!record) throw new NotFoundException("Request not found");
    return record;
  }
}
