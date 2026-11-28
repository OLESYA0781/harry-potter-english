# Lesson 4 — Countries, Nationalities and People

## Source and agreed scope

Primary source: user-uploaded `lesson-4-textbook-pages.pdf`, SHA-256 `81b38351c734ad517b0ea4e1c47c825900815926646f2714125ce1ebc56fa153` (8 PDF leaves). Printed page numbers were checked visually, not inferred from PDF indices:

| Printed page | PDF leaf | Used material |
| --- | --- | --- |
| 8 | 1 | Hello, photographs A/B, Exercises 1A–3D |
| 19 | 2 | Complete 2OnABikeUK blog and photographs A–C, Reading 5A–E, Grammar 6A/B, Speaking 7 instruction |
| 92 | 3 | Original I/you reference, practice conversations 1 and 2, original photograph |
| 96 | 4 | Original we/you/they reference and all three practice exercises |
| 125 | 5 | Section 1A countries and nationalities: Exercises 1A–D |
| 127 | 6 | Section 2A common adjectives: Exercises 1A–D and all A–K illustrations |
| 140 / 143 | subsequent user screenshots | Communication Bank **2A speaking**, Exercise 7 A–D, exact names, data, instructions and example openings |

The last two PDF leaves were checked with both PyMuPDF and Poppler and contain only footers. The user subsequently supplied readable screenshots of printed pages 140 and 143. Only **2A speaking (linked to page 19)** is transcribed; unrelated 1B speaking and other sections visible in those screenshots are excluded. Student A/B are mutually exclusive views. Each contains the original fixed three-friend facts, cover/reveal controls, original B/D oral tasks and example openings, and four independently saved original C fields.

**Remaining source limitation:** the screenshots are visible in the conversation but are not materialized as image files in this workspace. The four original friend photographs are therefore not yet embedded; no generated or unrelated replacement is used. A matching full original book was located at `https://drive.google.com/file/d/1_AhYadPBTaAZQyGWxpZVO5BlZxqGun-9/view` (67,162,080 bytes). Connector metadata and raw fetch succeed, but the executor transfer limit is 32 MiB and direct download is denied by the environment network policy. The owner declined the requested single-host grant. No further network-grant attempt or substitute photograph is made. Original screenshot/image files are still needed to crop the four exact photographs. This update completes the textual and interactive speaking activities, not the photograph requirement.

The user subsequently requested **recording labels only**, without audio assets or players. Lesson 4 therefore labels VB1.01, 1.01, 1.02 and VB2.01 at the relevant original exercises. No files, placeholder media players, speech synthesis, microphone or external AI API are added. The existing Workbook 1.12 and its older homework are unchanged.

## Content fidelity

- The existing Mystery of the Lost Bag component, data, graphics and stable response IDs are unchanged. It remains Block 1, initially visible; new blocks follow it in the requested order.
- Page 125 has the original 20 country rows, ending groups and 14 empty numbered gaps. Argentina, Poland, China, France, Germany and Switzerland retain the six preprinted nationality examples. No filled answer table replaces the exercise. Stress marks are manual character ranges on the original country names and the learner's own nationality entries, not automatically graded syllables or spelling.
- Page 8 preserves James, Sonia, Jack and all original country/city options. The existing blue-line example James → Canada → Vancouver is retained. Shanaya and Ben's conversation has its original given first answer and all eight remaining gaps. The original Grammar Bank 92 link opens the original reference inside the site plus both original practice exercises. The contraction task uses a written full-conversation answer for each of its two conversations; it does not preselect which verbs to change.
- The full blog preserves Francisca/Finn, ages, jobs, 180-person town, relationship, tandem description, original headings, four introductory paragraphs and May/June/July entries. The six bold words are retained: big, small, old, cold, tired, friendly. Reading keeps all six True/False statements (first T is supplied by the textbook) and five adjective gaps.
- Page 127 preserves the original adjective wording/order, including `and` in the word pairs, all A–K illustrations, pair-practice instructions and the coffee example. The unrelated Jobs and People subsections on the same source pages are outside the explicitly requested exercise sequence and are not added.
- Page 96 preserves Ruby/Max, all eight alternatives (the first is already underlined in the source), eight pronoun sentences (first is the printed example), Alex/Bridget, Puerto Iguazú, original word bank and 13 numbered gaps (first is printed). Other gaps and full-sentence rewrites are independently editable.
- Only the requested English grammar reminders, operational interface controls and teacher-only open-answer examples are authored additions. None replaces a textbook exercise or recasts it with Hogwarts characters.

