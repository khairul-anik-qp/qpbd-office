import type {
  AuthResponse,
  GoogleAuthResult,
  RegisterDto,
  User,
} from "@office/shared";
import { isNeedsRegistration } from "@office/shared";

const TOKEN_KEY = "office_token";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`/api${path}`, { ...init, headers });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message ?? message;
      if (Array.isArray(message)) message = message.join(", ");
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  googleAuth(credential: string): Promise<GoogleAuthResult> {
    return request("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
  },

  register(dto: RegisterDto): Promise<AuthResponse> {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  me(): Promise<User> {
    return request("/auth/me");
  },

  listPending(): Promise<User[]> {
    return request("/admin/pending");
  },

  approve(userId: string, nameBn?: string): Promise<User> {
    return request(`/admin/approve/${userId}`, {
      method: "POST",
      body: JSON.stringify(nameBn ? { nameBn } : undefined),
    });
  },

  reject(userId: string): Promise<User> {
    return request(`/admin/reject/${userId}`, {
      method: "POST",
    });
  },
};

export { isNeedsRegistration };
