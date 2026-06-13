import { Module } from "@nestjs/common";
import { SseModule } from "../sse/sse.module";
import { UsersModule } from "../users/users.module";
import { AvailabilityResetService } from "./availability-reset.service";
import { StaffController } from "./staff.controller";

@Module({
  imports: [UsersModule, SseModule],
  controllers: [StaffController],
  providers: [AvailabilityResetService],
})
export class StaffModule {}
