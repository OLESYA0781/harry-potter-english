export const people = [
  "Harry",
  "Hermione",
  "Ron",
  "Draco",
  "Hagrid",
  "Dumbledore",
];
export const actions = [
  "drinking tea",
  "reading a book",
  "eating a sandwich",
  "playing with a ball",
  "sleeping on a sofa",
  "writing a letter",
];
export const diary = `Hello! My name is Hermione. I am eleven years old. I go to school every day.
I usually get up at seven o'clock. For breakfast, I eat eggs and toast, and I drink orange juice.
I go to school at eight o'clock. My favourite subjects are English and Maths. I like reading books and learning new things.
At lunchtime, I eat chicken, rice and vegetables with my friends. After school, I go home and do my homework.
In the evening, I sometimes watch TV or read an interesting book. I prefer reading to playing computer games.
I usually go to bed at nine o'clock.
I love my school days because I can learn and see my friends!`;
export const comprehension = [
  {
    q: "What does Hermione have for breakfast?",
    options: ["🍳 Eggs and toast", "🍕 Pizza", "🥞 Pancakes", "🥣 Cereal"],
    answer: 0,
  },
  {
    q: "What does Hermione drink?",
    options: ["🥛 Milk", "🍊 Orange juice", "🍵 Tea", "💧 Water"],
    answer: 1,
  },
  {
    q: "What does Hermione eat for lunch?",
    options: ["🥪 A sandwich", "🍕 Pizza", "🍗 Chicken, rice and vegetables"],
    answer: 2,
  },
  {
    q: "What does Hermione do in the evening?",
    options: [
      "📺 She watches TV or reads",
      "⚽ She plays football",
      "🏊 She goes swimming",
    ],
    answer: 0,
  },
];
export const trueFalse = [
  ["Hermione gets up at seven o’clock.", true],
  ["Hermione eats pizza for breakfast.", false],
  ["Hermione likes English and Maths.", true],
  ["Hermione goes to bed at eleven o’clock.", false],
  ["Hermione prefers reading to computer games.", true],
] as const;
export const day = [
  "🌅 Hermione gets up.",
  "🍳 Hermione has breakfast.",
  "🏫 Hermione goes to school.",
  "✏️ Hermione does her homework.",
  "🌙 Hermione goes to bed.",
];
export const speaking = [
  [
    "🌅",
    "What time do you get up?",
    "I usually get up at seven o’clock.",
    "Во сколько ты встаёшь?",
  ],
  [
    "🍳",
    "What do you usually eat for breakfast?",
    "For breakfast I usually eat eggs and toast.",
    "Что ты обычно ешь на завтрак?",
  ],
  [
    "📚",
    "What is your favourite school subject?",
    "I like Maths because it is interesting.",
    "Какой твой любимый предмет?",
  ],
  [
    "✏️",
    "Do you like doing homework?",
    "I don’t like doing homework.",
    "Тебе нравится делать уроки?",
  ],
  [
    "⚽",
    "What do you do after school?",
    "I usually play with my friends after school.",
    "Что ты делаешь после школы?",
  ],
  [
    "📺",
    "Do you prefer reading books or watching TV?",
    "I prefer watching TV to reading books.",
    "Ты предпочитаешь читать или смотреть телевизор?",
  ],
  [
    "🌳",
    "What do you like doing at weekends?",
    "I like riding my bike at weekends.",
    "Чем ты любишь заниматься по выходным?",
  ],
];
export const grammar = [
  {
    q: "She ___ to school every day.",
    options: ["go", "goes", "going"],
    answer: 1,
  },
  { q: "Harry ___ drinking tea now.", options: ["am", "is", "are"], answer: 1 },
  { q: "I ___ eleven years old.", options: ["am", "is", "are"], answer: 0 },
  {
    q: "Hermione ___ reading books.",
    options: ["like", "likes", "liking"],
    answer: 1,
  },
  { q: "Yesterday I ___ at home.", options: ["was", "am", "were"], answer: 0 },
  {
    q: "There ___ three books on the table.",
    options: ["is", "are", "am"],
    answer: 1,
  },
];
export const sentences = [
  ["I", "usually", "get up", "at seven"],
  ["Harry", "is", "drinking", "tea"],
  ["I", "can", "play", "football"],
  ["Hermione", "likes", "reading", "books"],
  ["I", "prefer", "reading", "to watching TV"],
];
export const listening = [
  { text: "I have got red hair. I like eating sandwiches.", answer: "Ron" },
  { text: "I have got glasses and a scar. I am brave.", answer: "Harry" },
  { text: "I am a girl. I like Maths and reading.", answer: "Hermione" },
  { text: "I am big and friendly. I like animals.", answer: "Hagrid" },
  {
    text: "I have got a long white beard. I am the head teacher.",
    answer: "Dumbledore",
  },
];
export const items = [
  ["book", "📕"],
  ["pen", "🖊️"],
  ["pencil", "✏️"],
  ["ruler", "📏"],
  ["notebook", "📓"],
  ["apple", "🍎"],
  ["sandwich", "🥪"],
  ["phone", "📱"],
  ["ball", "⚽"],
];
export const bags = [
  ["book", "pencil", "apple"],
  ["pen", "ruler", "notebook"],
  ["sandwich", "phone", "ball"],
];
export const stages = [
  ["Welcome", "The adventure begins", "✨"],
  ["Hello, friend!", "Let’s get to know you", "👋"],
  ["Your favourites", "A little magic, a little you", "⭐"],
  ["The common room", "Look! What are they doing?", "☕"],
  ["Hermione’s diary", "A little reading adventure", "📖"],
  ["Reading quest", "Let’s check!", "🔎"],
  ["What about you?", "Time to share your story", "💬"],
  ["Grammar spells", "Make your English shine", "🪄"],
  ["Mystery voices", "Listen. Think. Discover.", "🎧"],
  ["The school bag", "Pack a little knowledge", "🎒"],
  ["My magic day", "Your very own story", "🌤️"],
  ["Congratulations!", "Every little step is magic", "🏆"],
];
export type Skill =
  | "Vocabulary"
  | "Grammar"
  | "Reading comprehension"
  | "Listening"
  | "Speaking"
  | "Sentence building"
  | "Reading aloud";
