# Contributing to CareCompass

Thank you for your interest in contributing.

## Setup

```bash
git clone https://github.com/DhruvPatil-stack/Care_Compass.git
cd Care_Compass
npm install
npm run dev
```

## Branch Names

Use the format `type/short-description`, for example:
- `feat/add-wound-care-parser`
- `fix/medication-dose-regex`
- `docs/update-readme`

## Commit Messages

CareCompass uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add support for TID frequency
fix: correctly map qHS to evening time slot
docs: update HAZARDS.md with new risk entry
test: add adversarial input test for empty text
chore: upgrade vitest to v3
ci: add node 22 matrix to workflow
```

## Before Submitting a Pull Request

All of the following must pass:

```bash
npm run lint
npm run typecheck
npm test
npm run eval
npm run build
```

If `npm run eval` shows a drop in held-out recall vs the baseline in the README,
explain why in the PR description.

## No Real Patient Data

**Never include real patient data** in any pull request, issue, test case,
or commit. Use synthetic data only. Every PR template includes a required
checkbox confirming this.

## Adding to the Drug Lexicon

New entries in `src/lib/parser/lexicon.ts` must:

1. Use the lowercase generic name as the canonical form.
2. Map at least one brand name to the generic.
3. Be sourced from a public formulary or FDA label (cite in the PR).
4. Note that the file header says "NEEDS CLINICAL REVIEW" -- a licensed
   pharmacist should review lexicon changes before any clinical deployment.

## Code Style

- Strict TypeScript: no `any` types.
- Functions under 40 lines.
- Comments only when the WHY is non-obvious.
- No em dashes in any file.

## License

By contributing you agree that your contributions are licensed under the
MIT License.
