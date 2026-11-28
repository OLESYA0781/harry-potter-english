# Lesson 4 — The Mystery of the Lost Bag

`#/lessons/lesson-4` is registered first in the lesson menu. Only the requested warm-up exists; no core Lesson 4 material or homework has been added. Classroom lessons 0–3 and every homework exercise are unchanged. Shared changes are the registry, the navigation link to the existing Lesson 3 revision dictionary, and menu-order assertions.

## Scene and investigation

Three locally generated WebP assets provide a dimensional three-storey English house with exactly six interactive windows, a six-character portrait sprite, and the brown bag with a notebook, wallet, blue umbrella, glasses and exactly two keys. Portraits use neutral clothes without occupation or object clues. Windows have named buttons, keyboard focus, visited states and matching portrait/dialog cards. Mobile uses the same house, followed by the dialogue; desktop shows the dialogue beside it. The sidebar links to the four warm-up subsections.

Each of the six residents has the supplied 12 clue labels. A full-question text area and Ask button appear below each clue. Only a nonempty question is required to reveal the predetermined full-sentence reply. Neither question grammar nor final conclusions are graded. Question drafts remain editable. Replies are hidden until that prompt's Ask has been pressed, and reopening/restoring a conversation preserves them.

The notebook has six known resident names as row labels and **36 initially empty, independently editable cells**. Replies never fill them. Phone/tablet layouts turn rows into labelled cards. The final stage has seven full-answer areas and one larger 4–6 sentence description area. No student answer is revealed on completion.

## Existing teacher mode

Uses the existing `canTeach` gate and teacher toggle, with a lazy-loaded answer-key panel. The panel includes expected questions, all resident replies, saved student questions, reference final answers, saved final answers and the exact supplied example description. It explicitly accepts grammatically correct alternatives and manual review. No new teacher account, authentication flow or AI API.

## Existing per-answer synchronization

The ordinary lesson adapter stores Lesson 4 under `@vika/lesson/lesson-4`. Inside it, every persisted value is a separate scalar with the stable prefix `lost-bag/v1/`:

- `question/{resident-id}/{prompt-id}` — exact question draft;
- `reply/{resident-id}/{prompt-id}` — reply opened flag;
- `dialog/active` and `dialog/visited/{resident-id}` — conversation state;
- `note/{resident-id}/{column-id}` — each notebook cell;
- `final/{question-id}` and `final/description` — independent final drafts.

The **current** `progressFields` splitter maps these through the existing `~sync/answers/…` fields and `sync_lesson_answers` individual revisions. Updates use functional `setState` and preserve other answers. No monolithic investigation answer, new storage system, production migration, account, learner ID or database is introduced. Existing durable outbox, conflict handling and owner resolution remain intact; the logged-in learner uses her existing ID.

Progress is derived from saved answers: 72 asked questions with drafts, 36 notebook cells and eight final drafts (116 entries). It checks completion, never correctness, and permits starting the final investigation before interviewing everyone. It restores from the same persisted scalar values. Opening the house or a flat alone does not complete the warm-up.

## Verification and limits

Unit checks cover the single matching owner (Emma), full replies/negatives, ungraded completion, independent outgoing answer revisions and preservation of old work. Browser checks exercise every window and all 12 prompts, hidden/revealed replies, empty manual notebook, exact drafts after reload, teacher visibility, keyboard controls, phone touch and widths 320/390/820/1440. Additional checks cover menu ordering and existing Lesson 3 interactions.

The dedicated cloud test uses two **independent browser contexts** logged in as the same fixture learner and the actual existing SQL migrations in PGlite behind intercepted Supabase requests. It checks offline durable drafts, failed offline reload followed by reconnect, non-overlapping question/reply/cell/final edits converging on both devices, individual server revision fields, no lesson-snapshot mutation, one learner progress row and untouched Lesson 3/homework data. This is an integration test of the app and RPC logic, not a claim of testing Vika's production Supabase account or two physical devices.

The site has no service worker; an already loaded page accepts offline edits, but a fresh offline navigation may need a network connection to load the app. The durable queue is preserved through that failed reload and resumes when connected. Chromium mobile emulation is not a physical iPhone test.

Verified results: 101 unit tests; all 37 synchronization integration tests; five Lesson 4 UI scenarios at 320/390/820/1440 and touch; 11 existing platform/menu/Lesson 3 scenarios; five GitHub Pages hosting/resource scenarios. Root and project-prefix production builds pass. The pre-existing large-bundle advisory remains.
