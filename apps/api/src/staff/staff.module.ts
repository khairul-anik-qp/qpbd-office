import { Module } from "@nestjs/common";
import { SseModule } from "../sse/sse.module";
import { UsersModule } from "../users/users.module";
import { StaffController } from "./staff.controller";

@Module({
  imports: [UsersModule, SseModule],
  controllers: [StaffController],
})
export class StaffModule {}
