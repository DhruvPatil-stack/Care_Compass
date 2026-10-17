import type { ParsedFollowUp } from "./types";

const TIME_FRAME_RE = /\b(\d+)\s*(days?|weeks?|months?)\b/i;
const DATE_RE = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+ \d{1,2},?\s*\d{4}|\d{1,2} \w+ \d{4})\b/i;
const PROVIDER_RE = /(?:with|see|visit|appointment\s+with)\s+(?:Dr\.?\s+)?([A-Za-z\s\-]+?)(?:\s+(?:in|on|at|for|\d)|\s*$)/i;

const DEPT_KEYWORDS = [
  "cardiology", "orthopedics", "orthopedic", "neurology", "oncology",
  "pulmonology", "nephrology", "gastroenterology", "urology", "rheumatology",
  "endocrinology", "dermatology", "ophthalmology", "ent", "psychiatry",
  "surgery", "wound clinic", "primary care", "pcp", "your doctor",
  "your surgeon", "your cardiologist", "ob/gyn", "obstetrics",
];

/** Parse a follow-up appointment line into a structured object. */
export function parseFollowUp(
  line: string,
  lineStart: number,
): ParsedFollowUp | null {
  const lower = line.toLowerCase();
  const hasFollowUpSignal =
    lower.includes("follow") ||
    lower.includes("appointment") ||
    lower.includes("see dr") ||
    lower.includes("see your") ||
    lower.includes("schedule") ||
    lower.includes("call") ||
    DEPT_KEYWORDS.some((k) => lower.includes(k));

  if (!hasFollowUpSignal) return null;

  const timeFrameMatch = TIME_FRAME_RE.exec(line);
  const timeFrame = timeFrameMatch ? `${timeFrameMatch[1]} ${timeFrameMatch[2]}` : "";

  const dateMatch = DATE_RE.exec(line);
  const date = dateMatch ? dateMatch[1] : "";

  // Safety: verify timeframe numbers appear in source
  if (timeFrameMatch && !line.includes(timeFrameMatch[1])) return null;

  const provider = extractProvider(line, lower);
  const plainText = buildFollowUpPlainText(provider, timeFrame, date);

  return {
    type: "followUp",
    provider,
    timeFrame,
    date,
    plainText,
    sourceStart: lineStart,
    sourceEnd: lineStart + line.length,
  };
}

function extractProvider(line: string, lower: string): string {
  for (const dept of DEPT_KEYWORDS) {
    if (lower.includes(dept)) {
      return dept.charAt(0).toUpperCase() + dept.slice(1);
    }
  }
  const providerMatch = PROVIDER_RE.exec(line);
  if (providerMatch) return providerMatch[1].trim();
  return "your doctor";
}

function buildFollowUpPlainText(provider: string, timeFrame: string, date: string): string {
  if (date) return `Schedule a visit with ${provider} on ${date}.`;
  if (timeFrame) return `Schedule a visit with ${provider} within ${timeFrame}.`;
  return `Schedule a follow-up visit with ${provider}.`;
}