### Original image preparation

`public/art/lesson-4/textbook/` contains source-derived WebP images. Photo A on page 8 is reassembled from the PDF's original seven image tiles at their original coordinates, to extract the actual photograph without the page-title overlay or overlapping photo B. Photo B and the eleven adjective illustrations use the PDF's original image objects. Page 19 photos and page 92 reference/photo and page 96 reference use rendered source crops. No generated replacement image is used. Full-size original reference crops are available in addition to readable reflowed reference text/tables.

## Recording labels and keys

| Recording | Original exercise locations |
| --- | --- |
| VB1.01 | page 125, 1B and 1C |
| 1.01 | page 8, 1A and 1C |
| 1.02 | page 8, 3B |
| VB2.01 | page 127, 1B |

Teacher's Mode uses the existing `canTeach` gate. Answer keys for grammar, reading and adjective matching were checked against the supplied text/images. Grammar-equivalent alternatives are reviewed manually. Stress and recording-dependent matches remain explicitly unverified because no original recording/key was supplied: only the James example is visible in the source. Those keys were not guessed. Additional source audio is not required for publication under the user's labels-only instruction; a teacher can check the listening externally.

## Saving and progress

The lesson remains ID `lesson-4` under the existing learner owner. Flat scalar task fields use `countries/v1/` with stable printed-page/exercise/item identifiers, e.g. `p125/1a/australia`, `p19/5c/2`, `p96/3/2`. Stress start/end offsets are separate fields. Oral/repeat/reading tasks have independent manual completion marks. Given answers are original examples, not editable learner responses.

All writes use the existing lesson adapter and functional `setState`; the current `~sync/answers/…` splitter, `sync_lesson_answers` individual revisions, durable outbox, conflict reconciliation and owner resolution are unchanged. No new account, learner ID, database, migration or independent storage is added. Existing warm-up answers and other lesson/homework records are preserved.

Lesson progress includes the unchanged warm-up and 27 textbook activity groups. Fields count by completion, never correctness. The Student A/B group counts the four filled C fields and two manual speaking completion marks for the selected role. A/B drafts have independent keys and survive role switching. Hiding information does not erase answers. There is no new local `Saved` status: the global existing Saved/Saving/Offline status continues to depend on server acknowledgement.

## Checks

Unit tests verify original structure/counts, given gaps, character names, blog facts, selected speaking-card progress and independent outgoing revisions preserving warm-up data. Browser tests exercise all available blocks at 320/390/820/1440, empty nationality inputs, manual stress ranges, all original images, written/selected answers, reload, teacher visibility, recording labels and absence of audio players. The unchanged warm-up is separately replayed.

The dedicated two-context integration test uses the current SQL migrations in PGlite behind intercepted Supabase requests, one fixture learner and independent local storage. It holds a server response to verify Saving until acknowledgement, then Saved; checks Offline, durable reload/reconnect, concurrent non-overlapping textbook answers, individual server revision keys, one learner progress row, unchanged warm-up/Lesson 3/homework data and hidden Teacher's Mode for the learner. This does not claim testing Vika's live Supabase account or a physical iPhone.

Verification results: 104 unit tests; nine new-textbook/warm-up UI scenarios; 11 platform/menu/Lesson 3 regression scenarios; three targeted cloud scenarios (new textbook offline/two-device/server-ack test, unchanged warm-up two-device test, and lost-ack retry test); five project-prefix hosting/resource checks. Root and GitHub Pages production builds pass, retaining only the existing large-bundle advisory. Mobile checks use Chromium emulation, not a physical iPhone. The full historical cloud suite was not rerun for these content-only changes; the current RPC/queue implementation is unchanged.


## Speaking follow-up validation

The speaking fields use `countries/v1/speaking/{a|b}/7c/{names|ages|nationality|now}`. Manual oral completion uses `speaking/{a|b}/7b/done` and `speaking/{a|b}/7d/done`. Choosing a role changes only `speaking/role`; it never deletes another role’s draft. Covering/revealing is transient. Teacher’s Mode includes the fixed facts and manual-review guidance for open choices, plus both drafts. Browser checks cover 320/390/820/1440 widths, separate roles, hiding data, reload and page overflow. The existing two-context cloud scenario is extended with an offline A draft concurrent with an online B draft to verify independent revisions and preservation of previous work.
