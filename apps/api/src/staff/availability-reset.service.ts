import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Availability, UserRole } from "@prisma/client";
import { SseService } from "../sse/sse.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AvailabilityResetService {
  private readonly logger = new Logger(AvailabilityResetService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly sse: SseService,
  ) {}

  /** Auto-reset stale `busy` staff to `available` (env-configurable timeout). */
  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    if (this.config.get<string>("STAFF_BUSY_AUTO_RESET_ENABLED") === "false") {
      return;
    }

    const minutes = Number(
      this.config.get<string>("STAFF_BUSY_AUTO_RESET_MINUTES") ?? 20,
    );
    if (!Number.isFinite(minutes) || minutes <= 0) return;

    const cutoff = new Date(Date.now() - minutes * 60_000);
    const stale = await this.prisma.user.findMany({
      where: {
        role: UserRole.staff,
        status: "active",
        availability: Availability.busy,
        OR: [
          { availabilityChangedAt: null },
          { availabilityChangedAt: { lte: cutoff } },
        ],
      },
      select: { id: true },
    });

    if (stale.length === 0) return;

    for (const member of stale) {
      await this.prisma.user.update({
        where: { id: member.id },
        data: {
          availability: Availability.available,
          availabilityChangedAt: new Date(),
        },
      });
      this.sse.emit("availability.changed", {
        staffId: member.id,
        status: "available",
        auto: true,
      });
    }

    this.logger.debug(`Auto-reset ${stale.length} busy staff to available`);
  }
}
