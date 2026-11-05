# Lesson 1 — Present Simple, course schema v2

This replaces the old Lesson 1 UI rather than appending to it. The repository catalog order and route `/#/lessons/lesson-1` are unchanged. Lesson 0, Trial Lesson, Homework, authentication and shared saving code are unchanged.

## Old blocks and dependencies

The former lesson contained Welcome (page-4 dialogue and comprehension), one Grammar Room with six slides, and page-5 Exercises 3–9. `PresentSimpleLesson.tsx` rendered `materials.ts` and `GrammarSlides.tsx`; `model.ts` counted grammar flags, intro responses and seven exercises. Those obsolete content/rendering files and the two original-PDF crops are retired. No pupil database records are deleted.

## New learning order

| Topic | Explanation followed by practice |
| --- | --- |
| 00 My Vocabulary | 15 Jobs words from page 6, with translations and optional pronunciation |
| 01 The Magic of Everyday Life | Short welcome, magic book and four bilingual examples |
| 02 When Do We Use Present Simple? | Exactly four uses: habits, facts, feelings/thoughts/states, schedules; 8 classification tasks, two per category |
| 03 Affirmative Sentences | Subject groups, endings; 10 verb gaps and 6 endings |
| 04 Means of Transport | By … rule, then two picture-only independent randomizers (transport/place); ten nonrepeating pictures per deck |
| 05 Negative Sentences | Don’t / doesn’t + base verb; 8 full negatives, 4 corrections |
| 06 Questions | Do/Does game-style table, word order; 8 reordered questions, 6 transformations |
| 07 Adverbs of Frequency | Rule, 8 positioning tasks, 5 personal sentences; Write your journeys: translate five questions and answer each using frequency adverbs (10 fields) |
| 08 Short Answers | Question panel, Yes above No; 8 written short answers |
| 09 Present Simple vs To Be | Comparison and 8 full-sentence corrections |

| 10 Переведи предложение на английский | Six written translations using vocabulary including Jobs; moved to the very end with original page and answer IDs |

There are 95 required responses and eleven topics. All topics expose direct subsection navigation: desktop nested links and a phone subsection selector, including separate links to each four-task page. Arrows remain available. Navigation persists the same stable page IDs. The opt-in dictionary remains available from every topic, along with the global My Vocabulary page.

## Sources and authorship

The owner’s supplied Go Getter 3 Student’s Book PDF was visually checked at printed/PDF pp. 4–5. Exactly the two ten-word lists and grammar targets are retained. The former long verbatim dialogue and textbook task transcriptions are removed from the active lesson. All new exercises, examples and local SVG illustrations are author-created; source references in Teacher mode identify pp. 4–5 and Ex. 3–9 as learning references, not verbatim task claims. No original book audio/video or synthetic replacement recording is represented as available. Individual-word pronunciation reuses the existing browser SpeechSynthesis approach used in Homework; there is a clear fallback for unsupported browsers.

## Versioned responses and legacy recovery

The outer shared storage record stays `{version:1,data:LessonState}` at `@vika/lesson/lesson-1`; changing that version would break the existing read/write adapter and other lessons. The new course has its own explicit schema at `answers['present-simple:v2']`:

- `schemaVersion: 2`
- `activePage`: stable page ID
- `seen`: stable topic IDs
- `responses`: stable task ID → original typed string

Every edit uses the existing functional lesson-state update and spreads the complete previous lesson/answer record. Old `step`, name, scores, ratings, grammar notes/flags/slides, `intro:*`, `exerciseN:*` and busy-day arrays are retained verbatim. They do not count toward new tasks or appear as new-task responses. A read-only “Ответы предыдущей версии урока” section exposes old written responses, notes and day selections for recovery. No database migration, destructive reset, source-index mapping or overwriting import is performed. Unknown course schemas fail closed with an error while preserving their data.

Completion counts nonblank new responses and visited topics, not correctness. Each topic completes after its responses are filled and it has been viewed. Percentages are granular across 95 responses plus 11 topic visits. No automatic Correct!/Try again! feedback or answer key is shown.

The existing Supabase RPC/CAS, local journal/queue, retry and explicit whole-lesson conflict resolution remain unchanged. Concurrent Lesson 1 edits are still one lesson-record conflict unit; both versions remain available to choose. Tests use isolated SQL/RPC fixtures only; the real pupil database is not accessed.

## Validation

Production build; unit coverage for exact topic/vocabulary/task counts, stable IDs, no old/new response mapping, legacy recovery, unknown schema handling and preservation of other lesson records. Browser checks cover all response pages and full completion, exact reload persistence, read-only recovery, dictionary interaction, speech fallback, 390/768/1024/1366px layouts and Yes/No positioning. Isolated cloud tests cover second-device restoration of matching/writing responses, legacy data and offline conflicts. Existing Lesson 0, Homework and main-menu tests remain applicable.

The entire former third topic, Vocabulary: Places in Town, is retired from navigation, pages, response requirements and completion. All `places/*` saved positions (cards, matching, gaps and Hogwarts Town) resolve to the next retained topic, Affirmative Sentences. Historical Places responses and seen flags remain stored without being counted toward active progress. Topic numbering now follows 11 retained topics and 95 active responses; all retained IDs are unchanged. Places words remain in the opt-in dictionary and My Vocabulary, and source art remains available for Lesson 0. The removed Word Order positions also resolve to Affirmative.

Final Hogwarts Challenge and the final dictionary topic are also retired; their saved page positions resume at Present Simple vs To Be and historical responses remain untouched. Removed transport vocabulary/gap/writing pages do not count toward completion. Old journey positions resolve to the new frequency practice; old matching positions resolve to the picture randomizer. Randomizer state is a separate response value, excluded from required-answer counts. Rewritten translations and journeys use new task IDs so earlier answers cannot appear under different prompts.

Printed/PDF page 6 of the supplied Go Getter 3 was visually checked: Vocabulary Jobs lists artist, builder, bus driver, chef, doctor, farmer, footballer, nurse, office worker, pilot, police officer, shop assistant, singer, teacher and vet. These 15 words were added to global My Vocabulary and the opt-in Lesson 1 dictionary. Translation prompts and dictionary examples are authored, not transcriptions of textbook exercises.
