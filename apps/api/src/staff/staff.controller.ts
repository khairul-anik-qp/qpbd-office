import { Body, Controller, ForbiddenException, Get, Patch, UseGuards } from "@nestjs/common";
import { IsIn } from "class-validator";
import type { Availability, User } from "@office/shared";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { SseService } from "../sse/sse.service";
import { UsersService } from "../users/users.service";

class UpdateAvailabilityDto {
  @IsIn(["available", "busy", "away"] satisfies readonly Availability[])
  status!: Availability;
}

@Controller("staff")
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(
    private readonly users: UsersService,
    private readonly sse: SseService,
  ) {}

  /** Active office helpers — office team card + create-modal assign-to. */
  @Get()
  listActive() {
    return this.users.listActiveStaff();
  }

  @Patch("availability")
  async updateAvailability(
    @CurrentUser() user: User,
    @Body() dto: UpdateAvailabilityDto,
  ): Promise<User> {
    if (user.role !== "staff" || user.status !== "active") {
      throw new ForbiddenException("Staff only");
    }
    const updated = await this.users.updateAvailability(user.id, dto.status);
    this.sse.emit("availability.changed", {
      staffId: updated.id,
      status: updated.availability!,
    });
    return updated;
  }
}
