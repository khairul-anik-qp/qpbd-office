import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { staffFirstName } from "./users.js";

describe("staffFirstName", () => {
  it("returns the first token of a full name", () => {
    assert.equal(staffFirstName("Jamal Khan"), "Jamal");
  });

  it("returns a single name unchanged", () => {
    assert.equal(staffFirstName("Jamal"), "Jamal");
  });

  it("returns em dash for empty input", () => {
    assert.equal(staffFirstName(""), "—");
    assert.equal(staffFirstName("   "), "—");
  });
});
