import { describe, it, expect } from "vitest";
import { parseRestrictions } from "../parseRestrictions";

describe("parseRestrictions", () => {
  it("parses a lifting restriction", () => {
    const result = parseRestrictions("No lifting over 10 lbs for 6 weeks", 0);
    expect(result?.category).toBe("lifting");
    expect(result?.description).toContain("10");
  });

  it("parses a driving restriction", () => {
    const result = parseRestrictions("No driving for 2 weeks", 0);
    expect(result?.category).toBe("driving");
  });

  it("parses a bathing restriction", () => {
    const result = parseRestrictions("Do not submerge wound in water for 1 week", 0);
    expect(result?.category).toBe("bathing");
  });

  it("parses a diet restriction", () => {
    const result = parseRestrictions("Low sodium diet; avoid salty foods", 0);
    expect(result?.category).toBe("diet");
  });

  it("returns null for a non-restriction line", () => {
    const result = parseRestrictions("Take aspirin 81 mg daily", 0);
    expect(result).toBeNull();
  });

  it("weight number must appear in source line (safety check)", () => {
    const result = parseRestrictions("No lifting over 10 lbs", 0);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.description).toContain("10");
    }
  });

  it("handles empty string", () => {
    expect(parseRestrictions("", 0)).toBeNull();
  });
});
