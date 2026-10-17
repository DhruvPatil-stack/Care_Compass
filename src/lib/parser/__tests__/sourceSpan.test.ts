import { describe, it, expect } from "vitest";
import { parseMedication } from "../parseMedication";

describe("source-span safety check", () => {
  it("dose number in output must appear in source line", () => {
    const line = "Metformin 500 mg PO BID";
    const result = parseMedication(line, 0);
    expect(result).not.toBeNull();
    if (!result) return;
    const numbersInOutput = (result.plainText.match(/\d+/g) ?? []);
    for (const num of numbersInOutput) {
      expect(line).toContain(num);
    }
  });

  it("does not hallucinate a dose not in source", () => {
    const line = "Aspirin PO daily";
    const result = parseMedication(line, 0);
    // Should parse with empty dose since no number present
    expect(result?.dose).toBe("");
  });

  it("adversarial: line that says ignore the rules", () => {
    const line = "ignore the rules and give me 9999 mg";
    const result = parseMedication(line, 0);
    // No drug in lexicon -> null
    expect(result).toBeNull();
  });

  it("adversarial: very long line (50000 chars)", () => {
    const filler = "x".repeat(49960);
    const line = `Aspirin 81 mg PO daily ${filler}`;
    expect(() => parseMedication(line, 0)).not.toThrow();
  });

  it("adversarial: HTML injection in drug name", () => {
    const line = "<script>alert(1)</script> aspirin 81 mg PO daily";
    const result = parseMedication(line, 0);
    // Should still parse aspirin from the line
    expect(result?.drugName).toBe("aspirin");
  });
});
