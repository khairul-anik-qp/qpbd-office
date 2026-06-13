import type { User, UserRole } from "./types.js";

/** JWT claims stored server-side and echoed in /auth/me routing. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  status: User["status"];
}

/** POST /auth/google — exchange Google ID token. */
export interface GoogleAuthDto {
  credential: string;
}

/** POST /auth/register — choose role after first Google sign-in. */
export interface RegisterDto {
  credential: string;
  role: "employee" | "staff";
}

export interface AuthResponse {
  token: string;
  user: User;
}

/** Returned when Google account is new and not a bootstrap admin. */
export interface NeedsRegistrationResponse {
  needsRegistration: true;
  profile: {
    email: string;
    nameEn: string;
    photoUrl?: string;
  };
}

export type GoogleAuthResult = AuthResponse | NeedsRegistrationResponse;

export function isNeedsRegistration(
  result: GoogleAuthResult,
): result is NeedsRegistrationResponse {
  return "needsRegistration" in result && result.needsRegistration === true;
}
