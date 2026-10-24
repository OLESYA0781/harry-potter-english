import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  VolumeX,
  RotateCcw,
  GraduationCap,
  Sparkles,
  Download,
  ChevronRight,
} from "lucide-react";
import {
  people,
  actions,
  diary,
  comprehension,
  trueFalse,
  day,
  speaking,
  grammar,
  sentences,
  listening,
  items,
  bags,
  stages,
  initial,
  diagnose,
} from "./data";
import type { LessonState, Skill } from "./data";
import { Character, Castle, ArtIcon, MoodFace, IllustratedText } from "./Art";
import { Choice, Match, Order } from "./components";
import Differences, { differenceSkills } from "./Differences";

const storageKey = "hogwarts-english-v1";
function load(): LessonState {
  try {
    const s = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (
      s &&
      (s.version === 1 || s.version === 2) &&
      Number.isInteger(s.data?.step) &&
      s.data.step >= 0 &&
      s.data.step < (s.version === 1 ? stages.length - 1 : stages.length) &&
      typeof s.data.name === "string" &&
      s.data.answers &&
      s.data.scores &&
      s.data.ratings
    )
      return {
        ...s.data,
        step:
          s.version === 1 && s.data.step >= 11 ? s.data.step + 1 : s.data.step,
      };
  } catch {
    /* A new session is safe if storage is unavailable. */
  }
  return structuredClone(initial);
}
const notes = [
  "Урок рассчитан на 40–45 минут. Объясните ребёнку: можно ошибаться и пробовать снова. Ответы в первом приближении сохраняются для диагностики; за исправления ребёнок получает звёзды.",
  "Знакомство · 3 минуты. Попросите ребёнка сначала ответить устно, затем выбрать вариант. Оцените развёрнутость и самостоятельность.",
  "Предпочтения · 3 минуты. Уточните Who is your favourite character? Why? Помогите словами funny, clever, kind, brave, friendly.",
  "Present Continuous · 5 минут. Сначала задавайте вопросы по картинке, затем предложите сопоставить предложения. Ответы: Harry is drinking tea; Hermione is reading a book; Ron is eating a sandwich; Draco is playing with a ball; Hagrid is sleeping on a sofa; Dumbledore is writing a letter.",
  "Чтение · 5 минут. Сначала ребёнок читает самостоятельно. Озвучивание — помощь после попытки. Оцените беглость, произношение и самостоятельность, а не только скорость.",
  "Понимание текста · 5 минут. Попросите обосновать ответ предложением из дневника. Завтрак: eggs and toast; напиток: orange juice; обед: chicken, rice and vegetables; вечер: watches TV or reads. True/False: T F T F T.",
  "Устная речь · 5 минут. По возможности задайте уточняющий вопрос Why? Отметьте каждый из семи ответов. Подсказки не означают автоматическую низкую оценку: решение принимает преподаватель.",
  "Грамматика · 5 минут. Сначала выбор формы, затем составление предложений. Ответы: goes, is, am, likes, was, are. Не исправляйте ребёнка до первой попытки.",
  "Аудирование · 3 минуты. Дайте прослушать запись 1–2 раза. Не открывайте текст до попытки. Ответы: Ron, Harry, Hermione, Hagrid, Dumbledore. Если синтеза речи нет, прочитайте текст сами.",
  "Лексика · 3 минуты. Попросите назвать предметы и сформулировать There is / There are. Оцениваются три набора и два предложения.",
  "Связный рассказ · 3 минуты. Дайте ребёнку время составить 4–5 предложений. Оцените самостоятельность и связь предложений.",
  "Дополнительное задание A2–B1 · 5–7 минут. Найдите пять отличий: яблоко/вода у Рона; три/две книги; мяч под/на столе; чашка есть/нет; Гермиона сидит на полу/на диване. Оценивайте устное сравнение и грамматику отдельно от основной диагностики.",
  "Итоги · 2 минуты. Сначала обсудите успехи, затем рекомендации. Уровень появляется только после выполнения всех диагностических заданий и ручных оценок. Это предварительная оценка, а не официальный тест.",
];
export default function App() {
  const [state, setState] = useState<LessonState>(load),
    [teacher, setTeacher] = useState(false),
    [muted, setMuted] = useState(false),
    [audioMessage, setAudioMessage] = useState(""),
    [burst, setBurst] = useState(false),
    [storageError, setStorageError] = useState(false),
    [confirm, setConfirm] = useState(false),
    [exporting, setExporting] = useState(false);
  const [activePerson, setActivePerson] = useState(0),
    [attempt, setAttempt] = useState(false),
    [showAnswer, setShowAnswer] = useState(false),
    [readIndex, setReadIndex] = useState(-1),
    [round, setRound] = useState(0),
    [bagRound, setBagRound] = useState(0),
    [help, setHelp] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ version: 2, data: state }),
      );
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [state]);
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setAudioMessage("");
    setReadIndex(-1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.step]);
  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
    },
    [],
  );
  const answer = <T,>(id: string, fallback: T): T =>
    (state.answers[id] ?? fallback) as T;
  function save(id: string, value: unknown) {
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: value } }));
  }
  function mark(id: string, ok: boolean, skill: Skill) {
    setState((s) => ({
      ...s,
      scores: {
        ...s.scores,
        [id]: {
          correct: ok || !!s.scores[id]?.correct,
          first: s.scores[id]?.first ?? ok,
          latest: ok,
          skill,
        },
      },
    }));
    if (ok) {
      setBurst(true);
      setTimeout(() => setBurst(false), 1200);
    }
  }
  function rate(id: string, value: number) {
    setState((s) => ({ ...s, ratings: { ...s.ratings, [id]: value } }));
  }
  function speak(text: string, index = -1) {
    if (muted) {
      setAudioMessage("Sound is off. Turn it on to listen.");
      return;
    }
    if (!("speechSynthesis" in window)) {
      setAudioMessage(
        "Audio is not available. Ask your teacher to read aloud.",
      );
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-GB";
    u.rate = 0.85;
    u.onstart = () => {
      setAudioMessage("Listening…");
      setReadIndex(index);
    };
    u.onend = () => {
      setAudioMessage("Ready to listen again.");
      setReadIndex(-1);
    };
    u.onerror = () => {
      setAudioMessage("Audio is unavailable. Ask your teacher to read aloud.");
      setReadIndex(-1);
    };
    window.speechSynthesis.speak(u);
  }
  function navigate(step: number) {
    setState((s) => ({
      ...s,
      step: Math.max(0, Math.min(stages.length - 1, step)),
    }));
  }
  function rating(id: string) {
    return teacher ? (
      <div className="rating">
        <span>Оценка преподавателя</span>
        {[
          "Couldn’t answer",
          "Answered with help",
          "Answered independently",
        ].map((label, i) => (
          <button
            key={label}
            className={state.ratings[id] === i ? "chosen" : ""}
            onClick={() => rate(id, i)}
          >
            {label}
          </button>
        ))}
      </div>
    ) : null;
  }
  function result(id: string) {
    const score = state.scores[id];
    return score ? (
      <p
        role="status"
        className={`feedback ${(score.latest ?? score.correct) ? "good" : ""}`}
      >
        {(score.latest ?? score.correct)
          ? "✦ Fantastic! You did it!"
          : "Keep going! Try again."}
      </p>
    ) : null;
  }
  const select = (
    id: string,
    q: { answer: number },
    i: number,
    skill: Skill,
  ) => {
    save(id, i);
    mark(id, i === q.answer, skill);
  };
  const stars = Object.values(state.scores).filter((s) => s.correct).length;
  const diagnosis = diagnose(state);
  const bagAudioText = `Put ${bags[bagRound]
    .map((item) => `${item === "apple" ? "an" : "a"} ${item}`)
    .join(", ")
    .replace(/, ([^,]+)$/, " and $1")} in my school bag!`;
  async function pdf(cert = false) {
    setExporting(true);
    try {
      await (await import("./pdf")).downloadPDF(state, cert);
    } catch {
      setAudioMessage("Download failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate(0);
          }}
        >
          <span className="brand-icon">✦</span>
          <span>
            HOGWARTS<small>ENGLISH ADVENTURE</small>
          </span>
        </a>
        <div className="lesson-label">
          YOUR MAGICAL JOURNEY <span>01</span>
        </div>
        <nav aria-label="Lesson stages">
          {stages.map((stage, i) => (
            <button
              key={stage[0]}
              onClick={() => navigate(i)}
              aria-current={state.step === i ? "step" : undefined}
              className={`nav-item ${state.step === i ? "active" : ""}`}
            >
              <span className="nav-icon">
                <ArtIcon name={stage[2]} />
              </span>
              <span>{stage[0]}</span>
              {state.step > i ? (
                <span className="nav-done">✓</span>
              ) : (
                <small>{String(i + 1).padStart(2, "0")}</small>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="tiny-stars">✧　✦　✧</div>
          <p>
            A little courage.
            <br />A little curiosity.
            <br />
            <em>A whole lot of magic.</em>
          </p>
          <span>AGES 7–12 · LEVEL A1–A2</span>
        </div>
      </aside>
      <div className="main-shell">
        <header>
          <div className="breadcrumb">
            The English classroom <ChevronRight size={14} />
            <strong>{stages[state.step][0]}</strong>
          </div>
          <div className="header-actions">
            <span className="star-count">
              ✦ {stars}
              <span> stars</span>
            </span>
            <button
              className="icon-button"
              aria-label={muted ? "Turn sound on" : "Turn sound off"}
              onClick={() => {
                setMuted(!muted);
                window.speechSynthesis?.cancel();
              }}
            >
              {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
            </button>
            <button
              className={`teacher-toggle ${teacher ? "enabled" : ""}`}
              onClick={() => setTeacher(!teacher)}
            >
              <GraduationCap size={18} />
              <span>{teacher ? "Exit teacher mode" : "Teacher mode"}</span>
            </button>
          </div>
        </header>
        <div className="mobile-stage">
          <select
            aria-label="Choose lesson stage"
            value={state.step}
            onChange={(e) => navigate(Number(e.target.value))}
          >
            {stages.map((s, i) => (
              <option value={i} key={s[0]}>
                {i + 1}. {s[0]}
              </option>
            ))}
          </select>
        </div>
        <div className="progress-top">
          <div>
            <span>YOUR ADVENTURE</span>
            <span>
              {state.step + 1} of {stages.length} chapters
            </span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Lesson chapter"
            aria-valuenow={state.step + 1}
            aria-valuemin={1}
            aria-valuemax={stages.length}
          >
            <i
              style={{ width: `${((state.step + 1) / stages.length) * 100}%` }}
            />
          </div>
        </div>
        <main key={state.step}>
          {teacher && (
            <aside className="teacher-panel">
              <strong>
                Панель преподавателя ·{" "}
                {state.step === 0 ? "40–45 минут" : stages[state.step][0]}
              </strong>
              <p>{notes[state.step]}</p>
              <small>
                {state.step === 11
                  ? "Дополнительное задание оценивается отдельно от основной диагностики A1–A2."
                  : "Первый ответ используется в диагностике; повторные попытки приносят звёзды."}{" "}
                Режим предназначен для совместного урока, без пароля.
              </small>
            </aside>
          )}
          {state.step === 0 ? (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <div className="eyebrow">
                    <span>✧</span> A MAGICAL ENGLISH ADVENTURE
                  </div>
                  <h1>
                    Welcome to
                    <br />
                    <em>Hogwarts!</em>
                  </h1>
                  <p className="hero-subtitle">Let’s learn English together!</p>
                  <p className="hero-description">
                    A world of stories, little challenges and big discoveries.
                    Your magical journey starts here.
                  </p>
                  <button className="btn start" onClick={() => navigate(1)}>
                    Start our adventure! <ArrowRight size={19} />
                  </button>
                  <div className="lesson-meta">
                    <span>◷ 40–45 minutes</span>
                    <span>✧ Level A1–A2</span>
                    <span>♡ Learn at your pace</span>
                  </div>
                </div>
                <div className="hero-art">
                  <Castle />
                  <div className="floating-label">
                    <Sparkles size={16} /> A little English. A lot of magic.
                  </div>
                  <span className="art-star one">✦</span>
                  <span className="art-star two">✧</span>
                </div>
              </section>
              <section className="meet-strip">
                <div>
                  <span className="eyebrow">YOUR ADVENTURE COMPANIONS</span>
                  <h2>A few familiar friends</h2>
                  <p>You won’t be learning alone.</p>
                </div>
                <div className="companion-list">
                  {people.slice(0, 3).map((name, i) => (
                    <div key={name}>
                      <div className={`portrait p${i}`}>
                        <Character name={name} />
                      </div>
                      <strong>{name}</strong>
                      <small>
                        {
                          [
                            "Your brave guide",
                            "Your clever helper",
                            "Your cheerful friend",
                          ][i]
                        }
                      </small>
                    </div>
                  ))}
                </div>
              </section>
              <div className="feature-grid">
                {[
                  ["📖", "Read & discover", "Stories full of little wonders"],
                  [
                    "💬",
                    "Speak with confidence",
                    "Your ideas have their own magic",
                  ],
                  ["✦", "Learn & collect stars", "Celebrate every little step"],
                ].map((f) => (
                  <div className="feature" key={f[1]}>
                    <span>
                      <ArtIcon name={f[0]} />
                    </span>
                    <div>
                      <strong>{f[1]}</strong>
                      <p>{f[2]}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="welcome-note">
                No perfect spells needed. Just bring your curiosity.{" "}
                <span>✧</span>
              </p>
            </>
          ) : (
            <>
              <div className="section-heading">
                <span className="eyebrow">
                  CHAPTER {String(state.step + 1).padStart(2, "0")} · ENGLISH
                  ADVENTURE
                </span>
                <h1>{stages[state.step][0]}</h1>
                <p>{stages[state.step][1]}</p>
              </div>
              {state.step === 1 && (
                <section className="panel">
                  <div className="intro-grid">
                    {people.slice(0, 3).map((p, i) => (
                      <div className="intro-card" key={p}>
                        <Character name={p} />
                        <span className="eyebrow">{p} asks</span>
                        <h2>
                          {
                            [
                              "Hello! What’s your name?",
                              "How old are you?",
                              "How are you today?",
                            ][i]
                          }
                        </h2>
                        {i === 0 ? (
                          <>
                            <label className="input-label">
                              My name is…
                              <input
                                maxLength={45}
                                placeholder="Your name"
                                value={state.name}
                                onChange={(e) =>
                                  setState((s) => ({
                                    ...s,
                                    name: e.target.value,
                                  }))
                                }
                              />
                            </label>
                            <button
                              className="pill"
                              onClick={() => save("introName", true)}
                            >
                              I said my name!{" "}
                              {answer("introName", false) && "✓"}
                            </button>
                          </>
                        ) : i === 1 ? (
                          <div className="choices">
                            {[7, 8, 9, 10, 11, 12, "Another age"].map((age) => (
                              <button
                                key={age}
                                className={
                                  answer("age", "") === age ? "chosen" : ""
                                }
                                onClick={() => save("age", age)}
                              >
                                {age}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="moods">
                            {[
                              "🤩 Amazing!",
                              "😊 Happy!",
                              "🙂 Good!",
                              "🥱 Tired!",
                              "😔 Sad!",
                            ].map((mood) => (
                              <button
                                key={mood}
                                className={
                                  answer("mood", "") === mood ? "chosen" : ""
                                }
                                onClick={() => save("mood", mood)}
                              >
                                <MoodFace
                                  index={[
                                    "🤩 Amazing!",
                                    "😊 Happy!",
                                    "🙂 Good!",
                                    "🥱 Tired!",
                                    "😔 Sad!",
                                  ].indexOf(mood)}
                                />
                                <span>
                                  {mood.substring(mood.indexOf(" ") + 1)}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="speak-prompt">
                    <ArtIcon name="speaking" /> Say your answers aloud to your
                    teacher.
                  </p>
                  {rating("speak-intro")}
                </section>
              )}
              {state.step === 2 && (
                <section className="panel">
                  <h2>Do you like Harry Potter?</h2>
                  <p>
                    Move the magic star to a Harry. Then say the sentence aloud!
                  </p>
                  <div className="preference-match">
                    <Match
                      checkLabel="I have said it!"
                      sources={[
                        {
                          id: "star",
                          label: (
                            <span className="magic-star-card">
                              <ArtIcon name="star" />
                              My magic star
                            </span>
                          ),
                        },
                      ]}
                      targets={["😍", "😁", "😊", "🙂", "😕"].map(
                        (face, i) => ({
                          id: String(i),
                          label: (
                            <>
                              <MoodFace index={i} />
                            </>
                          ),
                        }),
                      )}
                      values={answer("preference", {})}
                      onChange={(v) => save("preference", v)}
                      onCheck={() => save("preferenceChecked", true)}
                    />
                  </div>
                  {answer("preferenceChecked", false) && (
                    <p role="status" className="feedback">
                      {answer<Record<string, string>>("preference", {}).star !==
                      undefined
                        ? "Lovely! Let’s talk about your favourite character."
                        : "Choose a Harry first!"}
                    </p>
                  )}
                  {answer<Record<string, string>>("preference", {}).star !==
                    undefined && (
                    <div className="quote">
                      {
                        [
                          "I love Harry Potter!",
                          "I really like Harry Potter.",
                          "I like Harry Potter.",
                          "Harry Potter is OK.",
                          "I don’t like Harry Potter.",
                        ][
                          Number(
                            answer<Record<string, string>>("preference", {})
                              .star,
                          )
                        ]
                      }
                    </div>
                  )}
                  <h2>Who is your favourite character?</h2>
                  <div className="choices">
                    {people.map((p) => (
                      <button
                        key={p}
                        className={
                          answer("favourite", "") === p ? "chosen" : ""
                        }
                        onClick={() => save("favourite", p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <h2>Why do you like this character?</h2>
                  <div className="choices">
                    {["funny", "clever", "kind", "brave", "friendly"].map(
                      (p) => (
                        <button
                          key={p}
                          className={answer("reason", "") === p ? "chosen" : ""}
                          onClick={() => save("reason", p)}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  </div>
                  <p className="speak-prompt">
                    I like {answer("favourite", "…")} because{" "}
                    {answer<string>("favourite", "") === "Hermione"
                      ? "she"
                      : "he"}{" "}
                    is {answer("reason", "…")}.
                  </p>
                </section>
              )}
              {state.step === 3 && (
                <>
                  <section className="common-room">
                    <div className="room-decor">
                      <span>✧ THE COMMON ROOM ✧</span>
                      <span className="room-books">
                        <ArtIcon name="books" />
                      </span>
                    </div>
                    <div className="room-people">
                      {people.map((p, i) => (
                        <button
                          key={p}
                          className={
                            activePerson === i
                              ? "person active-person"
                              : "person"
                          }
                          onClick={() => {
                            setActivePerson(i);
                            setAttempt(false);
                            setShowAnswer(false);
                          }}
                        >
                          <Character name={p} action />
                          <span>{p}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                  <section className="panel">
                    <h2>What is {people[activePerson]} doing?</h2>
                    <p>Look at the picture. Tell your teacher.</p>
                    <button className="pill" onClick={() => setAttempt(true)}>
                      I have tried! {attempt && "✓"}
                    </button>
                    <button
                      className="pill"
                      disabled={!attempt}
                      onClick={() => setShowAnswer(true)}
                    >
                      Show answer
                    </button>
                    {showAnswer && (
                      <p className="quote">
                        {people[activePerson]} is {actions[activePerson]}.
                      </p>
                    )}
                    <hr />
                    <h2>Match the sentences to your friends</h2>
                    <Match
                      sources={[3, 1, 5, 0, 4, 2].map((i) => ({
                        id: String(i),
                        label: `${people[i]} is ${actions[i]}.`,
                      }))}
                      targets={people.map((p, i) => ({
                        id: `p${i}`,
                        label: (
                          <>
                            <Character name={p} action />
                            <strong>{p}</strong>
                          </>
                        ),
                      }))}
                      values={answer("actionMatch", {})}
                      onChange={(v) => save("actionMatch", v)}
                      onCheck={() => {
                        const v = answer<Record<string, string>>(
                          "actionMatch",
                          {},
                        );
                        people.forEach((_, i) =>
                          mark(
                            `action${i}`,
                            v[i] === `p${i}`,
                            "Sentence building",
                          ),
                        );
                        save("actionChecked", true);
                      }}
                    />
                    {answer("actionChecked", false) && (
                      <p className="quote">
                        {
                          people.filter(
                            (_, i) =>
                              answer<Record<string, string>>("actionMatch", {})[
                                i
                              ] === `p${i}`,
                          ).length
                        }{" "}
                        / 6 matched.{" "}
                        {people.every(
                          (_, i) =>
                            answer<Record<string, string>>("actionMatch", {})[
                              i
                            ] === `p${i}`,
                        )
                          ? "Great job!"
                          : "Try the cards again!"}
                      </p>
                    )}
                  </section>
                </>
              )}
              {state.step === 4 && (
                <section className="diary panel">
                  <div className="diary-head">
                    <div>
                      <span className="eyebrow">A PAGE FROM MY DIARY</span>
                      <h2>Hermione’s School Day</h2>
                    </div>
                    <Character name="Hermione" />
                  </div>
                  <div className="audio-controls">
                    <button className="pill" onClick={() => speak(diary)}>
                      <Volume2 size={17} /> Read aloud
                    </button>
                    <button className="pill" onClick={() => speak(diary)}>
                      Repeat audio
                    </button>
                    <button
                      className="text-btn"
                      onClick={() => {
                        window.speechSynthesis?.cancel();
                        setReadIndex(-1);
                        setAudioMessage("Audio stopped.");
                      }}
                    >
                      Stop
                    </button>
                  </div>
                  {teacher && (
                    <section
                      className="teacher-note audio-transcript"
                      data-testid="audio-transcript"
                    >
                      <strong>
                        Текст аудио для преподавателя · Hermione’s School Day
                      </strong>
                      <p style={{ whiteSpace: "pre-line" }}>{diary}</p>
                    </section>
                  )}
                  <p className="micro">
                    Read aloud to your teacher. Tap a sentence when you finish
                    it.
                  </p>
                  <div className="diary-text">
                    {diary.split("\n").map((para, p) => (
                      <p key={p}>
                        {para.match(/[^.!?]+[.!?]+/g)?.map((sentence, i) => {
                          const id = `read-${p}-${i}`;
                          return (
                            <button
                              key={id}
                              className={`${answer(id, false) ? "read" : ""} ${readIndex === p ? "reading-now" : ""}`}
                              onClick={() => save(id, !answer(id, false))}
                            >
                              {sentence.trim()}{" "}
                            </button>
                          );
                        })}
                      </p>
                    ))}
                  </div>
                  <button
                    className="btn"
                    onClick={() => save("finishedReading", true)}
                  >
                    {answer("finishedReading", false)
                      ? "✓ Great job! Reading finished"
                      : "I have finished reading"}
                  </button>
                  {rating("reading")}
                </section>
              )}
              {state.step === 5 && (
                <>
                  <section className="panel">
                    <h2>A. Choose the picture</h2>
                    {comprehension.map((q, i) => (
                      <Choice
                        key={q.q}
                        id={`read${i}`}
                        {...q}
                        correct={q.answer}
                        value={answer(`read${i}`, null)}
                        options={q.options.map((o) => (
                          <span className="picture-choice">
                            <ArtIcon name={o.split(" ")[0]} />
                            {o.substring(o.indexOf(" ") + 1)}
                          </span>
                        ))}
                        onSelect={(n) =>
                          select(`read${i}`, q, n, "Reading comprehension")
                        }
                        teacher={teacher}
                      />
                    ))}
                  </section>
                  <section className="panel">
                    <h2>B. True or False?</h2>
                    {trueFalse.map(([q, truth], i) => (
                      <Choice
                        key={q}
                        id={`tf${i}`}
                        q={q}
                        options={["True", "False"]}
                        correct={truth ? 0 : 1}
                        value={answer(`tf${i}`, null)}
                        onSelect={(n) =>
                          select(
                            `tf${i}`,
                            { answer: truth ? 0 : 1 },
                            n,
                            "Reading comprehension",
                          )
                        }
                        teacher={teacher}
                      />
                    ))}
                  </section>
                  <section className="panel">
                    <h2>C. Put the day in order</h2>
                    <Order
                      words={day}
                      value={answer("dayOrder", [])}
                      onChange={(v) => save("dayOrder", v)}
                      onCheck={(ok) =>
                        mark("dayOrder", ok, "Reading comprehension")
                      }
                    />
                    {result("dayOrder")}
                    {teacher && (
                      <p className="teacher-note">
                        Порядок: встаёт → завтрак → школа → домашнее задание →
                        сон.
                      </p>
                    )}
                  </section>
                </>
              )}
              {state.step === 6 && (
                <section className="speaking-grid">
                  {speaking.map(([emoji, q, example, ru], i) => (
                    <div className="panel speaking-card" key={q}>
                      <span className="big-emoji">
                        <ArtIcon name={emoji} />
                      </span>
                      <span className="question-number">0{i + 1}</span>
                      <h2>{q}</h2>
                      <button
                        className="pill"
                        onClick={() => setHelp((h) => ({ ...h, [i]: !h[i] }))}
                      >
                        ✧ {help[i] ? "Hide help" : "Help me"}
                      </button>
                      {help[i] && <p className="quote">{example}</p>}
                      {teacher && <p className="teacher-note">{ru}</p>}
                      {rating(`speak${i}`)}
                    </div>
                  ))}
                </section>
              )}
              {state.step === 7 && (
                <>
                  <section className="panel">
                    <h2>A. Choose the correct answer</h2>
                    {grammar.map((q, i) => (
                      <Choice
                        key={q.q}
                        id={`grammar${i}`}
                        {...q}
                        correct={q.answer}
                        value={answer(`grammar${i}`, null)}
                        onSelect={(n) => select(`grammar${i}`, q, n, "Grammar")}
                        teacher={teacher}
                      />
                    ))}
                  </section>
                  <section className="panel">
                    <h2>B. Build a sentence</h2>
                    {sentences.map((words, i) => (
                      <div className="sentence-exercise" key={i}>
                        <h3>
                          Spell {i + 1} ·{" "}
                          {
                            [
                              "My morning",
                              "Right now",
                              "I can!",
                              "Things we like",
                              "My choice",
                            ][i]
                          }
                        </h3>
                        <Order
                          words={words}
                          value={answer(`sentence${i}`, [])}
                          onChange={(v) => save(`sentence${i}`, v)}
                          onCheck={(ok) =>
                            mark(`sentence${i}`, ok, "Sentence building")
                          }
                        />
                        {result(`sentence${i}`)}
                        {teacher && (
                          <p className="teacher-note">{words.join(" ")}.</p>
                        )}
                      </div>
                    ))}
                  </section>
                </>
              )}
              {state.step === 8 && (
                <section className="panel listening">
                  <span className="eyebrow">
                    MYSTERY {round + 1} OF {listening.length}
                  </span>
                  <h2>Who am I?</h2>
                  <p>Listen carefully. Choose your friend.</p>
                  <div className="audio-orb">
                    <Volume2 size={42} />
                  </div>
                  <div className="audio-controls">
                    <button
                      className="btn"
                      onClick={() => speak(listening[round].text)}
                    >
                      Listen to the clue
                    </button>
                    <button
                      className="pill"
                      onClick={() => speak(listening[round].text)}
                    >
                      Repeat audio
                    </button>
                  </div>
                  <div className="character-options">
                    {people.map((p) => (
                      <button
                        key={p}
                        aria-label={p}
                        className={
                          answer(`listen${round}`, "") === p ? "chosen" : ""
                        }
                        onClick={() => {
                          save(`listen${round}`, p);
                          mark(
                            `listen${round}`,
                            p === listening[round].answer,
                            "Listening",
                          );
                        }}
                      >
                        <Character name={p} />
                        <strong>{p}</strong>
                      </button>
                    ))}
                  </div>
                  {!!state.answers[`listen${round}`] && (
                    <p className="feedback">
                      {answer(`listen${round}`, "") === listening[round].answer
                        ? "✦ Well done!"
                        : "Try again! Listen one more time."}
                    </p>
                  )}
                  {teacher && (
                    <section
                      className="teacher-note audio-transcript"
                      data-testid="audio-transcript"
                    >
                      <strong>Текст и ответ для преподавателя</strong>
                      <p>{listening[round].text}</p>
                      <span>Ответ: {listening[round].answer}</span>
                    </section>
                  )}
                  <div className="round-controls">
                    <button
                      className="pill"
                      disabled={round === 0}
                      onClick={() => setRound(round - 1)}
                    >
                      Previous clue
                    </button>
                    <span>{round + 1} / 5</span>
                    <button
                      className="pill"
                      disabled={round === 4}
                      onClick={() => setRound(round + 1)}
                    >
                      Next clue
                    </button>
                  </div>
                </section>
              )}
              {state.step === 9 && (
                <section className="panel">
                  <span className="eyebrow">
                    PACKING CHALLENGE {bagRound + 1} OF 3
                  </span>
                  <h2>What’s in my school bag?</h2>
                  <p className="quote">{bagAudioText}</p>
                  <button className="pill" onClick={() => speak(bagAudioText)}>
                    Listen to Hermione
                  </button>
                  {teacher && (
                    <section
                      className="teacher-note audio-transcript"
                      data-testid="audio-transcript"
                    >
                      <strong>
                        Текст аудио для преподавателя · Bag {bagRound + 1}
                      </strong>
                      <p>{bagAudioText}</p>
                    </section>
                  )}
                  <Match
                    bag
                    sources={items.map(([id, emoji]) => ({
                      id,
                      label: (
                        <span className="item-label">
                          <ArtIcon name={id} />
                          {id}
                        </span>
                      ),
                    }))}
                    targets={[
                      {
                        id: "bag",
                        label: (
                          <span className="school-bag">
                            <ArtIcon name="bag" />
                            <strong>My school bag</strong>
                          </span>
                        ),
                      },
                    ]}
                    values={answer(`bag${bagRound}`, {})}
                    onChange={(v) => save(`bag${bagRound}`, v)}
                    onCheck={() => {
                      const chosen = Object.keys(answer(`bag${bagRound}`, {}));
                      mark(
                        `bag${bagRound}`,
                        chosen.length === 3 &&
                          bags[bagRound].every((i) => chosen.includes(i)),
                        "Vocabulary",
                      );
                    }}
                  />
                  {result(`bag${bagRound}`)}
                  <div className="round-controls">
                    {bags.map((_, i) => (
                      <button
                        key={i}
                        className={`pill ${i === bagRound ? "chosen" : ""}`}
                        onClick={() => setBagRound(i)}
                      >
                        Bag {i + 1}
                      </button>
                    ))}
                  </div>
                  <hr />
                  <h2>Say it, then build it!</h2>
                  {[
                    ["There", "is", "a book", "in the bag"],
                    ["There", "are", "two pencils", "in the bag"],
                  ].map((words, i) => (
                    <div className="sentence-exercise" key={i}>
                      <p className="there-art">
                        {i === 0 ? (
                          <ArtIcon name="book" />
                        ) : (
                          <>
                            <ArtIcon name="pencil" />
                            <ArtIcon name="pencil" />
                          </>
                        )}
                      </p>
                      <Order
                        words={words}
                        value={answer(`there${i}`, [])}
                        onChange={(v) => save(`there${i}`, v)}
                        onCheck={(ok) => mark(`there${i}`, ok, "Grammar")}
                      />
                      {result(`there${i}`)}
                    </div>
                  ))}
                </section>
              )}
              {state.step === 10 && (
                <section className="panel">
                  <h2>Can you tell me about your day?</h2>
                  <p>
                    Tell your teacher 4–5 sentences. Your story is your magic!
                  </p>
                  <div className="story-prompts">
                    {[
                      ["🌅", "Morning", "I usually get up at…"],
                      ["🍳", "Breakfast", "For breakfast I eat…"],
                      ["🏫", "School", "My favourite subject is…"],
                      ["⚽", "Free time", "After school I…"],
                      ["🌙", "Evening", "In the evening I prefer…"],
                    ].map(([e, title, text]) => (
                      <div key={title}>
                        <span className="big-emoji">
                          <ArtIcon name={e} />
                        </span>
                        <h3>{title}</h3>
                        <p>{text}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn"
                    onClick={() => save("storyDone", true)}
                  >
                    {answer("storyDone", false)
                      ? "✦ Great storytelling!"
                      : "I have told my story!"}
                  </button>
                  {rating("story")}
                </section>
              )}
              {state.step === 11 && (
                <Differences
                  teacher={teacher}
                  answers={state.answers}
                  ratings={state.ratings}
                  onAnswer={save}
                  onRate={rate}
                />
              )}
              {state.step === 12 && (
                <>
                  <section className="panel congratulations">
                    <div className="trophy">
                      <ArtIcon name="trophy" />
                    </div>
                    <span className="eyebrow">YOUR MAGIC IS GROWING</span>
                    <h2>
                      Congratulations{state.name ? `, ${state.name}` : ""}!
                    </h2>
                    <p>You have completed your English Adventure!</p>
                    <div className="final-stars">
                      ✦ <strong>{stars}</strong> golden stars
                    </div>
                    <p>
                      You read, listened, shared your ideas and tried new
                      things.
                      <br />
                      That’s something to be proud of.
                    </p>
                    <label className="input-label">
                      Name on your certificate
                      <input
                        maxLength={45}
                        value={state.name}
                        placeholder="Your name"
                        onChange={(e) =>
                          setState((s) => ({ ...s, name: e.target.value }))
                        }
                      />
                    </label>
                    <button
                      className="btn"
                      disabled={exporting}
                      onClick={() => pdf(true)}
                    >
                      <Download size={18} /> Download certificate
                    </button>
                    <p className="micro">
                      Your teacher can open teacher mode to see your results.
                    </p>
                  </section>
                  {teacher && (
                    <section className="panel">
                      <h2>Результаты диагностики</h2>
                      <p className="teacher-note">
                        Счёт основан на первых попытках. Звёзды учитывают
                        исправленные ответы. Для полного результата отметьте
                        семь ответов Speaking, чтение вслух и финальный рассказ.
                      </p>
                      <div className="metrics">
                        {diagnosis.metrics.map((m) => (
                          <div key={m.skill}>
                            <strong>{m.skill}</strong>
                            <span>
                              {m.percent === null
                                ? "Не оценено"
                                : `${m.percent}%`}{" "}
                              · {m.done}/{m.total}
                            </span>
                            <div className="progress-track">
                              <i style={{ width: `${m.percent ?? 0}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="quote">
                        Предварительный уровень:{" "}
                        <strong>
                          {diagnosis.level ?? "Недостаточно данных"}
                        </strong>
                      </div>
                      <p>
                        Это предварительная оценка по нескольким навыкам, а не
                        официальный языковой тест. A2: каждый навык ≥65%,
                        среднее ≥80%; A1+: каждый ≥40%, среднее ≥60%; иначе A1.
                        Уровень доступен только после полной оценки.
                      </p>
                      <h3>Рекомендации преподавателю</h3>
                      {diagnosis.metrics
                        .filter((m) => m.percent === null || m.percent < 70)
                        .map((m) => (
                          <p key={m.skill}>
                            • <strong>{m.skill}:</strong>{" "}
                            {m.percent === null
                              ? "завершите задания и ручную оценку."
                              : {
                                  Vocabulary:
                                    "повторите школьные предметы и названия еды.",
                                  Grammar:
                                    "повторите be, Present Simple, Present Continuous, was/were и There is / are.",
                                  "Reading comprehension":
                                    "ищите ключевые факты в коротких текстах.",
                                  Listening:
                                    "слушайте короткие описания и выделяйте признаки персонажей.",
                                  Speaking:
                                    "тренируйте короткие ответы, затем добавляйте because.",
                                  "Sentence building":
                                    "повторите порядок слов и like + -ing.",
                                  "Reading aloud":
                                    "читайте по 5 минут в день, обращая внимание на окончания.",
                                }[m.skill]}
                          </p>
                        ))}
                      {diagnosis.metrics.every(
                        (m) => m.percent !== null && m.percent >= 70,
                      ) && (
                        <p>
                          Все навыки проявились уверенно. Добавляйте развёрнутые
                          ответы и короткие самостоятельные истории.
                        </p>
                      )}
                      <aside className="teacher-note">
                        <strong>
                          Дополнительное задание · Find the Differences · A2–B1
                        </strong>
                        <p>
                          Найдено:{" "}
                          {Array.isArray(state.answers.differencesFound)
                            ? state.answers.differencesFound.length
                            : 0}
                          /5. Оценки не входят в основной уровень A1–A2.
                        </p>
                        {differenceSkills.map(([id, title]) => (
                          <p key={id}>
                            {title}:{" "}
                            {state.ratings[`difference-${id}`] === undefined
                              ? "Не оценено"
                              : [
                                  "Не смог ответить",
                                  "С помощью",
                                  "Самостоятельно",
                                ][state.ratings[`difference-${id}`]]}
                          </p>
                        ))}
                      </aside>
                      <button
                        className="btn"
                        disabled={exporting}
                        onClick={() => pdf()}
                      >
                        <Download size={18} /> Download results (PDF)
                      </button>
                    </section>
                  )}
                </>
              )}
            </>
          )}
          {audioMessage && (
            <p className="audio-message" role="status">
              {audioMessage}
            </p>
          )}
          {storageError && (
            <p role="alert">
              Progress cannot be saved in this browser. Keep this page open
              during your lesson.
            </p>
          )}
        </main>
        <footer>
          <button
            className="text-btn"
            disabled={state.step === 0}
            onClick={() => navigate(state.step - 1)}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span>
            Made for little learners with big imaginations <span>✧</span>
          </span>
          <div>
            <button
              className="text-btn restart"
              onClick={() => setConfirm(true)}
            >
              <RotateCcw size={14} /> Restart
            </button>
            {state.step < stages.length - 1 && (
              <button
                className="btn small"
                onClick={() => navigate(state.step + 1)}
              >
                Next <ArrowRight size={16} />
              </button>
            )}
          </div>
        </footer>
      </div>
      {burst && (
        <div className="star-burst" aria-hidden="true">
          ✦　✧　✦<small>Great job!</small>
        </div>
      )}
      {confirm && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-title"
          >
            <Sparkles />
            <h2 id="reset-title">Start a new adventure?</h2>
            <p>
              This will clear your answers, stars and teacher ratings on this
              device.
            </p>
            <button
              autoFocus
              className="pill"
              onClick={() => setConfirm(false)}
            >
              Keep learning
            </button>
            <button
              className="btn"
              onClick={() => {
                window.speechSynthesis?.cancel();
                setState(structuredClone(initial));
                setRound(0);
                setBagRound(0);
                setHelp({});
                setConfirm(false);
              }}
            >
              Restart lesson
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
