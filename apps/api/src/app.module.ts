import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AdminModule } from "./admin/admin.module";
import { AssignmentModule } from "./assignment/assignment.module";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RequestsModule } from "./requests/requests.module";
import { SseModule } from "./sse/sse.module";
import { StaffModule } from "./staff/staff.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../../.env"],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    AdminModule,
    StaffModule,
    AssignmentModule,
    RequestsModule,
    SseModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
