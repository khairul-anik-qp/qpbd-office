import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { RequestStatus } from "@prisma/client";
import { getStaffOperatingWindow, OFFICE_TIMEZONE } from "@office/shared";
import { PrismaService } from "../prisma/prisma.service";
import { SseService } from "../sse/sse.service";
import { toRequest } from "./request.mapper";

const REQUEST_INCLUDE = { assignee: true } as const;

@Injectable()
export class RequestExpiryService {
  private readonly logger = new Logger(RequestExpiryService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly sse: SseService,
  ) {}

  /** Auto-discard open requests at midnight office-local (closes out the prior 8 AM–10 PM window). */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: OFFICE_TIMEZONE })
  async discardStaleRequests() {
    if (this.config.get<string>("REQUEST_AUTO_DISCARD_ENABLED") === "false") {
      return;
    }

    const timeZone = this.config.get<string>("OFFICE_TIMEZONE") ?? OFFICE_TIMEZONE;
    const { start, end } = getStaffOperatingWindow(new Date(), timeZone);
    const stale = await this.prisma.request.findMany({
      where: {
        status: { in: [RequestStatus.new, RequestStatus.progress] },
        createdAt: { gte: start, lte: end },
      },
      include: REQUEST_INCLUDE,
    });

    if (stale.length === 0) return;

    for (const record of stale) {
      const updated = await this.prisma.request.update({
        where: { id: record.id },
        data: { status: RequestStatus.discarded },
        include: REQUEST_INCLUDE,
      });
      this.sse.emit("request.updated", toRequest(updated));
    }

    this.logger.debug(`Auto-discarded ${stale.length} request(s) from ended operating window`);
  }
}
