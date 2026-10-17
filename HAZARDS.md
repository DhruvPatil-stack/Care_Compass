# HAZARDS.md
## CareCompass Risk Analysis (ISO 14971 method, simplified)

This tool is a practice/educational aid. It is NOT a medical device.
All hazards listed here reflect the real risks of misuse or parser error.

| # | Hazard | Cause | Severity | Mitigation | Residual Risk |
|---|--------|-------|----------|------------|---------------|
| H1 | Wrong dose displayed | Parser regex matches wrong number near drug name | High | Source-span check: every number in output must appear in the exact source span; fails to unparsed list | Low -- wrong-number items go to unparsed rather than output |
| H2 | Missed drug | Drug name not in lexicon OR unusual abbreviation | High | Unparsed lines panel shown with "Ask your nurse" message; lexicon covers 200+ entries | Medium -- lexicon cannot cover all brand names; user must cross-check with original paper |
| H3 | Misread frequency | "BID" parsed as "daily" or vice versa | High | Frequency map uses longest-match priority; source shown on each card via "Show source" toggle | Low -- user can verify against shown source text |
| H4 | Wrong time of day | Drug assigned to morning when it should be at bedtime (qHS) | Medium | qHS explicitly mapped to evening=true only; user sees source snippet on each card | Low |
| H5 | Masked name leaks | PHI masking regex misses an unusual name format | Medium | Masking step runs before any processing; mask preview shows user what was replaced; user reviews | Medium -- regex-only masking does not cover all name formats; tool instructs never to enter real data |
| H6 | User over-trusts the tool | Patient treats checklist as authoritative and skips reading original paperwork | High | Disclaimer banner on every page; "Ask your nurse" panel; no app store deployment; readme warns clearly | Medium -- cannot prevent misuse by determined user; design focuses on education not prescribing |
| H7 | Typo changes meaning | Input typo ("daly" instead of "daily") causes parser miss | Medium | Unparsed lines capture lines that do not match; frequency map uses fuzzy substring match | Low -- typos in frequency are common and the substring match handles most cases |
| H8 | Stale localStorage data | Old checklist persists and conflicts with new discharge instructions | Medium | localStorage key is versioned (v1); wrapped in try/catch; user sees "Start over" button; data cleared on new summary | Low -- user controls when to start over |
| H9 | Incorrect route assignment | IV medication shown as PO because "IV" not found in line | Medium | Route defaults to PO with fallback text; source span shown so user can verify | Low |
| H10 | Section not recognized | Non-standard section heading causes all meds in that section to go to unparsed | Medium | Section detection uses multiple regex patterns per section name | Medium -- highly non-standard formats will miss some sections |

## Assumptions and Scope

- This tool processes SYNTHETIC data only in production use.
- It makes NO network requests and does NOT transmit any data.
- It is NOT intended for clinical decision-making.
- A pharmacist or nurse should always review the original discharge paperwork.
