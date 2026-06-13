import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SseController } from "./sse.controller";
import { SseService } from "./sse.service";
import { JwtQueryGuard } from "./jwt-query.guard";

@Module({
  imports: [AuthModule],
  controllers: [SseController],
  providers: [SseService, JwtQueryGuard],
  exports: [SseService],
})
export class SseModule {}
