import { useState } from 'react';
import { BookOpen, Search, X } from 'lucide-react';
import { dictionary, findWords, groups, vocabularyLessons } from './model';

const filters = [{ id: 'all', title: 'All Words', russian: 'Все слова' } as const, ...vocabularyLessons];

export default function MyVocabulary() {
  const [query, setQuery] = useState('');
  const [lesson, setLesson] = useState<typeof filters[number]['id']>('all');
  const [group, setGroup] = useState('all');
  const words = findWords(query, group, lesson);
  const lessonWords = findWords('', 'all', lesson);
  const availableGroups = groups.filter(item => lessonWords.some(word => word.group === item.id));
  const total = group === 'all' ? lessonWords.length : findWords('', group, lesson).length;

  return <main className="my-vocabulary">
    <header className="vocab-header">
      <span className="vocab-emblem" aria-hidden="true"><BookOpen size={38} /></span>
      <div><h1>My Vocabulary</h1><p lang="ru">Мой словарь</p></div>
      <span className="vocab-count">Слов и выражений: {dictionary.length}</span>
    </header>
    <div className="vocab-controls">
      <div className="vocab-groups" role="group" aria-label="Уроки словаря">
        {filters.map(item => <button type="button" key={item.id} aria-pressed={lesson === item.id}
          onClick={() => { setLesson(item.id); setGroup('all'); }}><span lang="en">{item.title}</span><small lang="ru">{item.russian}</small></button>)}
      </div>
      <div className="vocab-lookup"><label className="vocab-search"><span>Поиск по словарю</span><span className="vocab-search-field">
        <Search size={23} aria-hidden="true" />
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="English или русский перевод" />
        {query && <button type="button" aria-label="Очистить поиск" onClick={() => setQuery('')}><X size={22} aria-hidden="true" /></button>}
      </span></label>
      <label className="vocab-topic">Тема
        <select aria-label="Тема словаря" value={group} onChange={event => setGroup(event.target.value)}>
          <option value="all">Все темы</option>
          {availableGroups.map(item => <option value={item.id} key={item.id}>{item.russian}</option>)}
        </select>
      </label></div>
    </div>
    <p className="vocab-results" role="status">Найдено: {words.length} из {total}</p>
    {words.length ? <table className="vocab-table">
      <caption className="vocab-sr-only">Английские слова и русский перевод</caption>
      <thead><tr><th scope="col" lang="en">English</th><th scope="col" lang="ru">Русский перевод</th></tr></thead>
      {groups.map(item => {
        const entries = words.filter(entry => entry.group === item.id);
        return entries.length ? <tbody key={item.id}>
          <tr className="vocab-group-heading"><th colSpan={2} scope="rowgroup"><span lang="en">{item.title}</span><small lang="ru">{item.russian}</small></th></tr>
          {entries.map(entry => <tr className="vocab-entry" key={entry.id}>
            <th scope="row" lang="en">
              <span className="vocab-mobile-label" aria-hidden="true">English</span>{entry.english}
              {entry.expansion && <small className="vocab-expansion">{entry.expansion}</small>}
            </th>
            <td lang="ru"><span className="vocab-mobile-label" aria-hidden="true">Русский перевод</span>{entry.russian}</td>
          </tr>)}
        </tbody> : null;
      })}
    </table> : <div className="vocab-empty"><BookOpen size={36} aria-hidden="true" /><p>Слова не найдены. Попробуй другой запрос или выбери «Все слова».</p>
      <button className="btn" onClick={() => { setQuery(''); setLesson('all'); setGroup('all'); }}>Показать все слова</button>
    </div>}
  </main>;
}
