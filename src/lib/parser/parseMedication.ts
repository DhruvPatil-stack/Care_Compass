import { DRUG_LEXICON } from "./lexicon";
import type { ParsedMedication, FrequencyCode, RouteCode, TimesOfDay } from "./types";

const DOSE_RE = /(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|mL|units?|IU|mEq|mmol|puffs?|drops?|tablets?|caps?|capsules?|patch(?:es)?)/i;

const FREQUENCY_MAP: Record<string, { code: FrequencyCode; times: TimesOfDay }> = {
  "once a day":    { code: "daily",     times: { morning: true,  afternoon: false, evening: false, asNeeded: false } },
  "once daily":    { code: "daily",     times: { morning: true,  afternoon: false, evening: false, asNeeded: false } },
  "1 time daily":  { code: "daily",     times: { morning: true,  afternoon: false, evening: false, asNeeded: false } },
  qd:              { code: "daily",     times: { morning: true,  afternoon: false, evening: false, asNeeded: false } },
  daily:           { code: "daily",     times: { morning: true,  afternoon: false, evening: false, asNeeded: false } },
  od:              { code: "daily",     times: { morning: true,  afternoon: false, evening: false, asNeeded: false } },
  bid:             { code: "BID",       times: { morning: true,  afternoon: false, evening: true,  asNeeded: false } },
  "twice daily":   { code: "BID",       times: { morning: true,  afternoon: false, evening: true,  asNeeded: false } },
  "twice a day":   { code: "BID",       times: { morning: true,  afternoon: false, evening: true,  asNeeded: false } },
  "2 times daily": { code: "BID",       times: { morning: true,  afternoon: false, evening: true,  asNeeded: false } },
  "2x daily":      { code: "BID",       times: { morning: true,  afternoon: false, evening: true,  asNeeded: false } },
  tid:             { code: "TID",       times: { morning: true,  afternoon: true,  evening: true,  asNeeded: false } },
  "three times daily": { code: "TID",   times: { morning: true,  afternoon: true,  evening: true,  asNeeded: false } },
  "3 times daily": { code: "TID",       times: { morning: true,  afternoon: true,  evening: true,  asNeeded: false } },
  "3x daily":      { code: "TID",       times: { morning: true,  afternoon: true,  evening: true,  asNeeded: false } },
  qid:             { code: "QID",       times: { morning: true,  afternoon: true,  evening: true,  asNeeded: false } },
  "four times daily": { code: "QID",    times: { morning: true,  afternoon: true,  evening: true,  asNeeded: false } },
  "4 times daily": { code: "QID",       times: { morning: true,  afternoon: true,  evening: true,  asNeeded: false } },
  q4h:             { code: "q4h",       times: { morning: true,  afternoon: true,  evening: true,  asNeeded: false } },
  "every 4 hours": { code: "q4h",       times: { morning: true,  afternoon: true,  evening: true,  asNeeded: false } },
  q6h:             { code: "q6h",       times: { morning: true,  afternoon: true,  evening: true,  asNeeded: false } },
  "every 6 hours": { code: "q6h",       times: { morning: true,  afternoon: true,  evening: true,  asNeeded: false } },
  q8h:             { code: "q8h",       times: { morning: true,  afternoon: true,  evening: true,  asNeeded: false } },
  "every 8 hours": { code: "q8h",       times: { morning: true,  afternoon: true,  evening: true,  asNeeded: false } },
  q12h:            { code: "q12h",      times: { morning: true,  afternoon: false, evening: true,  asNeeded: false } },
  "every 12 hours":{ code: "q12h",      times: { morning: true,  afternoon: false, evening: true,  asNeeded: false } },
  qhs:             { code: "qHS",       times: { morning: false, afternoon: false, evening: true,  asNeeded: false } },
  "at bedtime":    { code: "qHS",       times: { morning: false, afternoon: false, evening: true,  asNeeded: false } },
  "at night":      { code: "qHS",       times: { morning: false, afternoon: false, evening: true,  asNeeded: false } },
  qam:             { code: "qAM",       times: { morning: true,  afternoon: false, evening: false, asNeeded: false } },
  "every morning": { code: "qAM",       times: { morning: true,  afternoon: false, evening: false, asNeeded: false } },
  prn:             { code: "PRN",       times: { morning: false, afternoon: false, evening: false, asNeeded: true  } },
  "as needed":     { code: "PRN",       times: { morning: false, afternoon: false, evening: false, asNeeded: true  } },
  "with meals":    { code: "with meals",times: { morning: true,  afternoon: true,  evening: true,  asNeeded: false } },
  "with food":     { code: "with meals",times: { morning: true,  afternoon: true,  evening: true,  asNeeded: false } },
};

