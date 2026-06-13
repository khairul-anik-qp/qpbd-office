import { Module } from "@nestjs/common";
import { PushModule } from "../push/push.module";
import { ReminderService } from "./reminder.service";

@Module({
  imports: [PushModule],
  providers: [ReminderService],
})
export class RemindersModule {}