export type Score = {
  correct: boolean;
  first: boolean;
  latest?: boolean;
  skill: Skill;
};
export type LessonState = {
  step: number;
  name: string;
  answers: Record<string, unknown>;
  scores: Record<string, Score>;
  ratings: Record<string, number>;
};
export const initial: LessonState = {
  step: 0,
  name: "",
  answers: {},
  scores: {},
  ratings: {},
};
export const skillNames: Skill[] = [
  "Vocabulary",
  "Grammar",
  "Reading comprehension",
  "Listening",
  "Speaking",
  "Sentence building",
  "Reading aloud",
];
export function diagnose(state: LessonState) {
  const metrics = skillNames.map((skill) => {
    const auto = Object.values(state.scores).filter((s) => s.skill === skill);
    const manual = Object.entries(state.ratings)
      .filter(([key]) =>
        skill === "Speaking"
          ? /^speak[0-6]$/.test(key) || key === "story"
          : skill === "Reading aloud"
            ? key === "reading"
            : false,
      )
      .map(([, v]) => v / 2);
    const expected =
      skill === "Vocabulary"
        ? 3
        : skill === "Grammar"
          ? 8
          : skill === "Reading comprehension"
            ? 10
            : skill === "Listening"
              ? 5
              : skill === "Sentence building"
                ? 11
                : skill === "Speaking"
                  ? 8
                  : 1;
    const values = manual.length ? manual : auto.map((s) => Number(s.first));
    return {
      skill,
      done: values.length,
      total: expected,
      percent: values.length
        ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100)
        : null,
    };
  });
  const complete = metrics.every((m) => m.done >= m.total);
  const min = Math.min(...metrics.map((m) => m.percent ?? 0));
  const avg =
    metrics.reduce((s, m) => s + (m.percent ?? 0), 0) / metrics.length;
  return {
    metrics,
    complete,
    level: !complete
      ? null
      : min >= 65 && avg >= 80
        ? "A2"
        : min >= 40 && avg >= 60
          ? "A1+"
          : "A1",
  };
}
