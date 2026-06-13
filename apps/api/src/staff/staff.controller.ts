import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UsersService } from "../users/users.service";

@Controller("staff")
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(private readonly users: UsersService) {}

  /** Active office helpers — office team card + create-modal assign-to (Phase 2). */
  @Get()
  listActive() {
    return this.users.listActiveStaff();
  }
}
