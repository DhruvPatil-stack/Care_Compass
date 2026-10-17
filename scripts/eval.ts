#!/usr/bin/env tsx
/**
 * Evaluation script: runs the parser on synthetic cases and reports metrics.
 * Run: npm run eval
 * Output: markdown table to stdout.
 */

import { readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";
import { normalize } from "../src/lib/parser/normalize";
import { maskPHI } from "../src/lib/parser/maskPHI";
import { parseDischarge } from "../src/lib/parser/index";
import { fleschKincaidGrade } from "../src/lib/parser/gradeLevel";
import type { ParseResult } from "../src/lib/parser/types";

const ROOT = resolve(__dirname, "..");
const tuneDir = join(ROOT, "data/tune");
const heldDir = join(ROOT, "data/heldout");

const tuneScore = scoreDirectory(tuneDir);
const heldScore = scoreDirectory(heldDir);

console.log("\n## CareCompass Parser Evaluation Results");
console.log(`\nDate: ${new Date().toISOString().slice(0, 10)}`);
console.log("\n### Summary Table\n");
console.log("| Set | Cases | Med Recall | Med Precision | Dose Accuracy | Unparsed Rate | FK Grade | Hallucinations |");
console.log("|-----|-------|-----------|--------------|--------------|--------------|---------|---------------|");
console.log(formatRow(`Tune (n=${tuneScore.cases.length})`, tuneScore));
console.log(formatRow(`Held-out (n=${heldScore.cases.length})`, heldScore));
console.log("\n### Per-Case Details (Tune Set)\n");
tuneScore.cases.forEach(printCase);
console.log("\n### Per-Case Details (Held-out Set)\n");
heldScore.cases.forEach(printCase);
console.log("\n### Notes");
console.log("- Recall = matched meds / expected meds (drug name substring match)");
console.log("- Precision = matched meds / parsed meds (false positive rate)");
console.log("- Dose accuracy = exact dose + unit match among recalled meds");
console.log("- Hallucination = output numbers not in source span (target: 0)");
console.log("- FK Grade = Flesch-Kincaid Grade Level on all parser plainText output");

interface CaseResult {
  name: string;
  medRecall: number;
  medPrecision: number;
  doseAccuracy: number;
  unparsedRate: number;
  fkGrade: number;
  hallucinations: number;
  details: string;
}

interface SetScore {
  medRecall: number;
  medPrecision: number;
  doseAccuracy: number;
  unparsedRate: number;
  fkGrade: number;
  hallucinations: number;
  cases: CaseResult[];
}

interface AnswerKey {
  medications: Array<{ name: string; dose: string; unit: string; frequency: string }>;
  followUps: Array<{ provider: string; timeFrame: string }>;
  restrictions: Array<{ category: string; description: string }>;
}

function scoreDirectory(dir: string): SetScore {
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".txt")).sort();
  } catch {
    return { medRecall: 0, medPrecision: 0, doseAccuracy: 0, unparsedRate: 0, fkGrade: 0, hallucinations: 0, cases: [] };
  }

  const results: CaseResult[] = [];
  for (const file of files) {
    const base = file.replace(".txt", "");
    let answerKey: AnswerKey;
    try {
      answerKey = JSON.parse(readFileSync(join(dir, `${base}.json`), "utf-8")) as AnswerKey;
    } catch {
      process.stderr.write(`No answer key for ${file}\n`);
      continue;
    }
    const rawText = readFileSync(join(dir, file), "utf-8");
    const normalizedText = normalize(rawText);
    const { maskedText } = maskPHI(normalizedText);
    const parseResult = parseDischarge(maskedText);
    results.push(scoreSingleCase(base, maskedText, parseResult, answerKey));
  }

  if (results.length === 0) {
    return { medRecall: 0, medPrecision: 0, doseAccuracy: 0, unparsedRate: 0, fkGrade: 0, hallucinations: 0, cases: [] };
  }

  return {
    medRecall: avg(results.map((r) => r.medRecall)),
    medPrecision: avg(results.map((r) => r.medPrecision)),
    doseAccuracy: avg(results.map((r) => r.doseAccuracy)),
    unparsedRate: avg(results.map((r) => r.unparsedRate)),
    fkGrade: avg(results.map((r) => r.fkGrade)),
    hallucinations: results.reduce((s, r) => s + r.hallucinations, 0),
    cases: results,
  };
}

function scoreSingleCase(
  name: string,
  sourceText: string,
  parseResult: ParseResult,
  key: AnswerKey,
): CaseResult {
  const parsedMeds = parseResult.medications;
  const expectedMeds = key.medications ?? [];
  let matches = 0;
  let doseMatches = 0;

  for (const expected of expectedMeds) {
    const hit = parsedMeds.find(
      (p) =>
        p.drugName.toLowerCase().includes(expected.name.toLowerCase()) ||
        expected.name.toLowerCase().includes(p.drugName.toLowerCase()),
    );
    if (hit) {
      matches++;
      if (hit.dose === expected.dose && normalize(hit.unit) === normalize(expected.unit)) {
        doseMatches++;
      }
    }
  }

  const recall = expectedMeds.length > 0 ? matches / expectedMeds.length : 1;
  const precision = parsedMeds.length > 0 ? matches / parsedMeds.length : 1;
  const doseAccuracy = matches > 0 ? doseMatches / matches : 0;
  const totalLines = sourceText.split("\n").filter((l) => l.trim().length > 0).length;
  const unparsedRate = totalLines > 0 ? parseResult.unparsed.length / totalLines : 0;
  const allPlainText = [
    ...parsedMeds.map((m) => m.plainText),
    ...parseResult.followUps.map((f) => f.plainText),
    ...parseResult.restrictions.map((r) => r.plainText),
  ].join(" ");
  const fkGrade = fleschKincaidGrade(allPlainText);

  let hallucinations = 0;
  for (const med of parsedMeds) {
    const nums = med.plainText.match(/\d+(?:\.\d+)?/g) ?? [];
    const src = sourceText.slice(Math.max(0, med.sourceStart - 5), med.sourceEnd + 20);
    for (const n of nums) {
      if (!src.includes(n)) hallucinations++;
    }
  }

  const details =
    `recall=${pct(recall)}, prec=${pct(precision)}, dose=${pct(doseAccuracy)}, ` +
    `unparsed=${pct(unparsedRate)}, FK=${fkGrade.toFixed(1)}, hall=${hallucinations}`;

  return { name, medRecall: recall, medPrecision: precision, doseAccuracy, unparsedRate, fkGrade, hallucinations, details };
}

function avg(arr: number[]): number {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function formatRow(label: string, s: SetScore): string {
  return `| ${label} | ${s.cases.length} | ${pct(s.medRecall)} | ${pct(s.medPrecision)} | ${pct(s.doseAccuracy)} | ${pct(s.unparsedRate)} | ${s.fkGrade.toFixed(1)} | ${s.hallucinations} |`;
}

function printCase(c: CaseResult): void {
  console.log(`- **${c.name}**: ${c.details}`);
}
