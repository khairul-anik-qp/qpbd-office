import type {
  AuthResponse,
  Availability,
  CreateRequestDto,
  CreateRequestResponse,
  ForwardRequestDto,
  GoogleAuthResult,
  ListRequestsPage,
  ListRequestsParams,
  RegisterDto,
  Request,
  User,
} from "@office/shared";
import { REQUESTS_PAGE_SIZE } from "@office/shared";
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
  const isPublicAuth = path === "/auth/google" || path === "/auth/register";
  if (token && !isPublicAuth) headers.set("Authorization", `Bearer ${token}`);

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

  approve(userId: string): Promise<User> {
    return request(`/admin/approve/${userId}`, {
      method: "POST",
    });
  },

  reject(userId: string): Promise<User> {
    return request(`/admin/reject/${userId}`, {
      method: "POST",
    });
  },

  getResponseTimeStats(): Promise<
    { staffId: string; nameEn: string; avgMinutes: number; completedCount: number }[]
  > {
    return request("/admin/stats/response-time");
  },

  listStaff(): Promise<User[]> {
    return request("/staff");
  },

  listRequests(): Promise<Request[]> {
    return request("/requests");
  },

  listRequestPage(params: ListRequestsParams = {}): Promise<ListRequestsPage> {
    const qs = new URLSearchParams();
    qs.set("limit", String(params.limit ?? REQUESTS_PAGE_SIZE));
    if (params.cursor) qs.set("cursor", params.cursor);
    if (params.status) qs.set("status", params.status);
    if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
    return request(`/requests?${qs}`);
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

  cancelRequest(id: string): Promise<Request> {
    return request(`/requests/${id}/cancel`, { method: "POST" });
  },

  setFavorite(id: string, value: boolean): Promise<Request> {
    return request(`/requests/${id}/favorite`, {
      method: "PATCH",
      body: JSON.stringify({ value }),
    });
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
