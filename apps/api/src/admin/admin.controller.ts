import {
  BadRequestException,
  Body,
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
import { ApproveStaffDto } from "../auth/dto/auth.dto";
import { UsersService } from "../users/users.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminController {
  constructor(private readonly users: UsersService) {}

  @Get("pending")
  pending(): Promise<User[]> {
    return this.users.listPending();
  }

  @Post("approve/:userId")
  async approve(
    @Param("userId") userId: string,
    @Body() body: ApproveStaffDto,
  ): Promise<User> {
    const user = await this.users.findById(userId);
    if (!user || user.status !== "pending") {
      throw new NotFoundException("Pending user not found");
    }

    if (user.role === "staff") {
      if (!body.nameBn?.trim()) {
        throw new BadRequestException("Bangla name is required for staff");
      }
      return this.users.approveStaff(userId, body.nameBn.trim());
    }

    return this.users.approveEmployee(userId);
  }

  @Post("reject/:userId")
  async reject(@Param("userId") userId: string): Promise<User> {
    const user = await this.users.findById(userId);
    if (!user || user.status !== "pending") {
      throw new NotFoundException("Pending user not found");
    }
    return this.users.reject(userId);
  }
}
