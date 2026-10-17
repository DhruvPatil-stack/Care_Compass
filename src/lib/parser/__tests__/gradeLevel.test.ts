import { describe, it, expect } from "vitest";
import { fleschKincaidGrade } from "../gradeLevel";

describe("fleschKincaidGrade", () => {
  it("returns a number for normal text", () => {
    const grade = fleschKincaidGrade("Take your medicine every morning with water.");
    expect(typeof grade).toBe("number");
  });

  it("returns 0 for empty string", () => {
    expect(fleschKincaidGrade("")).toBe(0);
  });

  it("grade for simple short sentences is below 8", () => {
    const text = "Take your pill. Drink water. Rest at home.";
    const grade = fleschKincaidGrade(text);
    expect(grade).toBeLessThan(8);
  });

  it("does not throw on 50000 characters", () => {
    const big = "Take your medicine. ".repeat(2500);
    expect(() => fleschKincaidGrade(big)).not.toThrow();
  });
});
