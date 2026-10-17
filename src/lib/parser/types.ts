export interface TextSpan {
  sourceStart: number;
  sourceEnd: number;
}

export interface MaskResult {
  maskedText: string;
  masks: Array<{ original: string; replacement: string; start: number; end: number }>;
}

export interface Section {
  name: string;
  text: string;
  start: number;
  end: number;
}

export type RouteCode = "PO" | "IV" | "SC" | "SL" | "topical" | "inhaled" | "other";
export type FrequencyCode =
  | "daily"
  | "BID"
  | "TID"
  | "QID"
  | "q4h"
  | "q6h"
  | "q8h"
  | "q12h"
  | "qHS"
  | "qAM"
  | "PRN"
  | "with meals"
  | "other";

export interface TimesOfDay {
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  asNeeded: boolean;
}

export interface ParsedMedication extends TextSpan {
  type: "medication";
  drugName: string;
  dose: string;
  unit: string;
  route: RouteCode;
  frequency: FrequencyCode;
  duration: string;
  timesOfDay: TimesOfDay;
  plainText: string;
}

export interface ParsedFollowUp extends TextSpan {
  type: "followUp";
  provider: string;
  timeFrame: string;
  date: string;
  plainText: string;
}

export interface ParsedRestriction extends TextSpan {
  type: "restriction";
  category: "lifting" | "driving" | "bathing" | "diet" | "activity" | "other";
  description: string;
  plainText: string;
}

export type ParsedItem = ParsedMedication | ParsedFollowUp | ParsedRestriction;

export interface UnparsedLine extends TextSpan {
  text: string;
  reason: string;
}

export interface ParseResult {
  medications: ParsedMedication[];
  followUps: ParsedFollowUp[];
  restrictions: ParsedRestriction[];
  unparsed: UnparsedLine[];
}
