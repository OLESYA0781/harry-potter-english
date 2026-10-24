import { describe, it, expect } from "vitest";
import {
  grammarChallenges,
  isGrammarAnswerCorrect,
  emptyGrammarProgress,
  grammarSummary,
} from "./grammarChallenges";
describe("twenty written grammar questions", () => {
  const fixtures = {
    A2: [
      "visited",
      "ate",
      "didn't go",
      "Did",
      "is",
      "taller",
      "the most hardworking",
      "many",
      "any",
      "drawing",
    ],
    B1: [
      "visited",
      "finished",
      "since",
      "was reading",
      "studies",
      "would buy",
      "is spoken",
      "who",
      "was",
      "must",
    ],
  } as const;
  for (const level of ["A2", "B1"] as const) {
    it(`${level} has exactly ten questions and validates every required answer`, () => {
      expect(grammarChallenges[level]).toHaveLength(10);
      fixtures[level].forEach((value, i) => {
        expect(
          isGrammarAnswerCorrect(
            grammarChallenges[level][i],
            `  ${value.toUpperCase()}  `,
          ),
        ).toBe(true);
        expect(
          isGrammarAnswerCorrect(grammarChallenges[level][i], "banana"),
        ).toBe(false);
        expect(isGrammarAnswerCorrect(grammarChallenges[level][i], "")).toBe(
          false,
        );
      });
    });
  }
  it("accepts full forms, curly apostrophes, extra spacing and relative alternatives", () => {
    expect(
      isGrammarAnswerCorrect(grammarChallenges.A2[2], "did not   go"),
    ).toBe(true);
    expect(isGrammarAnswerCorrect(grammarChallenges.A2[2], "didn’t go")).toBe(
      true,
    );
    expect(isGrammarAnswerCorrect(grammarChallenges.B1[5], "’d buy")).toBe(
      true,
    );
    expect(isGrammarAnswerCorrect(grammarChallenges.B1[7], "that")).toBe(true);
    expect(isGrammarAnswerCorrect(grammarChallenges.B1[7], "which")).toBe(
      false,
    );
  });
  it("preserves first attempts and distinguishes hints, errors, retries and skips", () => {
    const p = emptyGrammarProgress();
    p.entries[0] = {
      value: "visited",
      hintUsed: true,
      skipped: false,
      editing: false,
      attempts: [
        { answer: "visit", correct: false, hintUsed: false },
        { answer: "visited", correct: true, hintUsed: true },
      ],
    };
    p.entries[1] = {
      value: "ate",
      hintUsed: false,
      skipped: false,
      editing: false,
      attempts: [{ answer: "ate", correct: true, hintUsed: false }],
    };
    p.entries[2].skipped = true;
    let s = grammarSummary("A2", p);
    expect(s).toMatchObject({
      firstCorrect: 1,
      independent: 1,
      correctNow: 2,
      hinted: 1,
      correctAfterHint: 1,
      wrongAttempts: 1,
      retries: 1,
      skipped: 1,
      unanswered: 7,
    });
    expect(s.review.map((q) => q.topic)).toContain(
      "Past Simple — regular verbs",
    );
    p.finished = true;
    s = grammarSummary("A2", p);
    expect(s.skipped).toBe(8);
    expect(s.unanswered).toBe(0);
  });
});
