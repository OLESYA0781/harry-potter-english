# Lesson 0 — The Magic of To Be

## Sources

The attached `golicynskij.pdf` was inspected: PDF page 127 contains the to be table; printed pages 127–129 (PDF 128–130) contain exercises 157–160. Go Getter 3 Student’s Book, printed/PDF pages 4–5, was also inspected. Page 4 supplies family/friends vocabulary; page 5 supplies places and transport. Neither PDF is copied into public assets.

## Current sequence

| Topic | Immediate practice |
| --- | --- |
| 01 TO BE — Am / Is / Are | Nine original gap sentences: Ex. 157 items 5, 9 first sentence, 14, 16–19; Ex. 160 items 7–8 |
| 02 Affirmative Sentences | Six author-created full-sentence responses using Go Getter page 4 vocabulary |
| 03 Negative Sentences | Six author-created transformations using places from Go Getter page 5 |
| 04 Questions | Six author-created transformations using places and transport from Go Getter page 5 |
| 05 Short Answers | Six author-created questions using transport from Go Getter page 5; Yes/No direction supplied |
| 06 Mixed Practice | Owner-supplied twelve correction cards; original Helen paragraph (Ex. 157 item 20, eight gaps) |
| 07 Grammar Summary | Original cheat sheet |

My Hogwarts Profile has been removed from the interface. Repeated source sentences in the four reinforcement exercises have been replaced with distinct contexts. These are author-created grammar practice using the book’s vocabulary, not transcribed Go Getter exercises. Original gap filling, reading and correction sentences are unchanged. Mixed Grammar Challenge is removed from the interface; its historical drafts remain stored. The correction exercise is explicitly marked in code as author-created, not an original exercise 157–160. Internal reference answers are never shown or used to gate completion. No Useful Words, learned checkboxes or manual completion controls are restored.

## Saving and compatibility

The existing version-1 `@vika/lesson/lesson-0` record remains in use. Stable topic IDs drive navigation; numeric step retains its legacy representative value. The removed profile’s old step 11 opens the summary. All historical profile and practice answers remain stored unchanged.

Changed prompts have new source IDs, so an old response cannot appear under a different sentence. Previously completed versions of the four replaced practice sections still count as earned completion; otherwise all current fields must be filled. Six theory sections and seven practice sections make thirteen parts. Completion depends on non-whitespace responses, never correctness. Drafts are stored verbatim and survive navigation and reload.

Supabase Auth, RPC/CAS conflict handling, local queue, SQL migrations and production data are unchanged. Concurrent Lesson 0 edits remain a whole-lesson conflict unit. No database migration or environment-variable changes are needed. Lesson 1, Trial Lesson and Homework are untouched.

## Verification

Unit checks cover topic order, unique sentence contexts, legacy progress and position compatibility. Browser checks cover desktop, iPad and phone layouts, draft restoration, correction cards, and preservation of hidden historical profile answers. Isolated SQL/RPC cloud checks cover restoration on another device and offline conflicts without accessing the real pupil database.

Source labels, page numbers and adaptation notes are visible only while Teacher mode is enabled using the existing teacher-access policy. The toggle is local UI state and never saved into pupil progress. Pupil instructions and Yes/No directions remain visible.

Negative practice retains six sentences: two with am, two with is and two with are. Reworded prompts use new IDs; previously completed six-item versions still count.

The retired Mixed Grammar Challenge (legacy step 10) opens Mixed Practice, containing only correction and reading. It no longer contributes to completion; `mixed:*` responses are retained unchanged.


## Visual oral practice (Lesson 0 only)

The original seven-topic navigation and all thirteen graded-by-completion written/theory parts remain intact. Four new visual sections are inserted after related existing reinforcement:

- Forms: existing diagram and nine gaps, then compact **Hogwarts Magic Town — Look and Say** (ten places and ten transport words, names and translations always visible).
- Affirmative: original theory and written sentences, then **Who is this?** (four paired character pictures, displayed one at a time).
- Negative: original theory and written negatives, then **Find the False Facts** (exactly three independent scenes, three false statements each).
- Questions: original theory and written questions, then **Hogwarts Magic Town — Look and Describe** (eight selectable finished town/transport illustrations, questions and teacher-only model answers).

No microphone, recording, recognition, pronunciation scoring, mandatory written field or manual completion checkbox is added. Oral practice does not inflate or reset existing completion percentages. Teacher questions and optional false-fact corrections are rendered only in active Teacher mode using the existing access policy; question panels can be collapsed independently. Student false statements remain visible for oral correction.

Scene selection and vocabulary group state have stable `visual:v1:*` keys inside the existing Lesson 0 record; they reuse the local queue and Supabase RPC/CAS. All existing answers, theory flags, scores and ratings are preserved. No shared storage/schema/auth changes and no changes to Lesson 1 or Trial.

Artwork is original generated illustration, matched to the existing Trial Lesson character and common-room references. Finished scenes are stored locally in `public/art/lesson-0/`; CSS displays independent cells of the character and vocabulary atlases without changing the originals. The room and library are separate full landscape images; the Harry/Draco rivalry illustration is reused consistently between oral tasks. After the classroom generation failed, the owner explicitly approved reusing the existing Trial common-room illustration as the second false-fact scene. Its three statements and teacher corrections refer to the room rather than a classroom. Vocabulary words are the exact Go Getter 3 p.5 lists; the new speaking scenes and questions are author-created to-be practice.

The room was visually inspected against all eleven questions: books and wand on the desk; owl by the window; exactly three ordinary chairs plus a separate armchair; cat by the fireplace; a bright room with park/café/museum, bus and train outside. The vocabulary art must keep bus/tram distinct, car blue, two pedal bikes, café beside park, boat beside park and underground below street level so teacher prompts match the scene.

### Town-speaking refresh

The former empty-room false-fact scene is replaced by the hospital illustration from the Magic Town atlas. All three false statements now use Go Getter place names (hotel, museum, bank); teacher corrections identify the hospital. An old saved `common-room` scene selection resolves to this same second slot through a read-only alias; stored data is not rewritten on load.

The former room-description activity now uses eight existing Magic Town scenes: café, museum, park, bus, car, train, boat and bikes. Each has matching teacher questions, model full answers and text frames using to be; role-play “I am here” practices am. The selected image saves under `visual:v1:describe:scene`. No new artwork, recording or required fields are introduced. The old room image remains as an unused historical resource.

All twenty Look and Say cards show English and Russian labels immediately. Reveal buttons are removed; historical reveal flags are preserved but ignored. Teacher questions and text hints remain hidden from the pupil.
