# Evaluation Method

## Synthetic Case Design

All 15 test cases are fully synthetic. No real patient records were used.
Cases were designed to cover a range of:
- Discharge diagnoses (HTN, DM, DVT, post-op, CHF, COPD, sepsis, stroke, etc.)
- Text formats (bullet lists, numbered lists, paragraph prose, mixed case, abbreviations)
- Difficulty levels (clean standard format through non-standard headers, typos, embedded symbols)

## Held-Out Rule

Cases 01-08 are in `data/tune/`. They were used during parser development.
Cases 09-15 are in `data/heldout/`. **They were not read during parser
development.** The eval script (`scripts/eval.ts`) runs both sets and
reports them separately. The held-out score is the honest measure of
generalization.

## Metrics

| Metric | Definition |
|--------|-----------|
| Med Recall | (matched meds) / (expected meds in answer key). Match = drug name substring overlap |
| Med Precision | (matched meds) / (total meds parsed). Measures false positives |
| Dose Accuracy | (exact dose + unit match) / (matched meds). Among matched drugs only |
| Unparsed Rate | (unparsed lines) / (non-empty lines in masked text) |
| FK Grade | Flesch-Kincaid Grade Level on all `plainText` output strings combined |
| Hallucinations | Numbers in `plainText` not present in source span (target: 0) |

## Known Limitations

1. **Section detection**: highly non-standard header text (e.g., embedded in
   sentences) may prevent section splitting. All content before the first
   detected section header is ignored.

2. **Lexicon coverage**: the drug lexicon covers ~200 entries. Unusual brand
   names, combination drugs with non-standard naming, or newly approved
   generics will be missed and go to the unparsed list.

3. **Paragraph format**: the parser is optimized for line-by-line input. Dense
   paragraph-format summaries (case 11) have lower recall because multiple
   drugs appear on one line and only the first may be found.

4. **Frequency precision**: frequency terms embedded in complex sentences
   (e.g., "take one tablet the morning after surgery") are not matched by the
   simple substring map.

## Running the Evaluation

```bash
npm run eval
```

Output is a markdown table printed to stdout and uploaded as a CI artifact.
