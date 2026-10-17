import type { ParsedRestriction } from "./types";

type Category = ParsedRestriction["category"];

interface RestrictionSignal {
  category: Category;
  keywords: string[];
}

const SIGNALS: RestrictionSignal[] = [
  { category: "lifting",  keywords: ["lift", "lifting", "carry", "carrying", "weight"] },
  { category: "driving",  keywords: ["driv", "operate", "motor vehicle", "car", "wheel"] },
  { category: "bathing",  keywords: ["bath", "shower", "swim", "tub", "water", "wet", "submerge"] },
  { category: "diet",     keywords: ["eat", "drink", "food", "diet", "sodium", "fluid", "restrict", "avoid food", "npo"] },
  { category: "activity", keywords: ["activit", "exercise", "walk", "rest", "bed rest", "ambulate", "stair", "steps", "exert"] },
];

const WEIGHT_RE = /(\d+)\s*(lb|lbs|pound|pounds|kg|kilogram)/i;
const DURATION_RE = /(?:for|until|x)\s+(\d+)\s*(days?|weeks?|months?)/i;

/** Parse a restriction/activity line into a structured object. */
export function parseRestrictions(
  line: string,
  lineStart: number,
): ParsedRestriction | null {
  const lower = line.toLowerCase();

  const category = detectCategory(lower);
  if (!category) return null;

  const weightMatch = WEIGHT_RE.exec(line);
  if (weightMatch && !line.includes(weightMatch[1])) return null;

  const durationMatch = DURATION_RE.exec(line);
  if (durationMatch && !line.includes(durationMatch[1])) return null;

  const description = buildDescription(category, line, lower, weightMatch, durationMatch);
  const plainText = buildRestrictionPlainText(category, description);

  return {
    type: "restriction",
    category,
    description,
    plainText,
    sourceStart: lineStart,
    sourceEnd: lineStart + line.length,
  };
}

function detectCategory(lower: string): Category | null {
  for (const signal of SIGNALS) {
    if (signal.keywords.some((k) => lower.includes(k))) return signal.category;
  }
  return null;
}

function buildDescription(
  category: Category,
  line: string,
  lower: string,
  weightMatch: RegExpExecArray | null,
  durationMatch: RegExpExecArray | null,
): string {
  const durationStr = durationMatch ? ` for ${durationMatch[1]} ${durationMatch[2]}` : "";

  if (category === "lifting" && weightMatch) {
    return `No lifting over ${weightMatch[1]} ${weightMatch[2]}${durationStr}`;
  }
  if (category === "driving") {
    if (lower.includes("no driving") || lower.includes("do not drive")) {
      return `Do not drive${durationStr}`;
    }
    return `Driving restrictions apply${durationStr}`;
  }
  if (category === "bathing") {
    if (lower.includes("no bath") || lower.includes("do not submerge")) {
      return `Do not submerge wound in water${durationStr}`;
    }
    return `Bathing restrictions apply${durationStr}`;
  }
  return line.trim().slice(0, 120);
}

function buildRestrictionPlainText(category: Category, description: string): string {
  const PREFIX: Record<Category, string> = {
    lifting:  "Activity limit",
    driving:  "Driving limit",
    bathing:  "Bathing limit",
    diet:     "Diet restriction",
    activity: "Activity instruction",
    other:    "Restriction",
  };
  return `${PREFIX[category]}: ${description}.`;
}
