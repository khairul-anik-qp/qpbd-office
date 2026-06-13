import { Module } from "@nestjs/common";
import { EmailModule } from "../email/email.module";
import { SseModule } from "../sse/sse.module";
import { UsersModule } from "../users/users.module";
import { AdminController } from "./admin.controller";

@Module({
  imports: [UsersModule, SseModule, EmailModule],
  controllers: [AdminController],
})
export class AdminModule {}
