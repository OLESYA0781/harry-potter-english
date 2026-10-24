export type GrammarLevel = "A2" | "B1";
export type GrammarQuestion = {
  topic: string;
  sentence: string;
  answers: string[];
  hint: string;
  rule: string;
};
const q = (
  topic: string,
  sentence: string,
  answers: string[],
  hint: string,
  rule: string,
): GrammarQuestion => ({ topic, sentence, answers, hint, rule });
export const grammarChallenges: Record<GrammarLevel, GrammarQuestion[]> = {
  A2: [
    q(
      "Past Simple — regular verbs",
      "Yesterday Hermione ___ (visit) her grandmother.",
      ["visited"],
      "Yesterday tells us about the past. Add the regular past ending.",
      "For regular verbs in Past Simple, add -ed: visit → visited.",
    ),
    q(
      "Past Simple — irregular verbs",
      "Ron ___ (eat) a big sandwich yesterday.",
      ["ate"],
      "Eat is an irregular verb. Think of its past form.",
      "Eat is irregular: eat → ate. Use ate for a finished past action.",
    ),
    q(
      "Past Simple — negative",
      "Harry ___ (not go) to school last Sunday.",
      ["didn't go", "did not go"],
      "Use the past negative helper, then the base verb.",
      "Use did not (didn’t) + base verb: didn’t go, not didn’t went.",
    ),
    q(
      "Past Simple — questions",
      "___ Draco play football yesterday?",
      ["did"],
      "Start a past question with a helping verb.",
      "Use Did + subject + base verb: Did Draco play…?",
    ),
    q(
      "Future — going to",
      "Hermione ___ going to read a new book tomorrow.",
      ["is"],
      "Choose the form of be for she.",
      "Use am/is/are + going to + base verb. Hermione (she) is going to read.",
    ),
    q(
      "Comparative adjectives",
      "Hagrid is ___ (tall) than Harry.",
      ["taller"],
      "Compare two people. Add the comparative ending.",
      "For a short adjective, add -er: tall → taller. Use than to compare.",
    ),
    q(
      "Superlative adjectives",
      "Hermione is ___ (hardworking) student in her class.",
      ["the most hardworking"],
      "Use three words to say she works harder than everyone else.",
      "For a long adjective, use the most + adjective: the most hardworking.",
    ),
    q(
      "Much / Many",
      "How ___ books does Hermione have?",
      ["many"],
      "Can you count books?",
      "Use many with plural countable nouns: many books. Use much with uncountable nouns.",
    ),
    q(
      "Some / Any",
      "Ron hasn't got ___ sandwiches in his bag.",
      ["any"],
      "This sentence is negative.",
      "Use any in most negative sentences: hasn’t got any sandwiches.",
    ),
    q(
      "Like / Enjoy + -ing",
      "Luna enjoys ___ (draw) pictures.",
      ["drawing"],
      "After enjoy, change the verb ending.",
      "Enjoy is followed by verb + -ing: enjoys drawing.",
    ),
  ],
  B1: [
    q(
      "Present Perfect",
      "Hermione has never ___ (visit) London.",
      ["visited"],
      "After has, use the past participle.",
      "Present Perfect uses have/has + past participle. For visit, the participle is visited.",
    ),
    q(
      "Present Perfect vs Past Simple",
      "Harry ___ (finish) his homework two hours ago.",
      ["finished"],
      "Two hours ago is a finished time in the past.",
      "Use Past Simple with a finished past time such as two hours ago: finished.",
    ),
    q(
      "Present Perfect + since",
      "Ron has lived in this house ___ 2020.",
      ["since"],
      "2020 is a starting point, not a length of time.",
      "Use since for a starting point (since 2020); use for for a duration (for two years).",
    ),
    q(
      "Past Continuous",
      "Hermione ___ (read) a book when Harry called her.",
      ["was reading"],
      "Use the past form of be and an -ing verb.",
      "Past Continuous uses was/were + -ing for an action in progress: she was reading.",
    ),
    q(
      "First Conditional",
      "If Harry ___ (study) hard, he will pass the exam.",
      ["studies"],
      "In the if part, use Present Simple. Remember he.",
      "First Conditional: if + Present Simple, will + base verb. Study changes to studies after he.",
    ),
    q(
      "Second Conditional",
      "If Ron had more money, he ___ (buy) a new bicycle.",
      ["would buy", "'d buy"],
      "This is an imaginary situation. Use a modal and the base verb.",
      "Second Conditional: if + Past Simple, would + base verb. Would buy can be contracted to ’d buy after he.",
    ),
    q(
      "Passive Voice — Present Simple",
      "English ___ (speak) in many countries.",
      ["is spoken"],
      "Use be and the past participle of speak.",
      "Present Simple passive: am/is/are + past participle. Speak → spoken: English is spoken.",
    ),
    q(
      "Relative Clauses",
      "Hermione is the girl ___ always helps her friends.",
      ["who", "that"],
      "Use a relative pronoun for a person.",
      "Who and that can both introduce this defining relative clause about a person.",
    ),
    q(
      "Reported Speech",
      "Harry said that he ___ (be) tired.",
      ["was"],
      "Report the words “I am tired” after said.",
      "In this past report, am changes to was: Harry said that he was tired.",
    ),
    q(
      "Modal Verbs — deduction",
      "Harry's bedroom light is on, so he ___ be at home.",
      ["must"],
      "You are very sure because you have evidence.",
      "Use must + base verb for a strong positive deduction: he must be at home.",
    ),
  ],
};
export type GrammarAttempt = {
  answer: string;
  correct: boolean;
  hintUsed: boolean;
};
export type GrammarEntry = {
  value: string;
  attempts: GrammarAttempt[];
  hintUsed: boolean;
  skipped: boolean;
  editing: boolean;
  ownRating?: number;
};
export type GrammarProgress = {
  index: number;
  finished: boolean;
  entries: GrammarEntry[];
};
export function emptyGrammarProgress(): GrammarProgress {
  return {
    index: 0,
    finished: false,
    entries: Array.from({ length: 10 }, () => ({
      value: "",
      attempts: [],
      hintUsed: false,
      skipped: false,
      editing: true,
    })),
  };
}
export function readGrammarProgress(value: unknown): GrammarProgress {
  const p = value as GrammarProgress | undefined;
  return p &&
    Array.isArray(p.entries) &&
    p.entries.length === 10 &&
    Number.isInteger(p.index) &&
    p.index >= 0 &&
    p.index < 10
    ? p
    : emptyGrammarProgress();
}
export function normalizeGrammarAnswer(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[‘’ʼ`]/g, "'")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/did n't/g, "didn't");
}
export function isGrammarAnswerCorrect(
  question: GrammarQuestion,
  value: string,
) {
  return question.answers.some(
    (a) => normalizeGrammarAnswer(a) === normalizeGrammarAnswer(value),
  );
}
export function grammarSummary(level: GrammarLevel, progress: GrammarProgress) {
  const entries = progress.entries;
  const firstCorrect = entries.filter((e) => e.attempts[0]?.correct).length;
  const independent = entries.filter(
    (e) => e.attempts[0]?.correct && !e.attempts[0].hintUsed,
  ).length;
  const correctNow = entries.filter((e) => e.attempts.at(-1)?.correct).length;
  const hinted = entries.filter((e) => e.hintUsed).length;
  const correctAfterHint = entries.filter((e) =>
    e.attempts.some((a) => a.correct && a.hintUsed),
  ).length;
  const wrongAttempts = entries.reduce(
    (sum, e) => sum + e.attempts.filter((a) => !a.correct).length,
    0,
  );
  const retries = entries.reduce(
    (sum, e) => sum + Math.max(0, e.attempts.length - 1),
    0,
  );
  const skipped = entries.filter(
    (e) => e.skipped || (progress.finished && !e.attempts.length),
  ).length;
  const unanswered = entries.filter(
    (e) => !e.attempts.length && !e.skipped && !progress.finished,
  ).length;
  const review = grammarChallenges[level].filter(
    (_, i) => !entries[i].attempts[0]?.correct || entries[i].hintUsed,
  );
  return {
    firstCorrect,
    independent,
    correctNow,
    hinted,
    correctAfterHint,
    wrongAttempts,
    retries,
    skipped,
    unanswered,
    review,
  };
}
