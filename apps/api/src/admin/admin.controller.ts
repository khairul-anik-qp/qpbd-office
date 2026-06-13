import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { User } from "@office/shared";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { EmailService } from "../email/email.service";
import { SseService } from "../sse/sse.service";
import { UsersService } from "../users/users.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminController {
  constructor(
    private readonly users: UsersService,
    private readonly sse: SseService,
    private readonly email: EmailService,
  ) {}

  @Get("pending")
  pending(): Promise<User[]> {
    return this.users.listPending();
  }

  @Post("approve/:userId")
  async approve(@Param("userId") userId: string): Promise<User> {
    const user = await this.users.findById(userId);
    if (!user || user.status !== "pending") {
      throw new NotFoundException("Pending user not found");
    }

    const approved =
      user.role === "staff"
        ? await this.users.approveStaff(userId)
        : await this.users.approveEmployee(userId);

    this.sse.emit("user.approved", approved);
    void this.email.sendApprovalNotice(approved.email, approved.nameEn);
    return approved;
  }

  @Post("reject/:userId")
  async reject(@Param("userId") userId: string): Promise<User> {
    const user = await this.users.findById(userId);
    if (!user || user.status !== "pending") {
      throw new NotFoundException("Pending user not found");
    }
    const rejected = await this.users.reject(userId);
    this.sse.emit("user.rejected", rejected);
    void this.email.sendRejectionNotice(rejected.email, rejected.nameEn);
    return rejected;
  }
}
