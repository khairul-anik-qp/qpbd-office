import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { AssignmentService } from "./assignment.service";

@Module({
  imports: [UsersModule],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
