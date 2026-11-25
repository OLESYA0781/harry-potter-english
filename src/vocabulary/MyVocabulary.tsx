import { useState } from 'react';
import { BookOpen, Search, X } from 'lucide-react';
import { findWords, groups, vocabularyLessons, type Lesson } from './model';

const filters = vocabularyLessons;

export default function MyVocabulary({lessonScope}:{lessonScope?:Lesson}) {
  const [query, setQuery] = useState('');
  const [lesson, setLesson] = useState<typeof filters[number]['id']>(lessonScope||filters[0].id);
  const searchAcrossLessons=!lessonScope&&!!query.trim();
  const words = findWords(query, 'all', searchAcrossLessons?'all':lesson);
  const lessonWords = findWords('', 'all', lesson);
  const total = searchAcrossLessons?words.length:lessonWords.length;

  return <main className="my-vocabulary">
    <header className="vocab-header">
      <span className="vocab-emblem" aria-hidden="true"><BookOpen size={38} /></span>
      <div><h1>My Vocabulary</h1><p lang="ru">Мой словарь</p></div>
      <span className="vocab-count">Новых слов в уроке: {lessonWords.length}</span>
    </header>
    <div className="vocab-controls">
      <div className="vocab-groups" role="group" aria-label="Уроки словаря">
        {(lessonScope?filters.filter(item=>item.id===lessonScope):filters).map(item => <button type="button" key={item.id} aria-pressed={lesson === item.id}
          onClick={() => { setLesson(item.id); setQuery(''); }}><span lang="en">{item.title}</span><small lang="ru">{item.russian}</small></button>)}
      </div>
      <div className="vocab-lookup"><label className="vocab-search"><span>Поиск по словарю</span><span className="vocab-search-field">
        <Search size={23} aria-hidden="true" />
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="English или русский перевод" />
        {query && <button type="button" aria-label="Очистить поиск" onClick={() => setQuery('')}><X size={22} aria-hidden="true" /></button>}
      </span></label>
</div>
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
              {searchAcrossLessons&&<small className="vocab-expansion">{vocabularyLessons.find(l=>l.id===entry.introducedIn)?.title}</small>}
              {entry.expansion && <small className="vocab-expansion">{entry.expansion}</small>}
            </th>
            <td lang="ru"><span className="vocab-mobile-label" aria-hidden="true">Русский перевод</span>{entry.russian}</td>
          </tr>)}
        </tbody> : null;
      })}
    </table> : <div className="vocab-empty"><BookOpen size={36} aria-hidden="true" /><p>Слова не найдены. Попробуй другой запрос.</p>
      <button className="btn" onClick={() => { setQuery(''); }}>Сбросить поиск</button>
    </div>}
  </main>;
}
