import { describe, expect, it } from "vitest";
import { salonClock } from "@/lib/booking-clock";

describe("Salon booking clock", () => {
  it("uses Kolkata time when visitors are in another timezone", () => {
    expect(salonClock(new Date("2026-11-03T05:35:00Z"))).toEqual({ date: "2026-11-03", minutes: 665 });
  });
  it("advances the booking date at Kolkata midnight", () => {
    expect(salonClock(new Date("2026-11-03T18:30:00Z"))).toEqual({ date: "2026-11-04", minutes: 0 });
  });
});