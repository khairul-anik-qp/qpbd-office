import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";
import type { GoogleProfile } from "../users/users.service";

@Injectable()
export class GoogleAuthService {
  private readonly client: OAuth2Client;

  constructor(private readonly config: ConfigService) {
    this.client = new OAuth2Client(this.config.get<string>("GOOGLE_CLIENT_ID"));
  }

  async verifyCredential(credential: string): Promise<GoogleProfile> {
    const clientId = this.config.get<string>("GOOGLE_CLIENT_ID");
    if (!clientId) {
      throw new Error("GOOGLE_CLIENT_ID is not configured");
    }

    const ticket = await this.client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new Error("Invalid Google token");
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      nameEn: payload.name ?? payload.email,
      photoUrl: payload.picture,
    };
  }
}
