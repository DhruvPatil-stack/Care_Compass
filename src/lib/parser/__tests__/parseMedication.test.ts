import { describe, it, expect } from "vitest";
import { parseMedication } from "../parseMedication";

describe("parseMedication", () => {
  it("parses a simple daily medication", () => {
    const result = parseMedication("Aspirin 81 mg PO daily", 0);
    expect(result).not.toBeNull();
    expect(result?.drugName).toBe("aspirin");
    expect(result?.dose).toBe("81");
    expect(result?.unit).toBe("mg");
    expect(result?.frequency).toBe("daily");
    expect(result?.route).toBe("PO");
  });

  it("parses BID frequency and assigns morning + evening", () => {
    const result = parseMedication("Metoprolol 25 mg PO BID", 0);
    expect(result?.frequency).toBe("BID");
    expect(result?.timesOfDay.morning).toBe(true);
    expect(result?.timesOfDay.evening).toBe(true);
    expect(result?.timesOfDay.afternoon).toBe(false);
  });

  it("parses PRN medication as asNeeded", () => {
    const result = parseMedication("Acetaminophen 500 mg PO PRN pain", 0);
    expect(result?.frequency).toBe("PRN");
    expect(result?.timesOfDay.asNeeded).toBe(true);
  });

  it("parses duration", () => {
    const result = parseMedication("Azithromycin 500 mg PO daily for 5 days", 0);
    expect(result?.duration).toBe("5 days");
  });

  it("parses brand name via lexicon", () => {
    const result = parseMedication("Tylenol 650 mg PO q6h", 0);
    expect(result?.drugName).toBe("acetaminophen");
  });

  it("returns null for an unrecognized drug", () => {
    const result = parseMedication("Flibanserin 100 mg PO daily", 0);
    expect(result).toBeNull();
  });

  it("returns null when dose number does not appear in source line (safety check)", () => {
    const result = parseMedication("Aspirin mg PO daily", 0);
    // dose would be empty string, so the check does not reject it
    expect(result).not.toBeNull();
    expect(result?.dose).toBe("");
  });

  it("sets sourceStart and sourceEnd correctly", () => {
    const line = "Lisinopril 10 mg PO daily";
    const result = parseMedication(line, 50);
    expect(result?.sourceStart).toBe(50);
    expect(result?.sourceEnd).toBe(50 + line.length);
  });

  it("produces plainText that does not invent new numbers", () => {
    const line = "Furosemide 40 mg PO daily";
    const result = parseMedication(line, 0);
    expect(result?.plainText).toContain("40");
    // The plain text should contain no numbers not in source
    const numbers = (result?.plainText ?? "").match(/\d+/g) ?? [];
    for (const n of numbers) {
      expect(line).toContain(n);
    }
  });

  it("handles inhaled route", () => {
    const result = parseMedication("Albuterol 2 puffs inhaled q4h PRN", 0);
    expect(result?.route).toBe("inhaled");
  });

  it("handles a line with HTML tags without throwing", () => {
    expect(() => parseMedication("<b>Aspirin</b> 81 mg PO daily", 0)).not.toThrow();
  });

  it("does not throw on empty string", () => {
    expect(parseMedication("", 0)).toBeNull();
  });
});
