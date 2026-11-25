# Homework — Lesson 3

Route: `#/homework/3`. Added first in Homework using publication metadata, dated 25 November 2026. Existing lessons/homework are unchanged.

## Content

All exercise sentences, intentional mistakes and reference keys are transcribed from the user's supplied task. The specified reference is Speakout Third Edition A1 Workbook, Lesson 1D, printed page 9; the source workbook and original recording were not supplied with this task. The generated illustrations are new, not original workbook images.

Order: 1A Articles (15 sentences, 16 independent gaps), 1B Plurals (10), 2 Word Order (12), 3 Mistakes (15), 4A Listening Match (2 people, 4 pictures), 4B Listening Table (8 cells), 4C Listening True/False (6), 5 Ask a Question (15).

Only 1A and 4A–C are interactive. Parts 1B, 2, 3, 5 contain plain numbered lists and four independent `Done in my notebook` checkboxes. No text fields, grammar reminders, grading, automatic answers or correctness messages. Part 5 includes only the explicitly requested example; reference questions for its 15 items are loaded only when the existing Teacher's Mode is active. Existing `canTeach` access policy applies.

## Persistence

Every choice/cell and notebook mark is a separate answer key under `@vika/homework/lesson-3/`, merged via the same root `setState`, progress journal, local durable outbox and Supabase sync. No schema, Auth, RLS, queue or account changes. Completion counts filled parts without grading and does not alter Lesson 3's classroom progress. No reset or old-answer migration.

Table words support drag-and-drop and tap/click selection, then tap/click a destination. Enter supports selection; Space activates keyboard dragging. A word moves between cells; a clear button empties a cell. Every placement/removal uses the same saved answer fields.

## Missing original audio and listening keys

**`SO3_A1_WB_1D_Audio_1_12.mp3` is unavailable.** The three Listening sections clearly display this, instead of showing a broken player or substituting synthetic speech. Their interactions are implemented for use with the original recording, including if a teacher plays it separately. No Listening keys/transcript have been invented. Teacher's Mode explicitly identifies the unavailable verified keys.

To enable the three native players:

1. Supply the original, authorized file and put it at `public/audio/homework-3/SO3_A1_WB_1D_Audio_1_12.mp3`.
2. Set `originalAudio` in `src/lessons/homeworkThree/audio.ts` to `/audio/homework-3/SO3_A1_WB_1D_Audio_1_12.mp3`.
3. Verify playback, pause, seeking and replay in all three parts. All resolve the same local file through `assetUrl`, including GitHub Pages' prefix. No autoplay.
4. Verify listening keys against the original before adding any to the teacher-only module.

## Illustrations

Four individually generated 3D illustrations, saved as local WebP, visually inspected for exact quantities: A phone/sandwich/water bottle; B laptop/phone/wallet; C bag/notebook/two phones; D laptop/passport/notebook. Letter labels are interface text. Object names are not printed on the images. Phone layout uses one large illustration per row; larger screens use two.

## Checks

Unit tests cover content counts, independent double gaps/notebook marks, completion without grading, atomic table moves and root journal round-trip with old answers intact. Browser tests cover independent selections, reload, clearing/moving words, all four marks, teacher visibility, real mouse dragging, keyboard and emulated touch, local image loading and phone/tablet/desktop overflow. Existing homework/menu tests and production build are run separately. Chromium emulation does not represent a physical iPhone test. Real Supabase multi-device sync and actual audio playback remain unverified in this environment.

Validation result: 97 unit tests passed; all six new browser scenarios passed across 320/390/820/1440 widths, mouse/keyboard and touch; all 28 existing homework/menu scenarios passed (one legacy CDP long-press test timed out during a concurrent run and passed when rerun alone). Five GitHub Pages hosting checks passed, including every public asset and new Homework 3 deep-link/reload. Root and project-prefix production builds passed with the existing large-bundle advisory.
