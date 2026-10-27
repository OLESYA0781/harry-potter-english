export const homeworkPrefix = '@vika/lesson/trial-homework/';
export const words = [
  ['to sleep', 'Спать', 'The cat sleeps on the sofa.'],
  ['to write a letter', 'Написать письмо', 'I write a letter to my friend.'],
  ['Usually', 'Обычно', 'I usually read after school.'],
  ['After school', 'После школы', 'I rest after school.'],
  ['Sometimes', 'Иногда', 'Sometimes I play with my cat.'],
  ['Porridge', 'Каша', 'I eat porridge for breakfast.'],
  ['Language', 'Язык', 'I learn a new language.'],
  ['Literature', 'Литература', 'I like Literature.'],
  ['Rest', 'Отдыхать', 'I rest at home.'],
  ['Spend time with my family', 'Проводить время с семьёй', 'I spend time with my family on Sunday.'],
  ['Clean my room', 'Убирать свою комнату', 'I clean my room on Saturday.'],
  ['Drink', 'Пить', 'I drink water every day.'],
  ['A cup of tea', 'Чашка чая', 'I drink a cup of tea.'],
  ['On the floor', 'На полу', 'My bag is on the floor.'],
  ['to sit', 'Сидеть', 'I sit on the sofa.'],
  ['Russian language', 'Русский язык', 'I like Russian language lessons.'],
  ['My favourite school subjects are Russian language and Literature.', 'Мои любимые школьные предметы — русский язык и литература.', 'I enjoy these lessons at school.'],
];
export const remember = ['Переведи «обычно» на английский.', 'Переведи «каша» на английский.', 'Переведи «после школы» на английский.', 'Переведи «чашка чая» на английский.', 'Переведи «убирать свою комнату» на английский.'];
export const mistakes = ['Hermione usually drink tea.', 'Ron is sit on the floor.', 'Harry sometimes write a letter.', 'There is three books on the table.', "Hermione don't like porridge."];
export const questions = ['Where did Hermione go yesterday?', 'What animals did Harry want to read about?', 'What does Hermione sometimes drink?', 'Who will they visit tomorrow?'];
export const letter = `Dear Vika,

Yesterday I went to the library with Harry. We found an old book about magical animals.

Harry wanted to read about dragons, but I wanted to read about cats.

After school, I usually rest and write letters to my friends. Sometimes I drink a cup of tea.

Tomorrow we will visit Hagrid. He has many interesting animals. Will you come with us?

Your friend,
Hermione`;
export const sections = ['New Words', "Найди и исправь ошибки", 'The Secret Letter', 'A Day at Hogwarts', 'My Magic Room'];
export type HomeworkAnswers = Record<string, unknown>;
export const homeworkValue = (answers: HomeworkAnswers, key: string) => answers[homeworkPrefix + key];
export function homeworkCompletion(answers: HomeworkAnswers): boolean[] {
  const text = (key: string) => typeof homeworkValue(answers, key) === 'string' && !!(homeworkValue(answers, key) as string).trim();
  const filled = (prefix: string, length: number) => Array.from({ length }, (_, i) => text(`${prefix}${i}`)).every(Boolean);
  return [filled('remember', 5), filled('grammar', 5), filled('letter', 4), text('day'), text('room')];
}
