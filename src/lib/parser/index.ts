import { normalize } from "./normalize";
import { maskPHI } from "./maskPHI";
import { splitSections } from "./splitSections";
import { parseMedication } from "./parseMedication";
import { parseFollowUp } from "./parseFollowUp";
import { parseRestrictions } from "./parseRestrictions";
import type {
  ParseResult,
  ParsedMedication,
  ParsedFollowUp,
  ParsedRestriction,
  UnparsedLine,
  MaskResult,
} from "./types";

export * from "./types";
export { normalize } from "./normalize";
export { maskPHI } from "./maskPHI";
export { splitSections } from "./splitSections";
export { parseMedication } from "./parseMedication";
export { parseFollowUp } from "./parseFollowUp";
export { parseRestrictions } from "./parseRestrictions";
export { explain } from "./glossary";
export { fleschKincaidGrade } from "./gradeLevel";

/**
 * Run all parsing stages on a discharge summary text.
 * Input text must already be normalized and phi-masked.
 */
export function parseDischarge(text: string): ParseResult {
  const medications: ParsedMedication[] = [];
  const followUps: ParsedFollowUp[] = [];
  const restrictions: ParsedRestriction[] = [];
  const unparsed: UnparsedLine[] = [];

  const sections = splitSections(text);

  for (const section of sections) {
    const lines = section.text.split("\n");
    let offset = section.start;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.length < 3) {
        offset += rawLine.length + 1;
        continue;
      }

      const lineStart = text.indexOf(rawLine, offset);
      const lineEnd = lineStart + rawLine.length;

      if (section.name === "Medications") {
        const med = parseMedication(line, lineStart);
        if (med) {
          medications.push(med);
        } else {
          unparsed.push({ text: line, reason: "Medication line could not be parsed", sourceStart: lineStart, sourceEnd: lineEnd });
        }
      } else if (section.name === "Follow-up") {
        const fu = parseFollowUp(line, lineStart);
        if (fu) {
          followUps.push(fu);
        } else {
          unparsed.push({ text: line, reason: "Follow-up line could not be parsed", sourceStart: lineStart, sourceEnd: lineEnd });
        }
      } else if (section.name === "Activity" || section.name === "Diet" || section.name === "Wound Care") {
        const rest = parseRestrictions(line, lineStart);
        if (rest) {
          restrictions.push(rest);
        } else {
          unparsed.push({ text: line, reason: "Restriction line could not be parsed", sourceStart: lineStart, sourceEnd: lineEnd });
        }
      } else if (section.name === "Return Precautions") {
        unparsed.push({ text: line, reason: "Return precaution -- ask your nurse", sourceStart: lineStart, sourceEnd: lineEnd });
      }

      offset = lineEnd + 1;
    }
  }

  return { medications, followUps, restrictions, unparsed };
}

/** Run the full pipeline: normalize -> maskPHI -> parse. */
export function runPipeline(rawText: string): {
  normalized: string;
  maskResult: MaskResult;
  parseResult: ParseResult;
} {
  const normalized = normalize(rawText);
  const maskResult = maskPHI(normalized);
  const parseResult = parseDischarge(maskResult.maskedText);
  return { normalized, maskResult, parseResult };
}
