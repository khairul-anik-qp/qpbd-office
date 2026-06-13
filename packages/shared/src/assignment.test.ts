import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveAssignment } from "./assignment.js";
import type { User } from "./types.js";

function staff(
  id: string,
  availability: User["availability"],
  lastAcceptedAt?: string | null,
  nameEn = id,
): User {
  return {
    id,
    googleId: `g-${id}`,
    email: `${id}@test.com`,
    nameEn,
    role: "staff",
    status: "active",
    availability,
    lastAcceptedAt: lastAcceptedAt ?? null,
    createdAt: new Date().toISOString(),
  };
}

describe("resolveAssignment", () => {
  it("pushes only the chosen assignee", () => {
    const result = resolveAssignment("s1", [staff("s1", "available"), staff("s2", "available")]);
    assert.equal(result.assignee, "s1");
    assert.deepEqual(result.pushTargets, ["s1"]);
    assert.equal(result.busyNotice, undefined);
  });

  it("assigns the least-recently active available staff when some are busy", () => {
    const list = [
      staff("a", "available", "2020-01-01T00:00:00.000Z"),
      staff("b", "busy"),
      staff("c", "away"),
    ];
    const result = resolveAssignment(null, list);
    assert.equal(result.assignee, "a");
    assert.deepEqual(result.pushTargets, ["a"]);
  });

  it("picks oldest lastAcceptedAt when all available", () => {
    const list = [
      staff("recent", "available", "2024-06-01T00:00:00.000Z"),
      staff("old", "available", "2020-01-01T00:00:00.000Z"),
      staff("mid", "available", "2022-01-01T00:00:00.000Z"),
    ];
    const result = resolveAssignment(null, list);
    assert.equal(result.assignee, "old");
    assert.deepEqual(result.pushTargets, ["old"]);
  });

  it("prefers never-accepted staff when lastAcceptedAt is null", () => {
    const list = [
      staff("never", "available", null),
      staff("before", "available", "2020-01-01T00:00:00.000Z"),
    ];
    const result = resolveAssignment(null, list);
    assert.equal(result.assignee, "never");
  });

  it("assigns random staff with busy notice when all busy/away", () => {
    const list = [staff("j", "busy", null, "Jamal"), staff("k", "away")];
    const result = resolveAssignment(null, list);
    assert.ok(result.assignee === "j" || result.assignee === "k");
    assert.deepEqual(result.pushTargets, [result.assignee]);
    assert.equal(result.busyNotice?.staffName, result.assignee === "j" ? "Jamal" : "k");
  });
});
