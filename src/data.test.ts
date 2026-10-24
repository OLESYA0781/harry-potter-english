import { describe, it, expect } from "vitest";
import { diagnose, initial, skillNames } from "./data";
import type { LessonState, Skill } from "./data";
describe("balanced preliminary diagnosis", () => {
  it("does not infer a level from unfinished tasks", () => {
    expect(diagnose(initial).level).toBeNull();
  });
  it("requires teacher assessment as well as every automatic task", () => {
    const s: LessonState = structuredClone(initial);
    const counts: Partial<Record<Skill, number>> = {
      Vocabulary: 3,
      Grammar: 8,
      "Reading comprehension": 10,
      Listening: 5,
      "Sentence building": 11,
    };
    for (const [skill, count] of Object.entries(counts))
      for (let i = 0; i < count; i++)
        s.scores[`${skill}${i}`] = {
          skill: skill as Skill,
          first: true,
          correct: true,
        };
    expect(diagnose(s).level).toBeNull();
    for (let i = 0; i < 7; i++) s.ratings[`speak${i}`] = 2;
    s.ratings.story = 2;
    s.ratings.reading = 2;
    expect(diagnose(s).level).toBe("A2");
    s.ratings.reading = 0;
    expect(diagnose(s).level).toBe("A1");
    expect(diagnose(s).metrics.map((m) => m.skill)).toEqual(skillNames);
  });
  it("retries earn stars but do not inflate diagnostic scores", () => {
    const s = structuredClone(initial);
    s.scores.test = { skill: "Grammar", first: false, correct: true };
    expect(
      diagnose(s).metrics.find((m) => m.skill === "Grammar")?.percent,
    ).toBe(0);
  });
});
