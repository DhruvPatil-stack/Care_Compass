import { describe, it, expect } from "vitest";
import { parseFollowUp } from "../parseFollowUp";

describe("parseFollowUp", () => {
  it("parses a follow-up with time frame", () => {
    const result = parseFollowUp("Follow up with your primary care doctor in 1 week", 0);
    expect(result).not.toBeNull();
    expect(result?.timeFrame).toBe("1 week");
  });

  it("parses a specialist appointment", () => {
    const result = parseFollowUp("Cardiology appointment in 2 weeks", 0);
    expect(result?.provider).toBe("Cardiology");
  });

  it("parses a date if present", () => {
    const result = parseFollowUp("See your doctor on 11/15/2026", 0);
    expect(result?.date).toContain("11/15/2026");
  });

  it("returns null for a non-follow-up line", () => {
    const result = parseFollowUp("Take ibuprofen 400 mg BID", 0);
    expect(result).toBeNull();
  });

  it("sets correct sourceStart and sourceEnd", () => {
    const line = "Follow up with orthopedics in 4 weeks";
    const result = parseFollowUp(line, 100);
    expect(result?.sourceStart).toBe(100);
    expect(result?.sourceEnd).toBe(100 + line.length);
  });

  it("handles empty string", () => {
    expect(parseFollowUp("", 0)).toBeNull();
  });
});
