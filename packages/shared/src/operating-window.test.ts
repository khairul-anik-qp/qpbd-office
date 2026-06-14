import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getStaffOperatingWindow,
  hasStaffOperatingWindowEnded,
  isInStaffOperatingWindow,
  OFFICE_TIMEZONE,
} from "./operating-window.js";

const TZ = OFFICE_TIMEZONE;

describe("getStaffOperatingWindow", () => {
  it("uses today's 8 AM–10 PM during the shift", () => {
    const now = new Date("2026-06-14T06:00:00+06:00"); // 6 AM Dhaka
    const { start, end } = getStaffOperatingWindow(now, TZ);
    assert.equal(start.toISOString(), "2026-06-13T02:00:00.000Z"); // prev day 8 AM
    assert.equal(end.toISOString(), "2026-06-13T16:00:00.000Z"); // prev day 10 PM
  });

  it("rolls to today after 8 AM", () => {
    const now = new Date("2026-06-14T10:30:00+06:00");
    const { start, end } = getStaffOperatingWindow(now, TZ);
    assert.equal(start.toISOString(), "2026-06-14T02:00:00.000Z");
    assert.equal(end.toISOString(), "2026-06-14T16:00:00.000Z");
  });

  it("keeps today's window after 10 PM", () => {
    const now = new Date("2026-06-14T23:30:00+06:00");
    const { start, end } = getStaffOperatingWindow(now, TZ);
    assert.equal(start.toISOString(), "2026-06-14T02:00:00.000Z");
    assert.equal(end.toISOString(), "2026-06-14T16:00:00.000Z");
  });
});

describe("isInStaffOperatingWindow", () => {
  const now = new Date("2026-06-14T12:00:00+06:00");

  it("accepts requests inside the window", () => {
    assert.equal(
      isInStaffOperatingWindow("2026-06-14T09:15:00+06:00", now, TZ),
      true,
    );
    assert.equal(
      isInStaffOperatingWindow("2026-06-14T22:00:00+06:00", now, TZ),
      true,
    );
  });

  it("rejects requests before 8 AM and after 10 PM", () => {
    assert.equal(
      isInStaffOperatingWindow("2026-06-14T07:59:00+06:00", now, TZ),
      false,
    );
    assert.equal(
      isInStaffOperatingWindow("2026-06-14T22:01:00+06:00", now, TZ),
      false,
    );
    assert.equal(
      isInStaffOperatingWindow("2026-06-13T15:00:00+06:00", now, TZ),
      false,
    );
  });
});

describe("hasStaffOperatingWindowEnded", () => {
  it("is false during the shift", () => {
    const during = new Date("2026-06-14T12:00:00+06:00");
    assert.equal(hasStaffOperatingWindowEnded(during, TZ), false);
    const atEnd = new Date("2026-06-14T22:00:00+06:00");
    assert.equal(hasStaffOperatingWindowEnded(atEnd, TZ), false);
  });

  it("is true after 10 PM and before the next 8 AM", () => {
    const after = new Date("2026-06-14T22:01:00+06:00");
    assert.equal(hasStaffOperatingWindowEnded(after, TZ), true);
    const earlyMorning = new Date("2026-06-15T07:00:00+06:00");
    assert.equal(hasStaffOperatingWindowEnded(earlyMorning, TZ), true);
  });
});
