import type {
  AuthResponse,
  Availability,
  CreateRequestDto,
  CreateRequestResponse,
  ForwardRequestDto,
  GoogleAuthResult,
  RegisterDto,
  Request,
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

  listStaff(): Promise<User[]> {
    return request("/staff");
  },

  listRequests(): Promise<Request[]> {
    return request("/requests");
  },

  createRequest(dto: CreateRequestDto): Promise<CreateRequestResponse> {
    return request("/requests", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  acceptRequest(id: string): Promise<Request> {
    return request(`/requests/${id}/accept`, { method: "POST" });
  },

  forwardRequest(id: string, dto: ForwardRequestDto): Promise<Request> {
    return request(`/requests/${id}/forward`, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  completeRequest(id: string): Promise<Request> {
    return request(`/requests/${id}/complete`, { method: "POST" });
  },

  setAvailability(status: Availability): Promise<User> {
    return request("/staff/availability", {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  pushSubscribe(dto: import("@office/shared").PushSubscribeDto): Promise<{ ok: true }> {
    return request("/push/subscribe", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },
};

export { isNeedsRegistration };
