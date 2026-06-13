import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendApprovalNotice(email: string, nameEn: string): Promise<void> {
    await this.sendNotice({
      email,
      subject: "You're approved — QuestionPro Office Requests",
      html: `<p>Hi ${nameEn},</p>
<p>Your sign-up request has been approved. You can sign in at <a href="${this.appUrl()}">${this.appUrl()}</a>.</p>
<p>— QuestionPro Office</p>`,
      failureLabel: "Approval",
    });
  }

  async sendRejectionNotice(email: string, nameEn: string): Promise<void> {
    await this.sendNotice({
      email,
      subject: "Sign-up not approved — QuestionPro Office Requests",
      html: `<p>Hi ${nameEn},</p>
<p>Your sign-up request was not approved. You can sign in again at <a href="${this.appUrl()}">${this.appUrl()}</a> to submit a new request.</p>
<p>— QuestionPro Office</p>`,
      failureLabel: "Rejection",
    });
  }

  private appUrl(): string {
    return this.config.get<string>("APP_URL") ?? "https://requests.questionpro.com";
  }

  private async sendNotice(opts: {
    email: string;
    subject: string;
    html: string;
    failureLabel: string;
  }): Promise<void> {
    const apiKey = this.config.get<string>("RESEND_API_KEY");
    const from =
      this.config.get<string>("RESEND_FROM") ??
      "Office Requests <noreply@questionpro.com>";
    if (!apiKey) return;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: opts.email,
          subject: opts.subject,
          html: opts.html,
        }),
      });
      if (!res.ok) {
        this.logger.warn(`${opts.failureLabel} email failed for ${opts.email}: ${res.status}`);
      }
    } catch (err) {
      this.logger.warn(`${opts.failureLabel} email error for ${opts.email}: ${String(err)}`);
    }
  }
}
