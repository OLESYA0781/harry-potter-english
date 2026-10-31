# Lesson 0 — The Magic of To Be

Source inspected: attached `golicynskij.pdf`, 545 PDF pages. PDF page 127 is the Present Simple to be table. Printed pages 127–129 are PDF pages 128–130 and contain Exercises 157–160. The source PDF is not copied into public assets.

## Theory and layout

Eight stable topics now group the original thirteen sections with theory immediately followed by matching practice. Two extra practice sections use existing textbook material: full affirmative responses and six short answers. The first diagram is preserved and contains no exercises. The supplied theory examples “She is happy”, student/friends/ready short answers and profile models come from the task specification; they are not claimed to be textbook examples. Standard contractions are shown alongside the source's full forms.

## Exercise provenance

| Website block | Original source | How it is used |
| --- | --- | --- |
| Complete the sentences | Ex. 157: 5, first sentence of 9, 14, 16, 17, 18, 19; Ex. 160: 7, 8 | Nine original sentences in source order; type am/is/are without choices. |
| Make negative sentences | Ex. 157: 5, first sentence of 9, 14, 16, 17, 18 | Explicitly labelled adaptation. Original instruction is gap filling. Source gaps are filled in the given statements, then the pupil writes a full negative sentence. This is not presented as an original negative-transformation exercise. |
| Make questions | Same six Ex. 157 source statements | Explicitly labelled adaptation to writing complete questions. This is not presented as an original question-transformation exercise. |
| Correct the mistakes | Author-created exercise supplied explicitly by the owner | Twelve supplied incorrect sentences, one full-response field per card. Internal reference answers are never rendered or used to gate completion. |
| Read and complete | Ex. 157, item 20 | Original coherent Helen paragraph, eight to be gaps. Original already-complete “has” sentences remain as reading context, not new grammar exercises. |
| Mixed Grammar Challenge | Ex. 157: 7, 8, 10, 11, 13, 15 | Original dialogues and order. Adapted interaction: rewrite the complete dialogue with filled gaps, rather than selecting one missing word. No extra tense or advanced material from Ex. 160 is added. |
| My Hogwarts Profile | Author-created, explicitly labelled | Three statements, two negatives, two questions, seven empty fields; one model per sentence type. |

All exercise text is transcribed from the attached file. Typographic spaces and ellipses are normalized. The correction exercise is explicitly identified in code as author-created on the grammar topic, not an original exercise 157–160. Its owner-supplied reference answers are internal metadata; no answers or grading are shown in the pupil interface. Book translation exercises 158–159 are not claimed as implemented. The former missing-source notice has been removed from the pupil interface.

## Saving and progress

Reuse the existing version-1 lesson record at `@vika/lesson/lesson-0`; the catalog ID and ordering remain unchanged. Responses are keyed by stable block/source-item identifiers and stored verbatim. Source sentences, theory and examples are separate from answers. There are no automatic correctness checks, grades, Correct! or Try again! messages.

Viewed theory and filled exercises determine completion: six theory sections (including the cheat sheet), seven book-based practice blocks (including the two new reinforcements), the twelve-card author-created correction exercise and the author profile, fifteen parts total. Existing earned parts and all old answer keys remain intact; the denominator grows only because two new practice sections were added. The correction block counts as complete only when all twelve responses contain non-whitespace text, irrespective of correctness. Existing response keys remain unchanged; correction answers use mistake:01 through mistake:12. No fields are reset when navigating.

The existing Supabase RPC, local write-ahead queue, version checks and explicit conflict UI remain unchanged. Concurrent edits within Lesson 0 are one versioned lesson-record conflict unit; both versions are retained for a choice. Trial Lesson, Homework and Lesson 1 fields are preserved. No migration, new environment variables or production database changes are required.

## Verification

Build and unit tests; all thirteen stages and source counts on desktop/iPad/phone; original diagram; exact draft persistence after reload; twelve correction cards, no missing-source notice; no correctness messages. Isolated SQL/RPC cloud test checks second-device restoration, offline conflicts and preservation of Trial, Homework and Lesson 1. The real student database is not read or modified.

## Theory–practice order (current)

Old order: TO BE → Affirmative → Negative → Questions → Short Answers → Complete the sentences → Make negative sentences → Make questions → Correct the mistakes → Read and complete → Mixed Grammar Challenge → My Hogwarts Profile → To Be Cheat Sheet.

| New block | Theory and immediate reinforcement | Stable topic ID |
| --- | --- | --- |
| 1 | Original TO BE diagram → existing nine am/is/are gaps | forms |
| 2 | Affirmative forms/contractions → six full affirmative responses to unchanged Ex. 157 gap prompts | affirmative |
| 3 | Negatives → existing six negative transformations | negative |
| 4 | Questions → existing six question transformations | questions |
| 5 | Short answers → six questions adapted from existing Ex. 157 dialogues 7, 8, 10, 11, 13, 15, with the original Yes/No direction | short-answers |
| 6 | Correct the mistakes (12) → Read and complete (8 gaps) → existing mixed dialogues (6) | mixed |
| 7 | Original My Hogwarts Profile (7 answers) | profile |
| 8 | Original cheat sheet and short-answer reference | summary |

The original thirteen content sections each appear exactly once. Their original task wording, item IDs and answer prefixes are retained. New practice responses use only `affirmative:<source-id>` and `short:<source-id>`. No previously removed Useful Words or manual completion controls are restored.

`toBeActiveBlock` stores the stable topic ID in the existing lesson record. Numeric `state.step` deliberately retains the representative **legacy** index for compatibility (0, 1, 2, 3, 4, 8, 11, 12), while UI numbering is 1–8. Without a marker, all thirteen old positions map to their new containing topic; for example old reading step 9 maps to Mixed Practice. A stale marker from an old client is ignored if its numeric position no longer agrees. No save is erased, migrated in the database or silently rewritten on load. Existing theory completion uses the original seen:0/1/2/3/4/12 keys.
