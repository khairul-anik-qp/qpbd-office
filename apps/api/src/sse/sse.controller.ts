import { Controller, Get, Req, Sse, UnauthorizedException, UseGuards } from "@nestjs/common";
import type { JwtPayload } from "@office/shared";
import { SseService } from "./sse.service";
import { JwtQueryGuard } from "./jwt-query.guard";

@Controller("sse")
export class SseController {
  constructor(private readonly sse: SseService) {}

  @Get("events")
  @Sse("events")
  @UseGuards(JwtQueryGuard)
  events(@Req() req: { user?: JwtPayload }) {
    if (!req.user?.sub) {
      throw new UnauthorizedException();
    }
    return this.sse.userStream(req.user.sub);
  }
}
