import type { Section } from "./types";

const SECTION_HEADERS: Array<{ name: string; patterns: RegExp[] }> = [
  {
    name: "Medications",
    patterns: [/^medications?\s*[:\/]?\s*$/im, /^discharge\s+medications?\s*[:\/]?\s*$/im, /^meds?\s*[:\/]?\s*$/im],
  },
  {
    name: "Follow-up",
    patterns: [/^follow[\s\-]?up\s*(?:appointments?)?\s*[:\/]?\s*$/im, /^follow[\s\-]?up\s*care\s*[:\/]?\s*$/im],
  },
  {
    name: "Activity",
    patterns: [/^activity\s*(?:restrictions?)?\s*[:\/]?\s*$/im, /^activity\s*instructions?\s*[:\/]?\s*$/im],
  },
  {
    name: "Diet",
    patterns: [/^diet\s*(?:restrictions?)?\s*[:\/]?\s*$/im, /^dietary\s*(?:instructions?)?\s*[:\/]?\s*$/im],
  },
  {
    name: "Wound Care",
    patterns: [/^wound\s+care\s*[:\/]?\s*$/im, /^incision\s+care\s*[:\/]?\s*$/im, /^dressing\s+(?:care|changes?)\s*[:\/]?\s*$/im],
  },
  {
    name: "Return Precautions",
    patterns: [
      /^return\s+(?:to\s+(?:the\s+)?(?:er|ed|emergency|hospital))?\s*precautions?\s*[:\/]?\s*$/im,
      /^when\s+to\s+(?:call|return|seek)\s*[:\/]?\s*$/im,
      /^warning\s+signs?\s*[:\/]?\s*$/im,
      /^call\s+(?:your\s+)?doctor\s+if\s*[:\/]?\s*$/im,
    ],
  },
];

interface HeaderHit {
  name: string;
  matchStart: number;
  matchEnd: number;
}

/**
 * Find section headers by regex and slice the text between them.
 */
export function splitSections(text: string): Section[] {
  const hits: HeaderHit[] = [];

  for (const section of SECTION_HEADERS) {
    for (const pattern of section.patterns) {
      let match: RegExpExecArray | null;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(text)) !== null) {
        const alreadyFound = hits.some((h) => h.name === section.name);
        if (!alreadyFound) {
          hits.push({ name: section.name, matchStart: match.index, matchEnd: match.index + match[0].length });
        }
      }
    }
  }

  hits.sort((a, b) => a.matchStart - b.matchStart);

  const sections: Section[] = [];
  for (let i = 0; i < hits.length; i++) {
    const current = hits[i];
    const nextStart = i + 1 < hits.length ? hits[i + 1].matchStart : text.length;
    const sectionText = text.slice(current.matchEnd, nextStart).trim();
    sections.push({
      name: current.name,
      text: sectionText,
      start: current.matchEnd,
      end: nextStart,
    });
  }

  return sections;
}
