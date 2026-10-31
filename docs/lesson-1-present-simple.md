# Lesson 1 — Present Simple, course schema v2

This replaces the old Lesson 1 UI rather than appending to it. The repository catalog order and route `/#/lessons/lesson-1` are unchanged. Lesson 0, Trial Lesson, Homework, authentication and shared saving code are unchanged.

## Old blocks and dependencies

The former lesson contained Welcome (page-4 dialogue and comprehension), one Grammar Room with six slides, and page-5 Exercises 3–9. `PresentSimpleLesson.tsx` rendered `materials.ts` and `GrammarSlides.tsx`; `model.ts` counted grammar flags, intro responses and seven exercises. Those obsolete content/rendering files and the two original-PDF crops are retired. No pupil database records are deleted.

## New learning order

| Topic | Explanation followed by practice |
| --- | --- |
| 01 The Magic of Everyday Life | Short welcome, magic book and four bilingual examples |
| 02 When Do We Use Present Simple? | Exactly four uses: habits, facts, feelings/thoughts/states, schedules; 8 classification tasks, two per category |
| 03 Places in Town | Starts with Where do we go?: 8 context gaps, then five illustrated town situations with three full-sentence prompts each (location with to be, likes and opening time). The preceding vocabulary-card and matching screens are removed; all ten words remain in My Vocabulary. |
| 04 Affirmative Sentences | Subject groups, -s/-es/-ies and has; 10 verb gaps, 6 full sentences, 6 endings |
| 05 Means of Transport | All 10 illustrated words; by + transport, on foot; 10 picture/name matches, 8 gaps, 5 personal journeys |
| 06 Negative Sentences | Don’t / doesn’t + base verb; 8 full negatives, 4 corrections |
| 07 Questions | Do / Does + subject + base verb; 8 reordered questions, 6 transformations |
| 08 Short Answers | Wide question panel, Yes above No; 8 written short answers |
| 09 Adverbs of Frequency | Always / usually / often / sometimes / never; before verbs, after to be; 8 positioning tasks, 5 personal sentences |
| 10 Present Simple vs To Be | Compare statement, question, negative; 8 full-sentence corrections |
| 11 Final Hogwarts Challenge | 16 mixed tasks covering every requested target, followed by one 6–8 sentence personal Hogwarts story; no copyable model |
| 12 My Vocabulary | All 20 book words plus the 14 requested useful expressions, translations and optional browser pronunciation |

There are 148 response fields in total. Practice is paginated into at most four tasks per screen inside the 12 topics. Stable screen IDs derive from topic/unit/task IDs, never numeric slide positions. There is no fifth use category. Vocabulary opens only on request in a native modal dialog from any topic; Escape/Close restores focus and leaves the active exercise and draft intact.

## Sources and authorship

The owner’s supplied Go Getter 3 Student’s Book PDF was visually checked at printed/PDF pp. 4–5. Exactly the two ten-word lists and grammar targets are retained. The former long verbatim dialogue and textbook task transcriptions are removed from the active lesson. All new exercises, examples and local SVG illustrations are author-created; source references in Teacher mode identify pp. 4–5 and Ex. 3–9 as learning references, not verbatim task claims. No original book audio/video or synthetic replacement recording is represented as available. Individual-word pronunciation reuses the existing browser SpeechSynthesis approach used in Homework; there is a clear fallback for unsupported browsers.

## Versioned responses and legacy recovery

The outer shared storage record stays `{version:1,data:LessonState}` at `@vika/lesson/lesson-1`; changing that version would break the existing read/write adapter and other lessons. The new course has its own explicit schema at `answers['present-simple:v2']`:

- `schemaVersion: 2`
- `activePage`: stable page ID
- `seen`: stable topic IDs
- `responses`: stable task ID → original typed string

Every edit uses the existing functional lesson-state update and spreads the complete previous lesson/answer record. Old `step`, name, scores, ratings, grammar notes/flags/slides, `intro:*`, `exerciseN:*` and busy-day arrays are retained verbatim. They do not count toward new tasks or appear as new-task responses. A read-only “Ответы предыдущей версии урока” section exposes old written responses, notes and day selections for recovery. No database migration, destructive reset, source-index mapping or overwriting import is performed. Unknown course schemas fail closed with an error while preserving their data.

Completion counts nonblank new responses and visited topics, not correctness. Each topic completes after its responses are filled and it has been viewed. Percentages are granular across 148 responses plus 12 topic visits. Visiting or filling some fields never completes the final challenge. No automatic Correct!/Try again! feedback or answer key is shown.

The existing Supabase RPC/CAS, local journal/queue, retry and explicit whole-lesson conflict resolution remain unchanged. Concurrent Lesson 1 edits are still one lesson-record conflict unit; both versions remain available to choose. Tests use isolated SQL/RPC fixtures only; the real pupil database is not accessed.

## Validation

Production build; unit coverage for exact topic/vocabulary/task counts, stable IDs, no old/new response mapping, legacy recovery, unknown schema handling and preservation of other lesson records. Browser checks cover all response pages and full completion, exact reload persistence, read-only recovery, dictionary interaction, speech fallback, 390/768/1024/1366px layouts and Yes/No positioning. Isolated cloud tests cover second-device restoration of matching/writing responses, legacy data and offline conflicts. Existing Lesson 0, Homework and main-menu tests remain applicable.

Retired `places/places-cards` and `places/places-match/*` screen positions resolve to the first retained Places exercise, without rewriting stored data. Historical `place-match-*` responses remain in the v2 response map and are excluded from active task counts. All other screen/task IDs remain unchanged.

Hogwarts Town reuses the five corresponding cells from `/art/lesson-0/places.webp` (museum, café, cinema, theatre, stadium). The first museum opens at 09:00 in this authored scenario. Student fields have fresh `town-<place>-where/likes/opens` IDs; models are restricted to Teacher mode. Old `town-01`–`town-05` responses remain stored but never display under changed prompts. Old town positions resolve to the museum page. The removed Word Order screens resolve to the first Affirmative page; their response fields stay preserved and excluded from completion. Lesson 0 and its source artwork are unchanged.
