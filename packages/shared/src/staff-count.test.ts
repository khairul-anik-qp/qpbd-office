import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countNewForStaff } from "./staff-count.js";
import type { Request } from "./types.js";

const base = (over: Partial<Request>): Request => ({
  id: "r1",
  type: "tea",
  requester: "Alice",
  requesterId: "e1",
  note: "",
  urg: "normal",
  loc: "3rd Floor",
  assignee: null,
  status: "new",
  forwardedBy: null,
  acceptedBy: null,
  acceptedAt: null,
  doneBy: null,
  doneAt: null,
  createdAt: new Date().toISOString(),
  ...over,
});

describe("countNewForStaff", () => {
  it("counts unassigned and assigned new items", () => {
    const requests = [
      base({ id: "a", assignee: null }),
      base({ id: "b", assignee: "s1" }),
      base({ id: "c", assignee: "s2" }),
      base({ id: "d", status: "progress", acceptedBy: "s1" }),
    ];
    assert.equal(countNewForStaff(requests, "s1"), 2);
    assert.equal(countNewForStaff(requests, "s2"), 2);
  });
});
