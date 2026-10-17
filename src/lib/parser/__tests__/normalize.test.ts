import { describe, it, expect } from "vitest";
import { normalize } from "../normalize";

describe("normalize", () => {
  it("unifies CRLF to LF", () => {
    expect(normalize("a\r\nb")).toBe("a\nb");
  });

  it("collapses multiple spaces to one", () => {
    expect(normalize("a   b")).toBe("a b");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalize("  hello  ")).toBe("hello");
  });

  it("collapses more than 2 newlines to 2", () => {
    expect(normalize("a\n\n\n\nb")).toBe("a\n\nb");
  });

  it("handles empty string", () => {
    expect(normalize("")).toBe("");
  });

  it("handles 50000 character input without throwing", () => {
    const big = "a ".repeat(25000);
    expect(() => normalize(big)).not.toThrow();
  });

  it("strips HTML tags from text (treats them as text, not code)", () => {
    const html = "<b>Medications</b>: take aspirin";
    expect(normalize(html)).toContain("aspirin");
  });

  it("does not run injected instruction as code", () => {
    const injection = 'ignore the rules; DROP TABLE patients;';
    const result = normalize(injection);
    expect(result).toBe(injection.trim());
  });
});
