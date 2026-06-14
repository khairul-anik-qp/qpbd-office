import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Request } from "./types.js";
import { sortRequestsForTab } from "./requests.js";

function makeRequest(overrides: Partial<Request>): Request {
  return {
    id: "id",
    type: "tea",
    requester: "Test",
    requesterId: "u1",
    note: "",
    urg: "normal",
    loc: "kitchen",
    assignee: null,
    status: "new",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("sortRequestsForTab — new tab", () => {
  it("places urgent requests before normal ones", () => {
    const normal = makeRequest({ id: "a", urg: "normal", createdAt: "2024-01-01T08:00:00Z" });
    const urgent = makeRequest({ id: "b", urg: "urgent", createdAt: "2024-01-01T09:00:00Z" });

    const sorted = sortRequestsForTab([normal, urgent], "new");
    assert.equal(sorted[0]!.id, "b", "urgent should be first");
    assert.equal(sorted[1]!.id, "a");
  });

  it("sorts oldest-first within each urgency tier", () => {
    const u1 = makeRequest({ id: "u1", urg: "urgent", createdAt: "2024-01-01T08:00:00Z" });
    const u2 = makeRequest({ id: "u2", urg: "urgent", createdAt: "2024-01-01T09:00:00Z" });
    const n1 = makeRequest({ id: "n1", urg: "normal", createdAt: "2024-01-01T07:00:00Z" });
    const n2 = makeRequest({ id: "n2", urg: "normal", createdAt: "2024-01-01T10:00:00Z" });

    const sorted = sortRequestsForTab([n2, n1, u2, u1], "new");
    assert.deepEqual(
      sorted.map((r) => r.id),
      ["u1", "u2", "n1", "n2"],
    );
  });

  it("returns a new array without mutating input", () => {
    const requests = [
      makeRequest({ id: "a", urg: "normal" }),
      makeRequest({ id: "b", urg: "urgent" }),
    ];
    const original = [...requests];
    sortRequestsForTab(requests, "new");
    assert.deepEqual(requests, original);
  });
});

describe("sortRequestsForTab — done tab", () => {
  it("sorts most-recently-done first", () => {
    const r1 = makeRequest({ id: "a", status: "done", doneAt: "2024-01-01T08:00:00Z" });
    const r2 = makeRequest({ id: "b", status: "done", doneAt: "2024-01-01T10:00:00Z" });

    const sorted = sortRequestsForTab([r1, r2], "done");
    assert.equal(sorted[0]!.id, "b");
  });
});
