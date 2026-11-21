import entries from './entries.json';
import { lesson3Terms } from './lesson3';

export const vocabulary = entries;
export const groups = [
  { id: 'general', title: 'General Words', russian: 'Общие слова' },
  { id: 'places', title: 'Places in Town', russian: 'Места в городе' },
  { id: 'transport', title: 'Transport', russian: 'Транспорт' },
  { id: 'everyday', title: 'Everyday Life', russian: 'Повседневная жизнь' },
  { id: 'jobs', title: 'Jobs', russian: 'Профессии' },
  { id: 'objects', title: 'Common Objects', russian: 'Предметы' },
  { id: 'interviews', title: 'Interviews and Speaking', russian: 'Интервью и устная речь' },
  { id: 'writing', title: 'Lost & Found and Writing', russian: 'Бюро находок и переписка' },
  { id: 'grammar', title: 'Grammar Terms', russian: 'Лексика грамматических заданий' },
  { id: 'village', title: 'The Mixed-Up Village', russian: 'Перепутанная деревня' },
] as const;

export const vocabularyLessons = [
  { id: 'lesson-3', title: 'Lesson 3', russian: 'Что у тебя в сумке?' },
  { id: 'lesson-2', title: 'Lesson 2', russian: 'Вопросы и артикли' },
  { id: 'lesson-1', title: 'Lesson 1', russian: 'Present Simple' },
  { id: 'lesson-0', title: 'Lesson 0', russian: 'To be' },
  { id: 'trial', title: 'Trial Lesson', russian: 'Пробное занятие' },
] as const;

type Lesson = typeof vocabularyLessons[number]['id'];
type DictionaryEntry = {
  id: string; english: string; russian: string; group: string;
  lessons: readonly Lesson[]; expansion?: string;
};

const normalize = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').replace(/[’‘]/g, "'").toLocaleLowerCase().trim();

const priorLessonWords: Record<Lesson, readonly string[]> = {
  trial: ['pupil','rich','clean','tired','to-paint','wall','to-sleep','to-write-a-letter','usually','sometimes',
    'after-school','porridge','language','literature','to-rest','to-spend-time-with-my-family','to-clean-my-room',
    'to-drink','a-cup-of-tea','on-the-floor','to-sit','to-wash','to-enjoy','to-write','after','training',
    'to-eat','breakfast','lesson','to-hate','to-have-lunch','to-have-dinner','to-train'],
  'lesson-0': ['pupil','rich','clean','tired','wall','library','swimming-pool','to-sit','on-the-floor',
    'job-teacher','job-doctor'],
  'lesson-1': ['pupil','tired','to-paint','usually','sometimes','after-school','to-clean-my-room','to-drink',
    'a-cup-of-tea','to-wash','to-enjoy','to-work','to-write','to-write-a-letter','to-travel','to-eat',
    'breakfast','lesson','to-have-lunch','to-have-dinner','to-go-to-work'],
  'lesson-2': ['pupil','tired','library','swimming-pool','bank','café','cinema','hospital','hotel','museum',
    'park','restaurant','stadium','theatre','bike-bicycle','boat','motorbike','taxi','train','tram','underground',
    'after-school','usually','sometimes','to-clean-my-room','to-write-a-letter','to-work','to-travel',
    'literature','to-enjoy','to-have-lunch','to-go-to-work'],
  'lesson-3': ['bank','hospital','museum','park','restaurant','theatre','bike-bicycle','bus','car','tram',
    'underground','usually','to-work','to-go-to-work','job-artist','job-chef','job-farmer','job-nurse',
    'job-office-worker','job-pilot','job-shop-assistant','job-singer','job-teacher'],
};
const sharedGroups: Partial<Record<Lesson, readonly string[]>> = {
  'lesson-0': ['places','transport'],
  'lesson-1': ['places','transport','jobs'],
  'lesson-2': ['jobs'],
};
const reusedInEarlierLessons: Readonly<Record<string, readonly Lesson[]>> = {
  book: ['trial','lesson-1','lesson-2'],
  sandwich: ['trial'],
  bag: ['trial','lesson-2'],
  'mobile phone': ['trial'],
  pen: ['trial','lesson-1'],
  notebook: ['trial'],
  key: ['lesson-2'],
  actor: ['lesson-2'],
  school: ['trial','lesson-0','lesson-1','lesson-2'],
  farm: ['lesson-2'],
  airport: ['lesson-1'],
  'bus stop': ['lesson-1'],
  'by bike': ['lesson-1','lesson-2'],
  'by bus': ['lesson-1','lesson-2'],
  'by car': ['lesson-1','lesson-2'],
  'by tram': ['lesson-1','lesson-2'],
  'by underground': ['lesson-1','lesson-2'],
};

const knownWords = new Set(entries.map(entry => normalize(entry.english)));

export const dictionary: readonly DictionaryEntry[] = [
  ...entries.map(({ id, english, russian, group }) => ({
    id, english, russian, group,
    lessons: vocabularyLessons.map(lesson => lesson.id).filter(lesson =>
      priorLessonWords[lesson].includes(id) || sharedGroups[lesson]?.includes(group)),
  })),
  ...lesson3Terms.flatMap(([group, terms]) =>
    terms.filter(([english]) => !knownWords.has(normalize(english))).map(([english, russian, expansion], index) => ({
      id: `lesson-3/${group}/${index}`,
      english, russian, group, expansion,
      lessons: ['lesson-3' as const, ...(reusedInEarlierLessons[english] ?? [])],
    }))),
];

export function findWords(query: string, group = 'all', lesson: Lesson | 'all' = 'all') {
  const term = normalize(query);
  return dictionary.filter(entry => (group === 'all' || entry.group === group) &&
    (lesson === 'all' || entry.lessons.includes(lesson)) &&
    (!term || [entry.english, entry.russian, entry.expansion ?? ''].some(value => normalize(value).includes(term))));
}
