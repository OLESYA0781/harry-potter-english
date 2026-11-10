# Lesson 1 warm-up artwork

Generated specifically for this project from the existing `../differences.webp` illustration as the visual reference. Warm cinematic 3D storybook rendering, honey stone, burgundy velvet, golden daylight, friendly Hogwarts pupils. No external URLs or keys.

- `warmup-room.webp`: 1254×1254 opaque shared empty common-room background.
- `warmup-pieces.webp`: 1254×1254 transparent 3×3 atlas. Row 1: Ron tired, Ron alert, Hermione. Row 2: cat, cup of tea, red book. Row 3: framed castle landscape, school bag/scarf/papers, empty cell.

CSS in `WarmupDifferences.tsx` displays atlas cells at 300% background size. Both rooms share the same backdrop and props; only the seven specified logical differences change. Ron's body is shared across both pictures and his face is clipped separately. The final scene composition and hotspot coordinates are in that component; state is independently namespaced in `warmupState.ts`.

PNG generator outputs were encoded to WebP with alpha retained; no parts of either illustration were independently repainted to make a second background. See `docs/LESSON1_WARMUP.md` for coordinate, state and validation details.

- `warmup-mess.webp`: a larger standalone transparent schoolbag/scarf/rubbish sprite used only in Picture B instead of atlas cell 7. More crumpled parchment, torn sheets and sweet wrappers make the room visibly dirtier. The entire mess remains one difference with the same saved ID and one scaled hotspot.

- `homework-anna.webp`: newly generated square storybook illustration of Anna, a vet in a green coat with a cat and dog in a bright magical animal hospital. Generated using the existing warm-up artwork as a style reference, then encoded to WebP. Used only in Lesson 1 homework Task 4; no external image dependency.
