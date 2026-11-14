# Transfer of Lesson 1 blocks 08, 11, 12

Question Words, The Question Machine and Write your journeys are now available only through Lesson 2 navigation, after Articles. Lesson 1 filters those topics from its menu and progress. Content, task IDs, teacher controls and answer storage are reused intact.

Transferred work intentionally keeps its existing `present-simple:v2` keys in the original Lesson 1 record. A scoped context bridge in App reads/writes that record through the existing readLesson/updateLesson functions. No copy, deletion or SQL migration occurs: existing local/cloud answers appear immediately, and later edits use the same outbox and revision/conflict behavior. Lesson 2 progress includes transferred task answers and topic visits; Lesson 1 progress excludes them. Current course position remains shared with the original course record, with safe fallback when a topic is outside the displayed subset.

The outer Lesson 2 sidebar and mobile picker open each transferred topic. Its existing subsection selector stays visible; the duplicate inner sidebar is hidden. Lesson 0, Trial and homework are untouched.

Validation: production build, all 88 unit tests, and phone/desktop browser checks for removing the old menu entries, opening all three moved topics and restoring typed journey answers after refresh.
