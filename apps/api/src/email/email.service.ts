import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendApprovalNotice(email: string, nameEn: string): Promise<void> {
    const apiKey = this.config.get<string>("RESEND_API_KEY");
    const appUrl = this.config.get<string>("APP_URL") ?? "https://requests.questionpro.com";
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
          to: email,
          subject: "You're approved — QuestionPro Office Requests",
          html: `<p>Hi ${nameEn},</p>
<p>Your sign-up request has been approved. You can sign in at <a href="${appUrl}">${appUrl}</a>.</p>
<p>— QuestionPro Office</p>`,
        }),
      });
      if (!res.ok) {
        this.logger.warn(`Approval email failed for ${email}: ${res.status}`);
      }
    } catch (err) {
      this.logger.warn(`Approval email error for ${email}: ${String(err)}`);
    }
  }
}
