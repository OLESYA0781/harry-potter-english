# Illustration assets

Original generated artwork for this educational project, in a consistent warm cinematic 3D storybook style. No external image URLs or API keys are required. WebP encodings retain the original atlas dimensions and layout.

- `characters.webp`: 3 columns × 4 rows. First six cells: Harry, Hermione, Ron, Draco, Hagrid, Dumbledore. Last six: their matching actions (tea, reading, sandwich, ball, sleeping, writing).
- `objects.webp`: 6 columns × 6 rows. School objects, food and drinks, daily routine scenes, rewards and five facial expressions. Cell mapping: `artCells` in `src/Art.tsx`.
- `environments.webp`: two side-by-side square scenes: castle and common room.

CSS displays individual cells using background positions, preserving aspect ratio. Emoji in lesson data are stable internal tokens for saved answers; `ArtIcon` and `IllustratedText` render them as illustrations, not platform-dependent emoji glyphs. Rendering changes must preserve existing localStorage identifiers and scoring logic.

- `differences.webp`: 2 × 2 atlas for the bonus comparison scene: the same ginger pupil eating an apple / drinking water; wooden table; wooden chair. Both pictures reuse the same scene and prop assets so only five defined regions change.
