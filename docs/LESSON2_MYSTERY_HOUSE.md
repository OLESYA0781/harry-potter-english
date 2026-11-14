# Lesson 2 — The Hogwarts Mystery: Questions & Articles

The only implemented block is **Warm-up — The Mystery House**, available at `#/lessons/lesson-2` above Lesson 1. Existing Lesson 0, Lesson 1, Trial and homework content is unchanged. No Question Words/articles exercises are added; those topics appear only in the requested closing teaser.

The single illustrated house has six percentage-positioned interactive doors. Door leaves animate separately from the scene and completed doors glow and remain ajar. Two rounds per room revisit to be, listening for known characters/jobs, third-person -s, negatives and do/does questions. Existing vocabulary, characters and warm-up art were reviewed; the exact requested grammar prompts are in `mysteryHouse/data.ts`.

Word cards physically move from the bank into a gap or sentence. Mouse drag and long-press touch drag use the existing dnd-kit dependency. Tapping is an alternative, and sentence tokens support return, undo and left/right movement. Native buttons also support keyboard selection. All controls retain visible focus and reduced-motion preferences are respected. Finishing all 12 rounds reveals an opening letter with the requested announcement.

## Teacher and progress

Uses the existing `canTeach` prop and teacher toggle, with the same learner restriction. Teacher text is conditionally rendered only while Teacher's Mode is active, including the read-aloud sentence, answer, round and guidance. No microphone, speech synthesis or audio calls are used. Picture accessibility labels describe the scene without declaring a correct answer.

Each round uses stable room/round IDs in the Lesson 2 state. Drafts store stable token IDs and a submitted flag; current room/round uses the lesson step. Editing a submitted answer makes that round incomplete until saved again. Completion records a complete submitted attempt, without correctness feedback or blocking: the teacher reviews the response. No automatic Correct!/Try again! messages or answer reveals. Returning home or switching rounds retains drafts. The envelope's open animation is temporary UI state; its availability derives from the twelve saved completions.

Lesson 2 reuses `readLesson`/`updateLesson`, local persistence, the offline journal/outbox and existing Supabase RPC. Its atomic record is `@vika/lesson/lesson-2`, with existing conflict resolution for concurrent edits. No schema, Auth, RLS or migration changes. Unknown draft shapes fail closed instead of overwriting stored data. Other lesson and homework keys are preserved.

## Validation

Model tests cover twelve stable rounds, movement, completion, draft validation and older-data isolation. Browser checks cover house/room layouts, hidden listening text, all twelve rounds and envelope, changing saved answers, teacher text in all rounds, mouse drag, emulated phone touch drag and tap fallback. Cloud checks use isolated PGlite and mocked transport, never the live learner database. Pages checks include direct links/reload and local assets under the repository base path. Viewport/touch emulation does not claim a physical iPhone test; passage duration remains an estimate for a teacher-led session.
