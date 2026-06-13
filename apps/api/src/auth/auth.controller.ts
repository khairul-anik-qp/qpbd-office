import {
  Body,
  ConflictException,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import type { GoogleAuthResult, User } from "@office/shared";
import { AuthService } from "./auth.service";
import { GoogleAuthDto, RegisterDto } from "./dto/auth.dto";
import { GoogleAuthService } from "./google-auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { PushService } from "../push/push.service";
import { UsersService } from "../users/users.service";
import { SseService } from "../sse/sse.service";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly googleAuth: GoogleAuthService,
    private readonly users: UsersService,
    private readonly auth: AuthService,
    private readonly sse: SseService,
    private readonly push: PushService,
  ) {}

  @Post("google")
  async google(@Body() dto: GoogleAuthDto): Promise<GoogleAuthResult> {
    let profile;
    try {
      profile = await this.googleAuth.verifyCredential(dto.credential);
    } catch (err) {
      this.logger.warn(
        `Google credential verification failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new UnauthorizedException("Invalid Google credential");
    }

    const existing = await this.users.findByGoogleId(profile.googleId);
    if (existing) {
      if (existing.status === "rejected") {
        return {
          needsRegistration: true,
          profile: {
            email: profile.email,
            nameEn: profile.nameEn,
            photoUrl: profile.photoUrl,
          },
        };
      }
      return { token: this.auth.signToken(existing), user: existing };
    }

    if (this.users.isBootstrapAdmin(profile.email)) {
      const admin = await this.users.createBootstrapAdmin(profile);
      return { token: this.auth.signToken(admin), user: admin };
    }

    return {
      needsRegistration: true,
      profile: {
        email: profile.email,
        nameEn: profile.nameEn,
        photoUrl: profile.photoUrl,
      },
    };
  }

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    let profile;
    try {
      profile = await this.googleAuth.verifyCredential(dto.credential);
    } catch {
      throw new UnauthorizedException("Invalid Google credential");
    }

    if (this.users.isBootstrapAdmin(profile.email)) {
      const existing = await this.users.findByGoogleId(profile.googleId);
      if (existing) {
        return { token: this.auth.signToken(existing), user: existing };
      }
      const admin = await this.users.createBootstrapAdmin(profile);
      return { token: this.auth.signToken(admin), user: admin };
    }

    try {
      const user = await this.users.register(profile, dto.role);
      this.sse.emit("user.registered", user);
      void this.notifyAdminsOfSignup(user);
      return { token: this.auth.signToken(user), user };
    } catch (err) {
      if (err instanceof Error && err.message === "ALREADY_ACTIVE") {
        throw new ConflictException("Account is already active");
      }
      throw err;
    }
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Req() req: { user: User }) {
    return req.user;
  }

  private async notifyAdminsOfSignup(user: User) {
    const adminIds = await this.users.listActiveAdminIds();
    if (adminIds.length === 0) return;
    await this.push.sendSignupPending(adminIds, user);
  }
}
