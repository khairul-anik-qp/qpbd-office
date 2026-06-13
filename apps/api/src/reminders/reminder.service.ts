import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { countNewForStaff } from "@office/shared";
import { PushService } from "../push/push.service";
import { PrismaService } from "../prisma/prisma.service";
import { toRequest } from "../requests/request.mapper";

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly push: PushService,
  ) {}

  /** Plan §8 — scan every N minutes while New-tab items exist (env-configurable). */
  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    if (!this.isDue()) return;

    const hasNewRequests = await this.prisma.request.count({
      where: { status: "new" },
    });
    if (hasNewRequests === 0) return;

    this.lastRun = Date.now();
    await this.scan();
  }

  private lastRun = 0;

  private isDue(): boolean {
    if (this.config.get<string>("STAFF_REMINDER_ENABLED") === "false") {
      return false;
    }
    const intervalMin = Number(
      this.config.get<string>("STAFF_REMINDER_INTERVAL_MINUTES") ?? 5,
    );
    const intervalMs = intervalMin * 60_000;
    return Date.now() - this.lastRun >= intervalMs;
  }

  async scan(): Promise<void> {
    if (!this.push.isEnabled()) return;

    const staff = await this.prisma.user.findMany({
      where: { role: "staff", status: "active", availability: "available" },
    });
    if (staff.length === 0) return;

    const newRequests = await this.prisma.request.findMany({
      where: { status: "new" },
    });
    const requests = newRequests.map(toRequest);

    for (const member of staff) {
      const count = countNewForStaff(requests, member.id);
      if (count > 0) {
        await this.push.sendReminder(member.id, count);
      }
    }

    this.logger.debug(`Reminder scan: ${staff.length} staff checked`);
  }
}
