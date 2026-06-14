// Domain types — persisted in PostgreSQL, shared by web + api.
// Source: plan.md §4 (User), §5 (Request).

export type UserRole = "employee" | "staff" | "admin";
export type UserStatus = "pending" | "active" | "rejected";
export type Availability = "available" | "busy" | "away";

export type RequestType = "tea" | "snack" | "supply" | "printer" | "help" | "other";
export type Urgency = "normal" | "urgent";
export type RequestStatus = "new" | "progress" | "done" | "discarded";

export interface User {
  id: string;
  googleId: string;
  email: string;
  nameEn: string;
  nameBn?: string;
  photoUrl?: string;
  role: UserRole;
  status: UserStatus;
  /** staff only — randomly assigned on approve */
  brandColor?: string;
  /** staff only */
  availability?: Availability;
  /** staff only — for fair routing (oldest wins) */
  lastAcceptedAt?: string | null;
  createdAt: string;
  approvedAt?: string | null;
}

export interface Request {
  id: string;
  type: RequestType;
  /** requester display name */
  requester: string;
  requesterId: string;
  /** free text + comma-separated quick-option tokens */
  note: string;
  urg: Urgency;
  /** location id (see LOCATIONS) */
  loc: string;
  /** staff id, or null = "anyone available" */
  assignee: string | null;
  /** assignee first name — denormalized for employee UI */
  assigneeName?: string | null;
  status: RequestStatus;
  /** staff id who forwarded */
  forwardedBy?: string | null;
  acceptedBy?: string | null;
  acceptedAt?: string | null;
  doneBy?: string | null;
  doneAt?: string | null;
  createdAt: string;
}
