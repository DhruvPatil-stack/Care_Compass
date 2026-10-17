import type { MaskResult } from "./types";

const PATIENT_NAME_RE = /(?:Patient\s*(?:Name)?:?\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g;
const DOB_RE = /\b(?:DOB|Date of Birth|D\.O\.B\.?)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi;
const MRN_RE = /\b(?:MRN|Medical Record(?:\s+Number)?)\s*:?\s*([A-Z0-9\-]{4,12})/gi;
const PHONE_RE = /\b(\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4})\b/g;
const EMAIL_RE = /\b([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\b/g;
const SSN_RE = /\b(\d{3}-\d{2}-\d{4})\b/g;

type MaskEntry = { original: string; replacement: string; start: number; end: number };

/**
 * Replace PHI patterns with generic tokens and return both masked text and mask log.
 */
export function maskPHI(text: string): MaskResult {
  const masks: MaskEntry[] = [];
  let result = text;

  function applyMask(re: RegExp, label: string, captureGroup = 0): void {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    const replacements: MaskEntry[] = [];
    while ((match = re.exec(result)) !== null) {
      const captured = captureGroup > 0 ? match[captureGroup] : match[0];
      if (!captured) continue;
      const start = match.index + (captureGroup > 0 ? match[0].indexOf(captured) : 0);
      const end = start + captured.length;
      replacements.push({ original: captured, replacement: `[${label}]`, start, end });
    }
    for (const r of replacements.reverse()) {
      result = result.slice(0, r.start) + r.replacement + result.slice(r.end);
      masks.push(r);
    }
  }

  applyMask(PATIENT_NAME_RE, "PATIENT_NAME", 1);
  applyMask(DOB_RE, "DATE_OF_BIRTH", 1);
  applyMask(MRN_RE, "MRN", 1);
  applyMask(PHONE_RE, "PHONE", 1);
  applyMask(EMAIL_RE, "EMAIL", 1);
  applyMask(SSN_RE, "SSN", 1);

  return { maskedText: result, masks };
}
