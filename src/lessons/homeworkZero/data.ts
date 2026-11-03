export const homeworkZeroPrefix = '@vika/lesson/lesson-0-homework/';
export const gapTasks = [
  { id: 'magic-sentences', number: 1, title: 'Complete the Magic Sentences', instruction: 'Fill in the gaps with am, is or are.', sentences: [
    { id: 'harry-pupil', text: 'Harry ___ a pupil at Hogwarts.' },
    { id: 'draco-rich', text: 'Draco Malfoy ___ rich.' },
    { id: 'hermione-ron', text: 'Hermione and Ron ___ friends.' },
    { id: 'tired', text: 'I ___ tired after school.' },
    { id: 'swimming-pool', text: 'The swimming pool ___ big.' },
    { id: 'pictures', text: 'The pictures ___ on the wall.' },
    { id: 'train-tram', text: 'It ___ a train. It ___ a tram.' },
    { id: 'plane-fast', text: 'A plane ___ fast.' },
    { id: 'cinema', text: '___ Harry and Ron at the cinema?' },
    { id: 'books', text: 'The books ___ not on the floor. They ___ on the table.' },
  ] },
  { id: 'mystery', number: 4, title: 'Hogwarts Mystery', instruction: "Complete the dialogues with am, is, are, isn't or aren't.", sentences: [
    { id: 'hermione', text: 'Where ___ Hermione? — She ___ at the museum.' },
    { id: 'ron', text: '___ Ron happy? — Yes, he ___.' },
    { id: 'harry-draco', text: 'Where ___ Harry and Draco? — They ___ at Hogwarts.' },
    { id: 'books', text: '___ the books on the floor? — No, they ___. They ___ on the table.' },
    { id: 'pupil', text: '___ you a pupil? — Yes, I ___.' },
    { id: 'ron-teacher', text: '___ Ron a teacher? — No, he ___.' },
  ] },
] as const;
export const translationSentences = [
  'Гарри — ученик Хогвартса.', 'Драко Малфой богатый.', 'Рон устал после школы.',
  'Моя комната чистая.', 'Это банк? Нет, это отель.', 'Рон и Гарри в трамвае.',
  'Гарри и Рон — друзья.', 'Гермиона не в больнице. Она в школе.',
  'Книги на полу, а картина на стене.', 'Она пишет письма друзьям после школы.',
] as const;
export const translationDialogues = [
  '— Где Гарри? — Он в Хогвартсе.', '— Рон устал? — Да, он устал.',
  '— Драко богатый? — Да, он богатый.', '— Где Гермиона? — Она в музее.',
  '— Кот на диване? — Нет, он на полу.',
] as const;
// Independent per-gap keys reuse the root answer journal/RPC and never overwrite
// Lesson 0's versioned record or historical Trial homework answers.
export const gapKey = (taskId: string, sentenceId: string, gap: number) =>
  `${homeworkZeroPrefix}${taskId}/${sentenceId}/${gap}`;
