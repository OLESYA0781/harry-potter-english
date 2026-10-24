import { useState } from "react";
import { Character, ArtIcon } from "./Art";
import {
  grammarChallenges,
  readGrammarProgress,
  grammarSummary,
  isGrammarAnswerCorrect,
} from "./grammarChallenges";
import type {
  GrammarLevel,
  GrammarProgress,
  GrammarEntry,
} from "./grammarChallenges";
export function GrammarReport({
  level,
  value,
}: {
  level: GrammarLevel;
  value: unknown;
}) {
  const p = readGrammarProgress(value),
    s = grammarSummary(level, p);
  return (
    <section className="teacher-note grammar-report">
      <h3>
        {level} Grammar: {s.firstCorrect}/10
      </h3>
      <p>
        С первой попытки: {s.firstCorrect}/10 · из них без подсказки:{" "}
        {s.independent}. Сейчас верно: {s.correctNow}/10.
      </p>
      <p>
        Использовали Hint: {s.hinted} · верно после Hint: {s.correctAfterHint} ·
        ошибочных ответов: {s.wrongAttempts} · повторных попыток: {s.retries} ·
        пропущено: {s.skipped} · ещё не проверено: {s.unanswered}.
      </p>
      {level === "B1" && (
        <p>
          Свои предложения: оценено{" "}
          {p.entries.filter((e) => e.ownRating !== undefined).length}/10 ·
          самостоятельно {p.entries.filter((e) => e.ownRating === 2).length} · с
          помощью {p.entries.filter((e) => e.ownRating === 1).length} · не смог
          ответить {p.entries.filter((e) => e.ownRating === 0).length}.
        </p>
      )}
      <strong>Темы для повторения или дополнительной проверки</strong>
      <ul>
        {s.review.map((q) => (
          <li key={q.topic}>{q.topic}</li>
        ))}
      </ul>
      {!s.review.length && (
        <p>Все темы выполнены самостоятельно с первой попытки.</p>
      )}
      <p>
        Это отдельный показатель грамматики, а не подтверждение уровня {level}.
        Общая диагностика A1–A2 учитывает другие навыки и ручные оценки
        преподавателя.
      </p>
    </section>
  );
}
export default function GrammarChallenge({
  level,
  value,
  onChange,
  teacher,
}: {
  level: GrammarLevel;
  value: unknown;
  onChange: (p: GrammarProgress) => void;
  teacher: boolean;
}) {
  const p = readGrammarProgress(value),
    q = grammarChallenges[level][p.index],
    entry = p.entries[p.index];
  const [celebrate, setCelebrate] = useState(false);
  const update = (patch: Partial<GrammarEntry>) =>
    onChange({
      ...p,
      entries: p.entries.map((e, i) =>
        i === p.index ? { ...e, ...patch } : e,
      ),
    });
  const move = (index: number) => {
    if (index === p.index) return;
    onChange({
      ...p,
      index,
      entries: p.entries.map((e, i) =>
        i === p.index && !e.attempts.length ? { ...e, skipped: true } : e,
      ),
    });
  };
  const last = entry.attempts.at(-1),
    showResult = !!last && !entry.editing;
  function check() {
    if (!entry.value.trim() || !entry.editing) return;
    const correct = isGrammarAnswerCorrect(q, entry.value);
    update({
      attempts: [
        ...entry.attempts,
        { answer: entry.value, correct, hintUsed: entry.hintUsed },
      ],
      editing: false,
      skipped: false,
    });
    if (correct) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1100);
    }
  }
  const [before, after] = q.sentence.split("___");
  return (
    <div className={`grammar-challenge grammar-${level.toLowerCase()}`}>
      <section className="grammar-hero">
        <div>
          <span className="eyebrow">
            INDEPENDENT GRAMMAR QUEST · LEVEL {level}
          </span>
          <h2>
            {level === "A2"
              ? "Hermione's Grammar Challenge — Level A2"
              : "The Wizard's Advanced Grammar Test — Level B1"}
          </h2>
          <p>
            {level === "A2"
              ? "Help Hermione complete the sentences!"
              : "Are you ready for a harder challenge?"}
          </p>
        </div>
        <Character name="Hermione" />
      </section>
      <section className="panel grammar-input-card">
        <div className="grammar-progress">
          <strong>Question {p.index + 1} of 10</strong>
          <span>
            {p.entries.filter((e) => e.attempts.length).length}/10 checked
          </span>
        </div>
        <div className="progress-track">
          <i style={{ width: `${(p.index + 1) * 10}%` }} />
        </div>
        <div
          className="grammar-question-nav"
          aria-label={`${level} question navigation`}
        >
          {p.entries.map((e, i) => (
            <button
              key={i}
              aria-label={`Question ${i + 1}`}
              aria-current={p.index === i ? "step" : undefined}
              className={`${p.index === i ? "chosen" : ""} ${e.attempts.at(-1)?.correct ? "solved" : ""}`}
              onClick={() => move(i)}
            >
              {i + 1}
              {e.attempts.at(-1)?.correct ? " ✓" : e.skipped ? " ·" : ""}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            check();
          }}
        >
          <label
            className="grammar-sentence"
            htmlFor={`grammar-answer-${level}`}
          >
            {before}
            <span className="grammar-gap">…</span>
            {after}
          </label>
          <input
            id={`grammar-answer-${level}`}
            aria-label={`Answer for ${level} question ${p.index + 1}`}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={100}
            value={entry.value}
            disabled={!entry.editing}
            placeholder="Type your answer here"
            onChange={(e) => update({ value: e.target.value, skipped: false })}
          />
          <p className="micro">
            Write the missing word or words. Press Check when you are ready.
            Next lets you skip a question.
          </p>
          <div className="grammar-actions">
            <button
              className="btn"
              type="submit"
              disabled={!entry.value.trim() || !entry.editing}
            >
              Check
            </button>
            <button
              className="pill"
              type="button"
              onClick={() => update({ hintUsed: true })}
            >
              Hint{entry.hintUsed ? " ✓" : ""}
            </button>
            <button
              className="pill"
              type="button"
              disabled={!entry.attempts.length || entry.editing}
              onClick={() => update({ editing: true })}
            >
              Try Again
            </button>
          </div>
        </form>
        {entry.hintUsed && (
          <aside className="grammar-hint">
            <strong>Hint</strong>
            <p>{q.hint}</p>
          </aside>
        )}
        {showResult && (
          <section
            className={`grammar-feedback ${last.correct ? "good" : ""}`}
            role="status"
          >
            <strong>
              {last.correct ? "Well done!" : "Good try! You can try again."}
            </strong>
            <p>
              Answer: <b>{q.answers[0]}</b>
              {q.answers.length > 1 && (
                <span> · Also accepted: {q.answers.slice(1).join(" / ")}</span>
              )}
            </p>
            <p>{q.rule}</p>
          </section>
        )}
        {level === "B1" && (
          <aside className="grammar-own-sentence">
            <h3>Can you make your own sentence?</h3>
            <p>Tell your teacher. This is optional.</p>
            {teacher && (
              <div className="rating">
                <span>Самостоятельное предложение · {q.topic}</span>
                {[
                  "Couldn’t answer",
                  "Answered with help",
                  "Answered independently",
                ].map((label, i) => (
                  <button
                    key={label}
                    className={entry.ownRating === i ? "chosen" : ""}
                    onClick={() => update({ ownRating: i })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </aside>
        )}
        <div className="round-controls">
          <button
            className="pill"
            aria-label="Previous question"
            disabled={p.index === 0}
            onClick={() => move(p.index - 1)}
          >
            Back
          </button>
          {p.index < 9 ? (
            <button
              className="btn small"
              aria-label="Next question"
              onClick={() => move(p.index + 1)}
            >
              Next
            </button>
          ) : (
            <button
              className="btn small"
              onClick={() => onChange({ ...p, finished: true })}
            >
              Finish challenge
            </button>
          )}
        </div>
        {p.finished && (
          <div className="quote">
            {level} Grammar: {grammarSummary(level, p).firstCorrect}/10 on the
            first try. You can go back and practise again!
          </div>
        )}
      </section>
      {teacher && (
        <>
          <aside className="teacher-note">
            <strong>Ответ и правило · {q.topic}</strong>
            <p>{q.answers.join(" / ")}</p>
            <p>{q.rule}</p>
            <p>
              Принимайте ввод без учёта регистра, внешних и повторных пробелов.
              История попыток сохраняется. Показ ответа после Check помогает
              учиться, но не изменяет результат первой попытки. Подсказка Hint
              учитывается отдельно.
            </p>
            {entry.attempts.length > 0 && (
              <ol>
                {entry.attempts.map((a, i) => (
                  <li key={i}>
                    Попытка {i + 1}: {a.answer} —{" "}
                    {a.correct ? "верно" : "ошибка"}
                    {a.hintUsed ? " · с Hint" : ""}
                  </li>
                ))}
              </ol>
            )}
          </aside>
          <GrammarReport level={level} value={p} />
        </>
      )}
      {celebrate && (
        <div className="grammar-celebration" role="status">
          <ArtIcon name="star" />
          Wonderful work!
        </div>
      )}
    </div>
  );
}
