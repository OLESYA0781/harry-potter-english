# Lesson 0 — The Magic of To Be

Source inspected: attached `golicynskij.pdf`, 545 PDF pages. PDF page 127 is the Present Simple to be table. Printed pages 127–129 are PDF pages 128–130 and contain Exercises 157–160. The source PDF is not copied into public assets.

## Theory and layout

Thirteen sections: the original TO BE diagram; affirmative forms/contractions; negatives; questions; short answers; six practice sections; My Hogwarts Profile; cheat sheet. The first diagram is preserved and contains no exercises. The supplied theory examples “She is happy”, student/friends/ready short answers and profile models come from the task specification; they are not claimed to be textbook examples. Standard contractions are shown alongside the source's full forms.

## Exercise provenance

| Website block | Original source | How it is used |
| --- | --- | --- |
| Complete the sentences | Ex. 157: 5, first sentence of 9, 14, 16, 17, 18, 19; Ex. 160: 7, 8 | Nine original sentences in source order; type am/is/are without choices. |
| Make negative sentences | Ex. 157: 5, first sentence of 9, 14, 16, 17, 18 | Explicitly labelled adaptation. Original instruction is gap filling. Source gaps are filled in the given statements, then the pupil writes a full negative sentence. This is not presented as an original negative-transformation exercise. |
| Make questions | Same six Ex. 157 source statements | Explicitly labelled adaptation to writing complete questions. This is not presented as an original question-transformation exercise. |
| Correct the mistakes | Not found in the inspected Present Simple to be section (table, Ex. 157–160) | Informational unavailable block only. No invented incorrect sentences or answer field. Excluded from completion. |
| Read and complete | Ex. 157, item 20 | Original coherent Helen paragraph, eight to be gaps. Original already-complete “has” sentences remain as reading context, not new grammar exercises. |
| Mixed Grammar Challenge | Ex. 157: 7, 8, 10, 11, 13, 15 | Original dialogues and order. Adapted interaction: rewrite the complete dialogue with filled gaps, rather than selecting one missing word. No extra tense or advanced material from Ex. 160 is added. |
| My Hogwarts Profile | Author-created, explicitly labelled | Three statements, two negatives, two questions, seven empty fields; one model per sentence type. |

All exercise text is transcribed from the attached file. Typographic spaces and ellipses are normalized. No fabricated grammar-error exercise or hidden answer key is included. Book translation exercises 158–159 are not claimed as implemented. To add an original error-correction task later, supply the relevant source page or authorize a clearly labelled author-created exercise.

## Saving and progress

Reuse the existing version-1 lesson record at `@vika/lesson/lesson-0`; the catalog ID and ordering remain unchanged. Responses are keyed by stable block/source-item identifiers and stored verbatim. Source sentences, theory and examples are separate from answers. There are no automatic correctness checks, grades, Correct! or Try again! messages.

Viewed theory and filled exercises determine completion: six theory sections (including the cheat sheet), five available book practice blocks and the author profile, twelve available parts total. The unavailable error-correction block never counts as completed. The summary explicitly notes its absence even at 100% of available content. No fields are reset when navigating.

The existing Supabase RPC, local write-ahead queue, version checks and explicit conflict UI remain unchanged. Concurrent edits within Lesson 0 are one versioned lesson-record conflict unit; both versions are retained for a choice. Trial Lesson, Homework and Lesson 1 fields are preserved. No migration, new environment variables or production database changes are required.

## Verification

Build and unit tests; all thirteen stages and source counts on desktop/iPad/phone; original diagram; exact draft persistence after reload; empty unavailable block; no correctness messages. Isolated SQL/RPC cloud test checks second-device restoration, offline conflicts and preservation of Trial, Homework and Lesson 1. The real student database is not read or modified.
