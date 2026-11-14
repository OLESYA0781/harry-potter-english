# The Secret Room — The Mystery of the Golden Key

Final Lesson 2 menu item (page 11, appended without changing earlier indices). Five persistent stages use `golden-key/v1/` keys inside the existing Lesson 2 record. No new homework, vocabulary list, Auth/RLS or SQL migration.

1. Six individually illustrated city buildings accept six draggable job portraits; tap a portrait then a building as an alternative. Assigned people appear at doors and can be moved again. All six correct pairs unlock interviews.
2. Selecting a building opens its character and shuffled question tokens. The existing MagicTokens component provides drag, tap, return and reordering. The complete ordered question unlocks the character's answer and letter; no ready-made question is shown in student mode.
3. Six wax-sealed letters persist when opened. Five allow reversible elimination of locations; the artist's museum letter is neutral. Only after all letters are read and five locations excluded does the museum discovery appear.
4. Three draggable/tappable article tokens operate the museum locks. The three specified choices unlock the room.
5. A separately layered friendly guardian asks six questions via a speech bubble. Full text is saved verbatim, never grammar-graded. Any nonblank response enables Next Question, and Previous Question restores earlier answers. Finishing question six persists completion and starts the guardian/key animation. Back to Lesson 2 returns to the warm-up. Answers can be reopened after completion.

Teacher content uses the existing Lesson 2 teacher toggle/access policy and conditionally shows pairs, questions, replies, letters, articles, six reference responses and Vika's saved free text. No Correct!/Try again! popups or audio are added. Only the minimal story terms receive Russian glosses.

Every assignment, ordered question, interview status, opened letter, excluded location, article, guardian response, current phase/question and completion flag is saved with stable IDs through existing local progress, outbox and Supabase RPC. Other answer keys are retained. Existing conflict handling applies to concurrent Lesson 2 record edits. Lesson 2 base progress expands from 53 to 86 stages, plus already-transferred Lesson 1 topics; existing results are not reset.

Validation covers complete phone/desktop playthroughs, returning to prior questions, raw text after refresh, ungraded completion, teacher keys, real mouse/emulated touch dragging, and isolated cloud restoration. Emulation is not a physical iPhone test; the 15–20 minute duration is a teacher-led estimate.
