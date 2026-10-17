process.stderr.write("STEP 1: start\n");
import { readFileSync, readdirSync } from "fs";
process.stderr.write("STEP 2: fs imported\n");
import { join, resolve } from "path";
process.stderr.write("STEP 3: path imported\n");
import { normalize } from "../src/lib/parser/normalize";
process.stderr.write("STEP 4: normalize imported\n");
import { maskPHI } from "../src/lib/parser/maskPHI";
process.stderr.write("STEP 5: maskPHI imported\n");
import { fleschKincaidGrade } from "../src/lib/parser/gradeLevel";
process.stderr.write("STEP 6: gradeLevel imported\n");
import { splitSections } from "../src/lib/parser/splitSections";
process.stderr.write("STEP 7: splitSections imported\n");
import { parseMedication } from "../src/lib/parser/parseMedication";
process.stderr.write("STEP 8: parseMedication imported\n");
import { parseFollowUp } from "../src/lib/parser/parseFollowUp";
process.stderr.write("STEP 9: parseFollowUp imported\n");
import { parseRestrictions } from "../src/lib/parser/parseRestrictions";
process.stderr.write("STEP 10: parseRestrictions imported\n");
import { parseDischarge } from "../src/lib/parser/index";
process.stderr.write("STEP 11: parseDischarge imported\n");

const ROOT = resolve(__dirname, "..");
process.stderr.write("STEP 12: ROOT=" + ROOT + "\n");

const tuneDir = join(ROOT, "data/tune");
process.stderr.write("STEP 13: tuneDir=" + tuneDir + "\n");

const files = readdirSync(tuneDir).filter((f) => f.endsWith(".txt")).sort();
process.stderr.write("STEP 14: files=" + files.join(",") + "\n");

const file = files[0];
process.stderr.write("STEP 15: processing " + file + "\n");
const rawText = readFileSync(join(tuneDir, file), "utf-8");
process.stderr.write("STEP 16: read file, length=" + rawText.length + "\n");
const normalizedText = normalize(rawText);
process.stderr.write("STEP 17: normalized\n");
const { maskedText } = maskPHI(normalizedText);
process.stderr.write("STEP 18: masked\n");
const pr = parseDischarge(maskedText);
process.stderr.write("STEP 19: parsed, meds=" + pr.medications.length + "\n");
process.stderr.write("DONE\n");
