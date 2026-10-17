import { describe, it, expect } from "vitest";
import { maskPHI } from "../maskPHI";

describe("maskPHI", () => {
  it("masks a name after Patient:", () => {
    const { maskedText } = maskPHI("Patient: John Smith\nMedications:");
    expect(maskedText).not.toContain("John Smith");
    expect(maskedText).toContain("[PATIENT_NAME]");
  });

  it("masks a date of birth", () => {
    const { maskedText } = maskPHI("DOB: 03/15/1962");
    expect(maskedText).not.toContain("03/15/1962");
  });

  it("masks an MRN", () => {
    const { maskedText } = maskPHI("MRN: ABC-123456");
    expect(maskedText).not.toContain("ABC-123456");
  });

  it("masks a phone number", () => {
    const { maskedText } = maskPHI("Call us at (801) 555-1234");
    expect(maskedText).not.toContain("555-1234");
  });

  it("masks an email address", () => {
    const { maskedText } = maskPHI("Email: jane@example.com");
    expect(maskedText).not.toContain("jane@example.com");
  });

  it("returns mask entries for each replacement", () => {
    const { masks } = maskPHI("Patient: Alice Brown\nDOB: 01/01/1980");
    expect(masks.length).toBeGreaterThanOrEqual(2);
  });

  it("does not alter text with no PHI", () => {
    const text = "Take ibuprofen 400 mg PO TID";
    const { maskedText } = maskPHI(text);
    expect(maskedText).toBe(text);
  });

  it("handles empty string", () => {
    const { maskedText, masks } = maskPHI("");
    expect(maskedText).toBe("");
    expect(masks).toHaveLength(0);
  });
});
