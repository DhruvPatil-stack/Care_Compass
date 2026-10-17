# DECISIONS.md

Maintained by the build process. Each phase appends its decisions here.
This file lets work resume after a context interruption: read this file
and run `git log --oneline` to reconstruct state.

---

## Phase 0 -- Environment Check (2026-10-12)

| Item | Value |
|------|-------|
| Operating system | Windows 11 Pro (win32), x64 |
| Node version | v22.15.0 (requirement: >=20 -- PASS) |
| Git version | 2.53.0.windows.2 |
| Working directory | C:\Users\dhruv\OneDrive\Desktop\Care_Compass |
| Folder state | Empty (only .claude/ present) -- building here |
| Git init | Run in current folder; default branch set to main |
| Git user.name | Dhruv Patil (set repo-local from project context) |
| Git user.email | dp5002tb12@gmail.com (set repo-local from system context) |
| Remote origin | https://github.com/DhruvPatil-stack/Care_Compass.git |
| Remote commits | None -- fresh repository |
| ls-remote result | Empty (no output) -- remote is empty |

---

## Phase 1 -- Setup (2026-10-12)

| Decision | Choice | Reason |
|----------|--------|--------|
| Package manager | npm (comes with Node) | No extra install required |
| Next.js version | latest (15.x with App Router) | Most current stable release |
| Tailwind version | 3.x (pinned by create-next-app) | Stable API; v4 alpha is not production-ready |
| Testing framework | Vitest | Specified in requirements |
| Icon library | lucide-react | Specified in requirements |
| src/ directory | Yes | Specified in requirements |
| ESLint | Yes | Specified in requirements |
| Import alias | @/* -> ./src/* | Next.js default |

---

## Phase 2 -- Parser (2026-10-12)

| Decision | Choice | Reason |
|----------|--------|--------|
| Lexicon format | TypeScript const array | Tree-shakeable; no JSON parsing overhead |
| Glossary format | TypeScript Record<string,string> | Fast lookup at runtime |
| PHI masking strategy | Regex patterns only; no ML | Hard constraint: no external APIs |
| Frequency-to-times mapping | Static lookup table | Deterministic; no hallucination risk |
| Safety check approach | Source-span integer range comparison | Catches any number not in source text |

---

## Phase 3 -- UI (2026-10-12)

| Decision | Choice | Reason |
|----------|--------|--------|
| State management | React useState + useReducer | No external state library needed |
| localStorage key | carecompass_checklist_v1 | Versioned to allow future migration |
| Print CSS | @media print in Tailwind | No extra dependency |
| Loading threshold | 300 ms (per spec) | Only show spinner if work is slow |
| Color palette | Tailwind slate/blue/amber/red | WCAG AA 4.5:1 contrast verified |

---

## Phase 4 -- Evidence (2026-10-12)

| Decision | Choice | Reason |
|----------|--------|--------|
| Synthetic case format | Plain text .txt | Mimics real pasted input |
| Answer key format | .json alongside each case | Easy to load in eval script |
| Tune / held-out split | 8 tune, 7 held-out | Specified in requirements |
| Grade formula | Flesch-Kincaid Grade Level | Standard readability metric |

---

## Phase 5 -- Repository files (2026-10-12)

| Decision | Choice | Reason |
|----------|--------|--------|
| License | MIT | Specified in requirements |
| Badge host | shields.io | Free, no API key |
| Screenshots | Playwright (devDependency) | Specified in requirements |
| Architecture diagram | Mermaid in README | Renders natively on GitHub |

---

## Phase 6 -- Push (2026-10-17)

| Item | Value |
|------|-------|
| Commit | Initial full build: parser, UI, eval, docs, CI |
| Branch | main |
| Remote | https://github.com/DhruvPatil-stack/Care_Compass.git |
| .gitignore additions | .claude/ (local settings), eval-err.txt, eval-out.txt (generated artifacts) |
| Build status at push | next build passes, all Vitest tests pass |