const ROUTE_MAP: Record<string, RouteCode> = {
  po: "PO", "by mouth": "PO", oral: "PO", orally: "PO",
  iv: "IV", "intravenous": "IV", intravenously: "IV",
  sc: "SC", sq: "SC", subcutaneous: "SC", "under the skin": "SC",
  sl: "SL", sublingual: "SL", "under the tongue": "SL",
  topical: "topical", "to skin": "topical", "apply to": "topical",
  inhaled: "inhaled", inhalation: "inhaled", "via inhaler": "inhaled", nebulized: "inhaled",
};

const DURATION_RE = /(?:for\s+)?(\d+)\s*(days?|weeks?|months?)/i;

/** Parse a single medication line into a structured object. Returns null on failure. */
export function parseMedication(
  line: string,
  lineStart: number,
): ParsedMedication | null {
  const lower = line.toLowerCase().trim();

  const drugEntry = findDrug(lower);
  if (!drugEntry) return null;

  const doseMatch = DOSE_RE.exec(line);
  const dose = doseMatch ? doseMatch[1] : "";
  const unit = doseMatch ? doseMatch[2].toLowerCase() : "";

  // Safety: verify dose number appears in source line
  if (dose && !line.includes(dose)) return null;

  const freqEntry = findFrequency(lower);
  const { code: frequency, times: timesOfDay } = freqEntry ?? {
    code: "other" as FrequencyCode,
    times: { morning: true, afternoon: false, evening: false, asNeeded: false },
  };

  const route = findRoute(lower);
  const durationMatch = DURATION_RE.exec(line);
  const duration = durationMatch ? `${durationMatch[1]} ${durationMatch[2]}` : "";

  const plainText = buildMedPlainText(drugEntry.canonical, dose, unit, route, frequency, duration);

  return {
    type: "medication",
    drugName: drugEntry.canonical,
    dose,
    unit,
    route,
    frequency,
    duration,
    timesOfDay,
    plainText,
    sourceStart: lineStart,
    sourceEnd: lineStart + line.length,
  };
}

function findDrug(lower: string): { canonical: string } | null {
  for (const [key, canonical] of Object.entries(DRUG_LEXICON)) {
    if (lower.includes(key)) return { canonical };
  }
  return null;
}

function findFrequency(lower: string): { code: FrequencyCode; times: TimesOfDay } | null {
  const keys = Object.keys(FREQUENCY_MAP).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) return FREQUENCY_MAP[key];
  }
  return null;
}

function findRoute(lower: string): RouteCode {
  const keys = Object.keys(ROUTE_MAP).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) return ROUTE_MAP[key];
  }
  return "PO";
}

function buildMedPlainText(
  drug: string,
  dose: string,
  unit: string,
  route: RouteCode,
  freq: FrequencyCode,
  duration: string,
): string {
  const routeMap: Record<RouteCode, string> = {
    PO: "by mouth",
    IV: "by IV",
    SC: "under the skin",
    SL: "under the tongue",
    topical: "applied to the skin",
    inhaled: "inhaled",
    other: "",
  };
  const freqPhraseMap: Record<FrequencyCode, string> = {
    daily: "once a day",
    BID: "twice a day",
    TID: "three times a day",
    QID: "four times a day",
    q4h: "every 4 hours",
    q6h: "every 6 hours",
    q8h: "every 8 hours",
    q12h: "every 12 hours",
    qHS: "at bedtime",
    qAM: "every morning",
    PRN: "as needed",
    "with meals": "with each meal",
    other: "",
  };
  const doseStr = dose && unit ? ` ${dose} ${unit}` : "";
  const routeStr = routeMap[route] ? ` ${routeMap[route]}` : "";
  const freqStr = freqPhraseMap[freq] ? `, ${freqPhraseMap[freq]}` : "";
  const durStr = duration ? ` for ${duration}` : "";
  return `Take ${drug}${doseStr}${routeStr}${freqStr}${durStr}.`;
}
