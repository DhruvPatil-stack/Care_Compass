# Changelog

All notable changes to CareCompass are documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-10-12

### Added
- Rule-based discharge summary parser (normalize, maskPHI, splitSections, parseMedication, parseFollowUp, parseRestrictions)
- Drug lexicon with 200+ generic and brand-name entries (needs clinical review)
- Medical term glossary with 80+ plain-language explanations
- Frequency-to-times-of-day mapping (daily, BID, TID, QID, q4h, q6h, q8h, q12h, qHS, qAM, PRN, with meals)
- Source-span safety check: every output number must appear in the source text
- PHI masking step (names, DOB, MRN, phone, email, SSN)
- Next.js 15 App Router UI with Tailwind CSS v3
- Checklist grouped by Morning, Afternoon, Evening, As Needed
- Progress bar for tasks completed
- "Show source" toggle that highlights the source span in original text
- Unparsed lines panel with "Ask your nurse" message
- localStorage persistence with versioned key (carecompass_checklist_v1)
- Print CSS via @media print
- Accessibility: WCAG AA contrast, aria labels, keyboard focus, 375px mobile layout
- Disclaimer banner on all pages
- PHI mask preview step before generating checklist
- 15 synthetic discharge cases (8 tune, 7 held-out)
- Evaluation script (scripts/eval.ts) with medication recall, precision, dose accuracy, FK grade, hallucination count
- Vitest test suite (50+ tests) covering all parser functions
- HAZARDS.md with 10-row ISO 14971 risk table
- GitHub Actions CI workflow
- CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
- Issue templates, PR template, Dependabot config

[0.1.0]: https://github.com/DhruvPatil-stack/Care_Compass/releases/tag/v0.1.0
