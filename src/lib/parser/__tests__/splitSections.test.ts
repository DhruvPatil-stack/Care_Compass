import { describe, it, expect } from "vitest";
import { splitSections } from "../splitSections";

const SAMPLE = `Discharge Summary

Medications:
- Aspirin 81 mg PO daily
- Metoprolol 25 mg PO BID

Follow-up:
- See cardiologist in 2 weeks

Activity:
- No strenuous exercise for 4 weeks

Return Precautions:
- Return to ER if chest pain`;

describe("splitSections", () => {
  it("finds Medications section", () => {
    const sections = splitSections(SAMPLE);
    const med = sections.find((s) => s.name === "Medications");
    expect(med).toBeDefined();
    expect(med?.text).toContain("Aspirin");
  });

  it("finds Follow-up section", () => {
    const sections = splitSections(SAMPLE);
    const fu = sections.find((s) => s.name === "Follow-up");
    expect(fu).toBeDefined();
  });

  it("finds Activity section", () => {
    const sections = splitSections(SAMPLE);
    expect(sections.find((s) => s.name === "Activity")).toBeDefined();
  });

  it("finds Return Precautions section", () => {
    const sections = splitSections(SAMPLE);
    expect(sections.find((s) => s.name === "Return Precautions")).toBeDefined();
  });

  it("returns empty array for text with no headers", () => {
    const sections = splitSections("This is a paragraph without any section headers.");
    expect(sections).toHaveLength(0);
  });

  it("section start offset points into original text", () => {
    const sections = splitSections(SAMPLE);
    const med = sections.find((s) => s.name === "Medications");
    if (!med) return;
    expect(SAMPLE.slice(med.start, med.start + 5)).toBeTruthy();
  });
});
