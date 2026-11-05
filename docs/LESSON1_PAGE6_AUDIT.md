# Lesson 1: Go Getter 3, page 6

## Audit before editing

Audited main at b026e6506f5a9a35e42223fa36e3825a53bc40c7. Printed page 6 of the supplied Go Getter 3 Student’s Book PDF was visually inspected, including exercises 1–6 and the Peter Nichols factfile.

- Ten topics (00–09), 95 required responses. Existing stable IDs, exercise prompts and answers remain unchanged.
- Six professions occur in the translation exercise at the end of block 03: doctor, artist, pilot, teacher, footballer, singer. The other nine (builder, bus driver, chef, farmer, nurse, office worker, police officer, shop assistant, vet) occur in the dictionary but not in active practice. The removed Places topic mentions doctor but is not active.
- The introductory Jobs list has all 15 words and pronunciation, but no people illustrations. Other active images concern transport and places.
- Do/Does, short answers and frequency practice exist. There is no explicit five-word Question Words sequence, subject-Who explanation, Emma/Eric/Eva reading, work-category task, Harry interview questions, Peter factfile or role-swap interview.
- Teacher mode already gates source notes and hints. The new spoken practice uses the same gate; no microphone, recording or speech recognition is added. Browser dictionary pronunciation remains optional and is not textbook audio.
- Homework 0 practices to be and vocabulary; Homework 1 is an empty retained placeholder. Homework and its attachment/saving code are outside this change, as are Lesson 0 and Trial Lesson.

## Additions and source mapping

| Source | Adaptation | Location |
| --- | --- | --- |
| Ex. 1 Emma’s Uncle | Short authored dialogue retaining Eric/artist, Madrid, Eva/chef/restaurant; four one-word gaps and two comprehension sentences. No purported book audio. | The Jobs Workshop → Emma’s Uncle |
| Ex. 2 Jobs | All 15 words with authored full-person SVG scenes, clothing/tools/workplace details, Russian translations and optional pronunciation; three cards at a time. Teacher repetition prompts appear only in Teacher mode. | 00 My Vocabulary |
| Ex. 3 Job groups | Fifteen illustrated cards; independent checkboxes allow each job in several categories. No single supposedly correct allocation. | The Jobs Workshop → Where Do People Work? |
| Ex. 4 Question Words | Explicit formula, five Russian explanations/examples/mini-tasks, subject-Who exception, short word-choice task; five Harry questions each with word choice and full written question. | 06 Questions → Question Words; Workshop → Questions about Harry’s dad |
| Ex. 5 Factfile | Exact five supplied Peter Nichols facts, illustrated doctor card visible on both answer pages; five full written answers. | Workshop → Job Factfile |
| Ex. 6 Interview | Teacher-mode-only job chooser and two independently saved blank five-field forms, one per role-swapped round. | Workshop → Job Interview |
| Authored games | Guess My Job covers all 15 job illustrations/hints, written job and one/two questions, plus gated oral prompts. Question Machine offers all five question words, removable/reusable word chunks and gated oral follow-up. | Workshop → Guess My Job / The Question Machine |

The original 95 response prompts stay in place. Each profession is additionally used in affirmative, negative and Do/Does question practice, as well as grouping and picture-description practice. Short-answer and frequency units receive five job prompts each. Transport and workplace contexts connect existing vocabulary with the new jobs. Translation practice remains last in block 03.

## Storage and completion

No new Supabase tables, migrations, Auth, RLS, queue or conflict logic. New fields use new stable IDs within the existing schema-v2 course response map. Existing selected page IDs also remain valid.

There are 216 required responses, 11 topics and 10 additional optional interview fields. Category selections and chunk order serialize as validated JSON strings. Categories count once at least one valid category is selected. Constructed questions count only once every chunk is used exactly once; grammar/order correctness is not required and no answer is revealed. Empty selections and reset questions save as empty strings. Partial questions survive reload and cloud restoration. Optional interview fields, role selection and job choices do not block completion; pupil access to Teacher mode is unchanged.

The interview has one page with two rounds of five fields; all other practice pages contain at most four tasks. Newly introduced spoken instructions and answer hints are gated by Teacher mode. Reading and Peter’s factfile remain visible on every related answer page.

## Validation

Model coverage checks all 15 jobs across practice types, every source exercise, stable IDs, multiple categories, partial/full chunk state, optional teacher fields and unchanged older responses. Browser checks exercise all card pages, responsive widths, categories, factfile persistence, chunk removal/reset, two interview rounds, direct navigation and overall completion. Isolated cloud fixtures test cross-device categories/partial questions while retaining earlier translations. Production builds cover both the root hosting path and GitHub Pages subpath. These are Chromium device-size emulations, not physical iPhone/iPad or Russian-network tests.
