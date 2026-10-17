# Architecture

CareCompass is a fully client-side Next.js application. No data leaves the
browser at any time.

## Pipeline

```
Raw text input
    |
    v
normalize()          -- unify line endings, collapse whitespace
    |
    v
maskPHI()            -- replace names, DOB, MRN, phone, email with [LABEL]
    |                   returns maskedText + mask log
    v
[User reviews mask preview and clicks "Generate"]
    |
    v
splitSections()      -- detect section headers by regex
    |                   returns Section[] with start/end offsets
    v
per-line parsers:
  parseMedication()  -- drug lexicon match + dose regex + frequency map
  parseFollowUp()    -- follow-up signal keywords + time frame regex
  parseRestrictions()-- category keywords + weight/duration regex
    |
    v
source-span check    -- every output number must appear in source span
    |                   fails -> unparsed list
    v
ParseResult          -- { medications[], followUps[], restrictions[], unparsed[] }
    |
    v
UI: ChecklistView    -- grouped by time of day, progress bar, source toggle
```

## Key Files

| Path | Purpose |
|------|---------|
| `src/lib/parser/index.ts` | Main pipeline entry point |
| `src/lib/parser/normalize.ts` | Text normalization |
| `src/lib/parser/maskPHI.ts` | PHI masking with regex |
| `src/lib/parser/splitSections.ts` | Section detection |
| `src/lib/parser/parseMedication.ts` | Medication parser + safety check |
| `src/lib/parser/parseFollowUp.ts` | Follow-up appointment parser |
| `src/lib/parser/parseRestrictions.ts` | Activity / diet / wound restriction parser |
| `src/lib/parser/lexicon.ts` | 200+ drug entries (NEEDS CLINICAL REVIEW) |
| `src/lib/parser/glossary.ts` | 80+ plain-language term definitions |
| `src/lib/parser/gradeLevel.ts` | Flesch-Kincaid Grade Level formula |
| `src/app/page.tsx` | Main app page (input -> mask preview -> checklist) |
| `src/components/ChecklistView.tsx` | Checklist grouped by time of day |
| `src/components/TaskCard.tsx` | Individual task card with source toggle |
| `scripts/eval.ts` | Offline evaluation against synthetic cases |
| `data/tune/` | 8 labeled synthetic cases used for development |
| `data/heldout/` | 7 labeled synthetic cases held out during development |

## Safety Design Decisions

### Source-Span Check
Every number that appears in a parsed item's `plainText` must also appear
in the source text at `[sourceStart, sourceEnd]`. If it does not, the item
is dropped to the unparsed list. This prevents the parser from inventing
doses or frequencies.

### Unparsed List
Lines the parser cannot read are shown in a yellow warning panel with the
message "We could not read this line. Ask your nurse." This ensures that
unrecognized content is surfaced rather than silently dropped.

### PHI Masking
PHI masking runs before any parsing. The user sees a preview of what was
masked before the checklist is generated. The app instructs users never to
enter real patient data.

### No External Calls
The app imports all parser logic synchronously from local modules. There is
no fetch(), no API call, and no WebSocket in the runtime path.
