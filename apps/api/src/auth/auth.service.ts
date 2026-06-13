import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { JwtPayload, User } from "@office/shared";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  signToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
    return this.jwt.sign(payload);
  }

  get expiresIn(): string {
    return this.config.get<string>("JWT_EXPIRES_IN") ?? "7d";
  }
}
