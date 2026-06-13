import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import type { User } from "@office/shared";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { PushSubscribeDto } from "./dto/push.dto";
import { PushService } from "./push.service";

@Controller("push")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("staff", "admin")
export class PushController {
  constructor(private readonly push: PushService) {}

  @Post("subscribe")
  async subscribe(
    @CurrentUser() user: User,
    @Body() dto: PushSubscribeDto,
  ): Promise<{ ok: true }> {
    await this.push.subscribe(
      user.id,
      dto.endpoint,
      dto.keys.p256dh,
      dto.keys.auth,
    );
    return { ok: true };
  }
}
