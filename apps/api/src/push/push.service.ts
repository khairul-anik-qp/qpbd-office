import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { PushPayload, Request, User } from "@office/shared";
import { TYPES } from "@office/shared";
import * as webpush from "web-push";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private enabled = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    const publicKey = this.config.get<string>("VAPID_PUBLIC_KEY");
    const privateKey = this.config.get<string>("VAPID_PRIVATE_KEY");
    const subject = this.vapidSubject();

    if (!publicKey || !privateKey) {
      this.logger.warn("VAPID keys not configured — push notifications disabled");
      return;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    this.enabled = true;
    this.logger.log("Web Push (FCM) configured");
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /** web-push requires an https: or mailto: subject — not http:// localhost. */
  private vapidSubject(): string {
    const explicit = this.config.get<string>("VAPID_SUBJECT");
    if (explicit) return explicit;

    const appUrl = this.config.get<string>("APP_URL");
    if (appUrl?.startsWith("https://")) return appUrl;

    return "mailto:admin@questionpro.com";
  }

  async subscribe(userId: string, endpoint: string, p256dh: string, auth: string) {
    await this.prisma.pushSubscription.upsert({
      where: { userId_endpoint: { userId, endpoint } },
      create: { userId, endpoint, p256dh, auth },
      update: { p256dh, auth },
    });
  }

  /** High urgency wakes mobile devices for instant staff alerts; reminders stay normal. */
  private deliveryOptions(payload: PushPayload): webpush.RequestOptions {
    const instant =
      payload.type === "request.new" || payload.type === "request.forwarded";
    return {
      urgency: instant ? "high" : "normal",
      TTL: instant ? 60 : 86_400,
    };
  }

  async sendToStaff(staffIds: string[], payload: PushPayload): Promise<void> {
    if (!this.enabled || staffIds.length === 0) return;

    const subs = await this.prisma.pushSubscription.findMany({
      where: { userId: { in: staffIds } },
    });
    if (subs.length === 0) return;

    const body = payload.bodyBn
      ? `${payload.bodyBn} · ${payload.bodyEn ?? ""}`
      : undefined;

    const notification = JSON.stringify({
      title: `${payload.titleBn} · ${payload.titleEn}`,
      body,
      ...payload,
    });
    const options = this.deliveryOptions(payload);

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            notification,
            options,
          );
        } catch (err: unknown) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            await this.prisma.pushSubscription.delete({ where: { id: sub.id } });
          } else {
            this.logger.warn(`Push failed for ${sub.userId}: ${String(err)}`);
          }
        }
      }),
    );
  }

  async sendNewRequest(staffIds: string[], request: Request): Promise<void> {
    const ty = TYPES[request.type];
    await this.sendToStaff(staffIds, {
      type: "request.new",
      requestId: request.id,
      urg: request.urg,
      titleBn: "নতুন অনুরোধ",
      titleEn: "New request",
      bodyBn: `${ty.bn} — ${request.loc}`,
      bodyEn: `${ty.en} — ${request.loc}`,
    });
  }

  async sendForwarded(staffId: string, request: Request): Promise<void> {
    const ty = TYPES[request.type];
    await this.sendToStaff([staffId], {
      type: "request.forwarded",
      requestId: request.id,
      urg: request.urg,
      titleBn: "ফরওয়ার্ড করা অনুরোধ",
      titleEn: "Forwarded request",
      bodyBn: `${ty.bn} — ${request.loc}`,
      bodyEn: `${ty.en} — ${request.loc}`,
    });
  }

  async sendReminder(staffId: string, count: number): Promise<void> {
    await this.sendToStaff([staffId], {
      type: "request.reminder",
      count,
      titleBn: "নতুন অনুরোধ অপেক্ষমান",
      titleEn: "New requests waiting",
      bodyBn: `${count}টি অনুরোধ`,
      bodyEn: `${count} request(s) in your New list`,
    });
  }

  async sendSignupPending(adminIds: string[], user: User): Promise<void> {
    const roleEn = user.role === "staff" ? "Staff" : "Employee";
    await this.sendToStaff(adminIds, {
      type: "signup.pending",
      titleBn: "নতুন সাইন-আপ",
      titleEn: "New sign-up",
      bodyBn: `${user.nameEn} — ${roleEn}`,
      bodyEn: `${user.nameEn} — ${roleEn}`,
    });
  }
}
