# Lesson 1 — Present Simple Homework

Open `#/homework/1`. Seven tasks cover jobs, places, transport, routines and distinguishing to be from action verbs. The Grammar Detective follows The Magic of Negatives and contains six unmarked erroneous sentences with empty full-answer fields. There are no answers, hints, correctness checks or automatic feedback.

The Magic Town, My Magical Weekly Routine and How Do They Get to Work are notebook assignments. The transport assignment is last. The opening task index and notebook completion controls are removed; historical completion values remain stored. Display numbering is sequential while section and answer IDs remain stable. The interview, negatives and detective assignments retain 8, 5 and 6 written fields respectively. All eight interview questions have visible Russian translations. Task 1 has 15 draggable job cards and descriptions, with touch, keyboard and tap alternatives; cards can be moved or returned without duplicates. Any complete placement counts, regardless of correctness.

## Persistence

All new fields use `@vika/lesson/lesson-1-homework/v1/` in the existing root progress answers. Raw text is retained verbatim. The existing local persistence, offline queue, Supabase sync and conflict resolution are reused without SQL, Auth or policy changes. Job placements form one atomic field so cross-device merges cannot duplicate a job. Concurrent changes to that field use the existing explicit conflict dialog. Older homework and lesson keys are untouched.

The global Homework menu sorts catalog entries by immutable creation date, then explicit sequence, newest first. Add future entries to `src/lessons/homeworkCatalog.ts` with a new ID, date and sequence. Lesson navigation ordering is independent. The old Trial homework implementation and saved data remain archived; `docs/homework-1.md` documents that historical work.

## Verification

Unit tests cover ordering, immutable assignment moves, completion without grading and preservation of older data. Browser tests cover seven tasks, notebook-only instructions, raw drafts after refresh, keyboard/tap, real mouse drag and emulated mobile long-press drag. Cloud tests use isolated PGlite and mocked transport to verify two-device restoration and concurrent edits without accessing the production pupil account. Pages tests exercise the repository base path and local Anna artwork. Emulated viewport checks do not constitute a physical iPhone test.

Displayed Tasks 5 (negatives) and 6 (Grammar Detective) are now notebook-only, using the same five and six prompts. Their previously saved text remains untouched in storage; only the interview retains online written fields.

Translation, negatives and detective prompts now reuse varied places and transport (museum/tram, cinema/train, stadium/bike, park/car, theatre/taxi, plane). Existing prompt IDs and archived answers are retained.

All seven tasks now distribute jobs, places and transport more broadly. The interview includes Anna (vet/bike), Ben (chef/tram) and Leo (pilot/train), with eight translated questions across the three factfiles. Free writing requests at least two professions, two places and two transport types. The notebook formats, stable IDs and existing drafts remain unchanged.

The interview was restored at the owner’s request to the original Anna-only factfile (vet, animal hospital, 9 a.m., by bus, cats and dogs, green coat) and its eight translated questions. Ben/Leo cards are removed. Other assignments retain the varied vocabulary.

Displayed Task 4 now asks for eight notebook sentences, using each frequency adverb at least once.
