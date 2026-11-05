# Lesson 1 — Hogwarts: Find the Differences

## Existing game and reuse

The earlier six-difference game is `src/Differences.tsx` in Trial Lesson, with artwork `public/art/differences.webp`. Its coordinated square pictures, warm cinematic 3D storybook common room, parchment picture captions, gold hover/focus outlines and green found markers establish the reference.

The common picture frame and percentage-hotspot renderer now live in `src/DifferencePicture.tsx`. Trial passes its unchanged six original coordinates, background positions and discovery callbacks into that component. Its illustration, rules, answer fields, ratings, six-difference count and old state IDs are unchanged. Both games use the existing `.differences-pair`, `.difference-figure`, `.difference-scene` and `.difference-hotspot` styles. Lesson 1 scopes only its new shared background, transparent layers, larger touch targets and teacher panel; reduced motion is respected.

## Placement

The new first topic is **Warm-up — Back to Hogwarts!**, before My Vocabulary and Present Simple theory, inside the existing `#/lessons/lesson-1` route. Its badge is W, preserving every existing topic number. Fresh Lesson 1 sessions open here; existing saved page positions elsewhere are deliberately retained. Subtitle: “Find 7 differences and describe them using the verb to be.” Duration: 5–7 minutes.

## Exactly seven differences

New generated artwork matches the existing reference's warm stone room, golden daylight, detailed carved furniture, burgundy textiles and friendly 3D children. `public/art/lesson-1/warmup-room.webp` is the same square background in both pictures. `warmup-pieces.webp` is one transparent 3×3 atlas. CSS crops and positions its cells without stretching; no independently redrawn second room can introduce extra differences.

| ID | Picture A | Picture B |
| --- | --- | --- |
| cat | Same cat on floor | Same cat on sofa |
| room | Clean floor | School bag, scarf and papers on floor |
| cup | Same tea cup on table | Same tea cup on floor |
| ron | Tired/yawning face | Alert face; the body layer is identical |
| books | Two red books | The same two books plus one |
| picture | Framed castle painting on wall | No painting |
| hermione | Hermione on floor in room | No Hermione |

Background lighting, windows, shelves, rug, furniture and every unchanged prop share identical source pixels. Ron’s body is shared; only the face layer changes. The painting and Hermione disappear without repainting any room region. Both generated assets are locally served WebP files, with genuine alpha on the atlas and no external image dependencies. Teacher questions and images never overlap.

## Coordinates and interaction

`WarmupDifferences.tsx` contains seven percent rectangles per picture and the matching prop positions. Cat/cup hotspots move with their objects; the other five stay at the relevant region in both pictures. A square scene preserves the coordinate system at any width. Touch targets are at least 44×44 CSS pixels. On desktop pictures share a row; on smaller screens the existing responsive pair stacks them without clipping the room. The scene children are decorative and do not intercept clicks. Keyboard discovery uses native buttons and pressed state.

Each ID counts once, independent of picture. Discoveries highlight both matching regions and update 0/7 through 7/7. Only after seven does “Amazing! You found all 7 differences!” appear. There is no Correct!/Try again! feedback or automatic oral grading. When Teacher mode is enabled after completion, the seven supplied questions and full-sentence hints appear below the game. No microphone, recording or speech recognition is used.

## State and progress

The game uses the separate response key `lesson1-warmup-differences:v1` inside the existing Lesson 1 schema-v2 course record. It never reads/writes Trial's `differencesFound`, scene version, attempts, examples or ratings. Functional updates prevent rapid clicks from dropping discoveries. Stored round shape: `{version:1, found:[semantic IDs], completedOnce:boolean}`. Duplicate/invalid IDs are ignored when reading.

Play Again resets only `found` in this round. Earlier lesson answers, other lesson records and the achieved completion flag remain. Lesson completion includes this one game task after all seven are found at least once; oral performance is not automatically assessed. No Supabase schema/Auth/RLS/queue/conflict changes, imports or resets. Existing answers remain in their original fields. Current Lesson 1: 121 required response/activity fields, 14 topics.

## Validation

Unit tests cover unique discoveries, malformed/duplicate state, round-only reset, retained Trial/written answers, completion and seven layer/coordinate definitions. Browser tests click the actual scaled coordinates of all seven regions at phone, tablet portrait/landscape and desktop sizes; verify paired highlights, repeat clicks, reload, keyboard, reset, minimum touch targets and teacher text below images. Trial's original six-difference regression tests check the shared-renderer extraction. Isolated cloud fixtures verify discoveries and replay across devices without altering Trial, Lesson 0 or earlier translations. Both root and GitHub Pages production paths are built and checked. These are Chromium emulations, not physical-device or Russian-network claims.
