import { Module } from "@nestjs/common";
import { AssignmentModule } from "../assignment/assignment.module";
import { PushModule } from "../push/push.module";
import { SseModule } from "../sse/sse.module";
import { UsersModule } from "../users/users.module";
import { RequestsController } from "./requests.controller";
import { RequestsService } from "./requests.service";

@Module({
  imports: [UsersModule, AssignmentModule, SseModule, PushModule],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
