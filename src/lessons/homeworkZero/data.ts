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
  { id: 'clean-bike', text: 'Мой велосипед чистый.' },
  { id: 'parents-restaurant', text: 'Мои родители в ресторане.' },
  { id: 'big-plane', text: 'Самолёт большой.' },
  { id: 'clean-room', text: 'Моя комната чистая.' },
  { id: 'bank-hotel', text: 'Это банк? Нет, это отель.' },
  { id: 'friends-tram', text: 'Рон и Гарри в трамвае.' },
  { id: 'fast-tram', text: 'Трамвай быстрый.' },
  { id: 'hermione-school', text: 'Гермиона не в больнице. Она в школе.' },
  { id: 'books-picture', text: 'Книги на полу, а картина на стене.' },
  { id: 'letters-after-school', text: 'Она пишет письма друзьям после школы.' },
] as const;
export const translationDialogues = [
  { id: 'harry-hogwarts', text: '— Где Гарри? — Он в Хогвартсе.' },
  { id: 'ron-tired', text: '— Рон устал? — Да, он устал.' },
  { id: 'draco-rich', text: '— Драко богатый? — Да, он богатый.' },
  { id: 'hermione-museum', text: '— Где Гермиона? — Она в музее.' },
  { id: 'cat-floor', text: '— Кот на диване? — Нет, он на полу.' },
] as const;
export const writtenKey = (task: 'translations' | 'dialogues' | 'profile', id = 'hogwarts') =>
  `${homeworkZeroPrefix}written/${task}/${id}`;
// Independent per-gap keys reuse the root answer journal/RPC and never overwrite
// Lesson 0's versioned record or historical Trial homework answers.
export const gapKey = (taskId: string, sentenceId: string, gap: number) =>
  `${homeworkZeroPrefix}${taskId}/${sentenceId}/${gap}`;
