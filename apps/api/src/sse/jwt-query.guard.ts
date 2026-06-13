import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { JwtPayload } from "@office/shared";

type ReqWithUser = {
  query: Record<string, string | string[] | undefined>;
  headers: { authorization?: string };
  user?: JwtPayload;
};

/** Authenticate SSE via ?token= query param (EventSource cannot set headers). */
@Injectable()
export class JwtQueryGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<ReqWithUser>();
    const token =
      (typeof req.query.token === "string" ? req.query.token : null) ??
      req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      throw new UnauthorizedException("Missing token");
    }

    try {
      const payload = this.jwt.verify<JwtPayload>(token, {
        secret: this.config.get<string>("JWT_SECRET") ?? "dev-secret",
      });
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
