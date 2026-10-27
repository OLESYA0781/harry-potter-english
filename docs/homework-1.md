# Homework 1 — My First Hogwarts Mission

Open Trial Lesson → Homework. Lesson continues to show the original twelve chapters.

New Words contains the 15 requested entries and two additional expressions. Each has icon-only pronunciation, an example and a visible translation. Speech uses the device's English Web Speech voice; playback requires a supported browser and an installed English voice. An unavailable API, missing English voice or playback error produces a notice. Actual voice/audio quality depends on the device.

All free text is saved as entered (no trimming, correction or grading). Trimming is used only to distinguish blank fields when deriving completion. New Words requires five written recall answers. Vocabulary learned checkboxes have been removed; existing stored marks are retained without affecting completion. Grammar needs five nonblank answers; reading needs four. Both writing sections count as complete when they contain nonblank text. Manual completion checkboxes and the sentence counter have been removed; historical completion flags remain stored without affecting progress. There is no separate Mission progress tab, summary screen or star reward. Completion marks remain on the five section buttons.

## Storage and deployment

No Supabase migration, new environment variables or production database changes are needed. The existing authenticated sync_lesson RPC, allowlist RLS, durable local outbox and revision conflict resolution are reused. Each answer/mark has a separate reserved answer key:

`@vika/lesson/trial-homework/<field>`

These keys are excluded from trial scoring and trial-state reads, and retained by trial restart through the existing reserved lesson namespace. Each field syncs independently, so edits to different homework answers merge across devices; conflicts on the same field use the existing explicit resolution UI. Section completion marks are derived from these saved fields and therefore restore across devices without an additional stale progress counter. Navigation tabs are temporary UI state, not student results.

Deploy with the existing Cloudflare Pages build and Supabase variables. No secrets are added. PDF export was removed previously at the owner's request; this change does not restore it. Existing on-screen trial results remain.

## Verification

Unit tests cover completion without grading, exact-value preservation during trial reset and sentence counting. Browser tests cover vocabulary, speech API dispatch/fallback, drafts after reload, mobile/tablet/desktop layout and the original trial exercises. Cloud tests use the real existing SQL migration in isolated PGlite with mocked Auth/PostgREST transport, two browser contexts and offline edits. No production pupil data is accessed or changed.
