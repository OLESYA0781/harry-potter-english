# Lesson 1 — Present Simple

Route: `/#/lessons/lesson-1`. Catalog order is explicitly Lesson 1, Lesson 0, Trial Lesson. Existing grammar, Trial Lesson, Homework and Lesson 0 are unchanged.

## Source and tasks

The supplied `go_getter_3_student_s_book.pdf` (116 pages) was read and visually checked at printed/PDF pages 4–5. The site transcribes these pages; it does not publish the full PDF. Existing filled-in annotations in the PDF are not included as pupil answers. Source notes appear only in Teacher mode.

| Stage | Implementation |
| --- | --- |
| Welcome, p. 4 Ex. 1 | Original George/Harry/Emma/Poppy/Gran dialogue and all four comprehension questions |
| Grammar Room | Existing six Present Simple grammar slides and saved notes |
| Ex. 3 | Original six sentences, including the two printed worked examples; four response fields; interactive busy-day calendar and free-day response |
| Ex. 4 | Original ten places; personal response to “Which places do you visit for fun?” |
| Ex. 5 | Original five sentences; worked stadium example and four empty response fields |
| Ex. 6 | Original ten transport words, original page-4 photograph and a response field identifying visible transport |
| Ex. 7 | Original numbered transport illustrations, worked Emma/bus dialogue and four question/answer dialogue fields in original order |
| Ex. 8 | Original page-4 dialogue shown again; seven fields for its seven sentences containing frequency adverbs |
| Ex. 9 | Five personal sentences; original model and vocabulary from both boxes |

Exercise 2 (pair role play) is intentionally omitted per the original task specification. Teacher mode is local UI state using the existing access policy. It is never persisted in pupil progress.

## Media availability

The attached PDF contains no usable original audio/video. The owner supplied the Yandex Disk folder `https://disk.yandex.ru/d/eQvibNgP2JDQkg/Go%20getter%203`. Fetching its public API from the managed environment fails with `URLError: <urlopen error Tunnel connection failed: 403 Forbidden>`; the web tool also reports the folder inaccessible. A supported network-permission grant was obtained and the API retried, but the sidecar still denies the domain. Environment policy is restricted and enforced. Original media files cannot yet be inspected or downloaded; no file URLs are guessed.

Intro Video 0.1 and audio 1.2, 1.3, 1.4 remain null in `materials.ts` until actual files are available. No synthetic replacements are used. Missing media is stated briefly; all text-based tasks can be read and completed with a teacher. A media playback event is never treated as evidence that a response was completed. To connect media, allow `cloud-api.yandex.net`, `disk.yandex.ru` and the actual returned download host in the environment’s outbound policy, or attach the four original files directly.

The two local WebP illustrations are cropped from the supplied PDF: the page-4 photograph needed by Ex. 6 and numbered page-5 transport pictures needed by Ex. 7. Alt text provides equivalent visual information.

## Saving and completion

Responses and the busy-day array use stable `intro:p4-1-*` and `exerciseN:p5-N-*` keys inside the existing version-1 `@vika/lesson/lesson-1` record. Grammar notes and previously saved fields are preserved. Drafts are stored verbatim, without grading, automatic correction or answer disclosure. Printed worked examples are not editable and do not count as required response fields.

All nonblank response fields and the selected-day calendar are required for Exercise 3; the other tasks require their nonblank responses. Six viewed grammar slides and eight completed textbook tasks yield 14/14 and the existing finish screen. Correctness is not a completion requirement.

No change to Supabase Auth, RPC/CAS, local queue, conflict resolution, SQL or environment variables. The lesson remains one whole-record conflict unit. No production pupil data is read or modified.

## Verification

Production build, unit coverage of completion and printed-example exclusion, browser coverage of all nine stages, six slides, original task counts, calendar/draft reload, teacher-only annotations, full completion and responsive layouts at 390/768/1024/1366px. Isolated cloud integration checks verify new responses/calendar and existing notes restoring on another device, plus existing offline conflict behavior and preservation of other lessons.
