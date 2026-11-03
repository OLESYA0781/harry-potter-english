import entries from './entries.json';

export const vocabulary = entries;
export const groups = [
  { id: 'general', title: 'General Words', russian: 'Общие слова' },
  { id: 'places', title: 'Places in Town', russian: 'Места в городе' },
  { id: 'transport', title: 'Transport', russian: 'Транспорт' },
  { id: 'everyday', title: 'Everyday Life', russian: 'Повседневная жизнь' },
] as const;

const normalize = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase().trim();
export function findWords(query: string, group = 'all') {
  const term = normalize(query);
  return vocabulary.filter(entry => (group === 'all' || entry.group === group) &&
    (!term || normalize(entry.english).includes(term) || normalize(entry.russian).includes(term)));
}
