import { BadRequestException } from "@nestjs/common";

export interface RequestPageCursor {
  createdAt: Date;
  id: string;
}

export function encodeRequestCursor(record: { createdAt: Date; id: string }): string {
  return Buffer.from(`${record.createdAt.toISOString()}|${record.id}`, "utf8").toString(
    "base64url",
  );
}

export function decodeRequestCursor(raw: string): RequestPageCursor {
  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    const sep = decoded.lastIndexOf("|");
    if (sep <= 0) throw new Error("invalid");
    const createdAt = new Date(decoded.slice(0, sep));
    const id = decoded.slice(sep + 1);
    if (Number.isNaN(createdAt.getTime()) || !id) throw new Error("invalid");
    return { createdAt, id };
  } catch {
    throw new BadRequestException("Invalid cursor");
  }
}
