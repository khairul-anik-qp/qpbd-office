import { Module } from "@nestjs/common";
import { SseModule } from "../sse/sse.module";
import { UsersModule } from "../users/users.module";
import { AdminController } from "./admin.controller";

@Module({
  imports: [UsersModule, SseModule],
  controllers: [AdminController],
})
export class AdminModule {}
