import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
export const differences = [
  {
    title: "Ron’s snack",
    skill: "Present Continuous",
    example:
      "In picture A, Ron is eating an apple, but in picture B, he is drinking water.",
    hint: "What is Ron doing?",
    ru: "Рон ест яблоко / пьёт воду. Сравнение двух действий.",
  },
  {
    title: "Books on the table",
    skill: "There are + numbers",
    example:
      "There are three books on the table in picture A, but there are only two in picture B.",
    hint: "How many books are on the table?",
    ru: "На столе три книги / две книги. Попросите использовать only.",
  },
  {
    title: "The ball",
    skill: "Prepositions of place",
    example:
      "The ball is under the table in picture A, but it is on the table in picture B.",
    hint: "Where is the ball?",
    ru: "Мяч под столом / на столе: under и on.",
  },
  {
    title: "A cup of tea",
    skill: "There is / There isn’t",
    example:
      "There is a cup of tea on the table in picture A, but there isn’t a cup of tea in picture B.",
    hint: "Is there a cup of tea in both pictures?",
    ru: "Чашка есть / отсутствует: there is и there isn’t.",
  },
  {
    title: "Where is Hermione?",
    skill: "Present Continuous + place",
    example:
      "In picture A, Hermione is sitting on the floor, but in picture B, she is sitting on the sofa.",
    hint: "Where is Hermione sitting?",
    ru: "Гермиона сидит на полу / на диване: is sitting on the floor / on the sofa.",
  },
];
export const differenceSkills = [
  ["comparison", "Comparing pictures", "Сравнение с but, in picture A / B"],
  [
    "prepositions",
    "Prepositions of place",
    "on, under; on the floor / on the sofa",
  ],
  [
    "there",
    "There is / There are",
    "Единственное/множественное число и отрицание",
  ],
  ["continuous", "Present Continuous", "is eating / is drinking / is sitting"],
] as const;
function Scene({
  variant,
  found,
  onFind,
}: {
  variant: "A" | "B";
  found: number[];
  onFind: (n: number) => void;
}) {
  const isA = variant === "A";
  const areas = [
    { left: 5, top: 37, width: 31, height: 39 },
    { left: 47, top: 52, width: 31, height: 12 },
    isA
      ? { left: 62, top: 76, width: 16, height: 15 }
      : { left: 76, top: 47, width: 14, height: 15 },
    { left: 35, top: 48, width: 13, height: 13 },
    isA
      ? { left: 75, top: 37, width: 24, height: 24 }
      : { left: 65, top: 21, width: 28, height: 25 },
  ];
  return (
    <figure className="difference-figure">
      <figcaption>
        <strong>Picture {variant}</strong>
        <span>Tap a difference</span>
      </figcaption>
      <div
        className="difference-scene"
        aria-label={`Picture ${variant}: a school common room. Find five differences.`}
        style={{ backgroundPosition: isA ? "left center" : "right center" }}
      >
        {areas.map((area, i) => (
          <button
            key={i}
            type="button"
            className={`difference-hotspot ${found.includes(i) ? "found" : ""}`}
            style={
              Object.fromEntries(
                Object.entries(area).map(([k, v]) => [k, `${v}%`]),
              ) as CSSProperties
            }
            aria-label={`Compare area ${i + 1} in picture ${variant}`}
            aria-pressed={found.includes(i)}
            onClick={() => onFind(i)}
          >
            {found.includes(i) && <span>{i + 1} ✓</span>}
          </button>
        ))}
      </div>
    </figure>
  );
}
export default function Differences({
  teacher,
  answers,
  ratings,
  onAnswer,
  onRate,
}: {
  teacher: boolean;
  answers: Record<string, unknown>;
  ratings: Record<string, number>;
  onAnswer: (key: string, value: unknown) => void;
  onRate: (key: string, value: number) => void;
}) {
  const [message, setMessage] = useState("");
  const found = Array.isArray(answers.differencesFound)
    ? answers.differencesFound.filter(
        (n): n is number =>
          Number.isInteger(n) &&
          n >= 0 &&
          n < 5 &&
          (answers.differencesSceneVersion === 2 || n !== 4),
      )
    : [];
  useEffect(() => {
    if (answers.differencesSceneVersion !== 2) {
      onAnswer("differencesFound", found);
      onAnswer("differenceAttempt4", false);
      onAnswer("differenceExample4", false);
      onAnswer("differencesSceneVersion", 2);
    }
  }, [answers.differencesSceneVersion, onAnswer]);
  const find = (i: number) => {
    if (!found.includes(i)) {
      onAnswer("differencesFound", [...found, i]);
      setMessage("Great spotting! Tell your teacher what is different.");
    } else setMessage("You found this one already. Can you describe it again?");
  };
  return (
    <>
      <section className="panel difference-intro">
        <span className="eyebrow">BONUS CHALLENGE · A2–B1 · 5–7 MINUTES</span>
        <h2>Find the Differences — Spot 5 Differences</h2>
        <p>
          Look at pictures A and B. Find five differences. Tap each one, then
          tell your teacher!
        </p>
        <div className="difference-counter" role="status">
          {found.length} / 5 differences found
          {found.length === 5 ? " · Fantastic detective work!" : ""}
        </div>
        <p className="micro">
          Use “but” to compare. Tap the matching area in either picture. You can
          use the keyboard too.
        </p>
        <div className="differences-pair">
          <Scene variant="A" found={found} onFind={find} />
          <Scene variant="B" found={found} onFind={find} />
        </div>
        <p className="feedback good" role="status">
          {message}
        </p>
        <div className="quote">In picture A, … but in picture B, …</div>
        <details className="difference-language">
          <summary>Help me with words</summary>
          <p>
            eating · drinking · apple · water · books · a cup of tea · ball ·
            Hermione · floor · sofa
          </p>
          <p>
            on · under · sitting on the floor · sitting on the sofa · there is ·
            there are · there isn’t · only
          </p>
        </details>
        <button
          className="text-btn"
          onClick={() => {
            onAnswer("differencesFound", []);
            differences.forEach((_, i) => {
              onAnswer(`differenceAttempt${i}`, false);
              onAnswer(`differenceExample${i}`, false);
            });
            setMessage("Look again! Can you find all five?");
          }}
        >
          Find them again
        </button>
      </section>
      <section className="panel">
        <h2>Tell me what is different</h2>
        <p>
          Say a full sentence for each difference. Try first, then ask for an
          example.
        </p>
        {differences.map((d, i) => (
          <article
            className={`difference-answer ${found.includes(i) ? "discovered" : ""}`}
            key={d.title}
          >
            <h3>
              {i + 1}. {found.includes(i) ? d.title : "A little mystery…"}
            </h3>
            {found.includes(i) ? (
              <>
                <p>{d.hint}</p>
                <button
                  className="pill"
                  aria-pressed={!!answers[`differenceAttempt${i}`]}
                  onClick={() => onAnswer(`differenceAttempt${i}`, true)}
                >
                  I have tried! {answers[`differenceAttempt${i}`] ? "✓" : ""}
                </button>
                <button
                  className="pill"
                  disabled={!answers[`differenceAttempt${i}`]}
                  onClick={() =>
                    onAnswer(
                      `differenceExample${i}`,
                      !answers[`differenceExample${i}`],
                    )
                  }
                >
                  {answers[`differenceExample${i}`]
                    ? "Hide example"
                    : "Show example"}
                </button>
                {!!answers[`differenceExample${i}`] && (
                  <p className="quote">{d.example}</p>
                )}
              </>
            ) : (
              <p>Find this difference in the pictures first.</p>
            )}
            {teacher && (
              <div className="teacher-note">
                <strong>{d.skill}</strong>
                <p>{d.example}</p>
                <p>{d.ru}</p>
              </div>
            )}
          </article>
        ))}
      </section>
      {teacher && (
        <section className="panel">
          <h2>Оценка преподавателя · дополнительное задание</h2>
          <p>
            5–7 минут сверх основного урока. Сначала попросите описать разницу
            самостоятельно; затем предложите каркас с but. Усложнение: There are
            three books… but there are only two… Не требуйте дословного
            совпадения с образцами — принимайте любые верные полные предложения.
          </p>
          {differenceSkills.map(([id, title, ru]) => (
            <div className="rating" key={id}>
              <strong>{title}</strong>
              <span>{ru}</span>
              {[
                "Couldn’t answer",
                "Answered with help",
                "Answered independently",
              ].map((label, n) => (
                <button
                  key={label}
                  className={ratings[`difference-${id}`] === n ? "chosen" : ""}
                  onClick={() => onRate(`difference-${id}`, n)}
                >
                  {label}
                </button>
              ))}
            </div>
          ))}
          <p className="micro">
            Найденные области показывают наблюдательность. Языковые навыки
            оценивает преподаватель отдельно. Дополнительное задание само по
            себе не подтверждает уровень B1 и не меняет основную диагностику
            A1–A2.
          </p>
        </section>
      )}
    </>
  );
}
