# The Magic of Articles

Added after Mystery House through a Lesson 2 wrapper. The existing MysteryHouse component, its twelve round IDs and steps are unchanged. The wrapper keeps its screen in a separate `articles/v1/page` answer. Three theory screens and four games use stable `articles/v1/` keys inside the existing Lesson 2 record. Existing Supabase, queue and conflict behavior apply; no SQL/Auth changes.

Progress now comprises 12 warm-up rounds and 41 article stages (3 theory screens, 10 sorted words, 10 reveal choices, 12 gaps, 6 corrections). It measures participation, not automatic correctness. Teacher mode alone renders task answer keys and explanations; the existing learner restriction is reused. Every answer is editable. `none` is an explicit value for zero article, rendered without a dash in the English sentence.

Vocabulary and illustrations reuse the existing lessons: ten familiar professions/places; the same job atlas cell or place illustration is used in both reveal windows. No new vocabulary lists, homework or Question Words exercises.

Source limitation: the requested https://englex.ru/using-articles-in-english/ could not be retrieved: curl error 56, CONNECT tunnel failed, HTTP 403. The theory therefore follows the owner's supplied scope and examples plus basic article grammar; it is not represented as a verified adaptation of that article. Source review remains outstanding.
