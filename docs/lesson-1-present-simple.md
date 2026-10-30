# Lesson 1 — Present Simple

The production catalog registers `lesson-1` before `trial`, using the existing date-based newest-first ordering. Route: `/#/lessons/lesson-1`. Trial Lesson and Homework are unchanged.

## What is ready

Nine stages: welcome, Grammar Room, then Exercises 3–9. The omitted role-play stage has not been recreated. Six interactive grammar slides implement the supplied explanation, examples, frequency scale, sentence patterns, endings, negatives, questions and cheat sheet. Stage and slide navigation restore from saved progress. Optional grammar notes preserve the pupil's original text without correction or grading.

## What is missing

No original Go Getter 3 pages, audio or video were present in the repository. No textbook exercise is represented as implemented, and no dialogue, characters or comprehension questions have been invented. No textbook media is connected or replaced with speech synthesis.

Please supply:

- Go Getter 3 Student’s Book page 4: Exercise 1, complete dialogue and character information (scan/PDF or exact original text).
- Student’s Book page 5: complete original instructions, items and answer-choice material for Exercises 3–9 (scan/PDF or exact original text).
- Intro Video 0.1.
- Audio 1.2, Audio 1.3 and Audio 1.4.

The welcome and textbook stages explicitly state that originals are awaited. They cannot become completed just by visiting the page. “Lesson 1 Complete!” only appears after all six grammar slides and the eight original textbook units (welcome + seven exercises) are complete. With originals absent, maximum available progress is 6/14 (43%). This is completion progress, not answer accuracy.

## Connecting supplied originals

Use `src/lessons/presentSimple/materials.ts` as the single integration manifest. Keep all absent resources `null` rather than inventing URLs. Add the supplied files to a local folder such as `public/lessons/lesson-1/`, then set the manifest entries to the actual local URLs. Page scans/PDFs open as references; audio/video uses native repeatable player controls, no autoplay or synthetic replacement.

Transcribe the supplied dialogue into `introduction.dialogue`. Only then author comprehension prompts strictly supported by that dialogue in `introduction.comprehension`. For each Exercise 3–9, use its exact instruction and ordered items in `exercises`. The renderer supports original text-answer items and choice items. If the original exercise needs matching, ordering or a different interaction, add the corresponding UI after inspecting the source; do not recast an unknown exercise as an invented text exercise. Stable item IDs form saved-answer keys and must not be renamed after publication.

No correctness messages or answer keys are shown. Exercise completion is based on nonblank original response fields, not grades.

## Saving

The existing `readLesson`/`updateLesson` adapter stores this module at root answer key `@vika/lesson/lesson-1`, version 1. It uses the existing authenticated Supabase RPC, local write-ahead queue, revision checks and explicit conflict resolution. Trial root fields and the reserved Homework fields are preserved. No migration, environment-variable change or production database edit is required.

The module is one existing RPC conflict unit: concurrent edits to the same lesson on different devices require the existing explicit choice; they do not silently replace one another. Progress does not use local-only component state.

## Verification

Production build, module tests, browser navigation through all nine stages and six grammar slides, note restoration, missing-resource states, responsive grammar tables/diagrams at 390/768/1024/1366px, unchanged Trial/Homework, and isolated Supabase integration tests. The real migration runs in PGlite with mocked Auth/PostgREST transport; the new two-device case covers exact notes, offline conflict choices and preservation of existing Trial/Homework fields. No production pupil data is read or modified.
