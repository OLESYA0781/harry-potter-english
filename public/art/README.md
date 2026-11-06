# Illustration assets

Original generated artwork for this educational project, in a consistent warm cinematic 3D storybook style. No external image URLs or API keys are required. WebP encodings retain the original atlas dimensions and layout.

- `characters.webp`: 3 columns × 4 rows. First six cells: Harry, Hermione, Ron, Draco, Hagrid, Dumbledore. Last six: their matching actions (tea, reading, sandwich, ball, sleeping, writing).
- `objects.webp`: 6 columns × 6 rows. School objects, food and drinks, daily routine scenes, rewards and five facial expressions. Cell mapping: `artCells` in `src/Art.tsx`.
- `environments.webp`: two side-by-side square scenes: castle and common room.

CSS displays individual cells using background positions, preserving aspect ratio. Emoji in lesson data are stable internal tokens for saved answers; `ArtIcon` and `IllustratedText` render them as illustrations, not platform-dependent emoji glyphs. Rendering changes must preserve existing localStorage identifiers and scoring logic.

- `differences.webp`: two side-by-side finished square common-room illustrations with fully opaque RGB backgrounds. Six differences: Ron’s action, book count, ball location, cup presence, Hermione sitting on the floor / on the sofa, and daytime / nighttime through the window. Notebook and pencil are identical distractors. Interactive regions are mapped in `src/Differences.tsx`.

- `common-room.webp`: one fully opaque RGB landscape illustration of all six characters together, each doing their corresponding everyday action. `src/CommonRoomScene.tsx` provides six accessible character hotspots and optional pan/zoom. Separate matching cards below are unchanged.

- `lesson-1/warmup-room.webp` and `lesson-1/warmup-pieces.webp`: new square common-room background and transparent 3×3 cutout atlas matching the original differences artwork. The two scenes share all unchanged layers and have exactly seven logical differences. Full mapping in `lesson-1/README.md` and `src/lessons/presentSimple/WarmupDifferences.tsx`.
