import { useState } from 'react';
import { BookOpen, Search, X } from 'lucide-react';
import { findWords, groups, vocabulary } from './model';

export default function MyVocabulary() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const words = findWords(query, group);
  return <main className="my-vocabulary">
    <header className="vocab-header">
      <span className="vocab-emblem" aria-hidden="true"><BookOpen size={38} /></span>
      <div><h1>My Vocabulary <span aria-hidden="true">📖</span></h1><p lang="ru">Мой словарь</p></div>
      <span className="vocab-count">Слов и выражений: {vocabulary.length}</span>
    </header>
    <div className="vocab-controls">
      <label className="vocab-search"><span>Поиск по словарю</span><span className="vocab-search-field"><Search size={23} aria-hidden="true" /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="English или русский перевод" />{query && <button type="button" aria-label="Очистить поиск" onClick={() => setQuery('')}><X size={22} aria-hidden="true" /></button>}</span></label>
      <div className="vocab-groups" role="group" aria-label="Темы словаря">
        {[{ id: 'all', title: 'All Words', russian: 'Все слова' }, ...groups].map(item => <button type="button" key={item.id} aria-pressed={group === item.id} onClick={() => setGroup(item.id)}><span lang="en">{item.title}</span><small lang="ru">{item.russian}</small></button>)}
      </div>
    </div>
    <p className="vocab-results" role="status">Найдено: {words.length} из {vocabulary.length}</p>
    {words.length ? <table className="vocab-table">
      <caption className="vocab-sr-only">Английские слова, русский перевод и примеры</caption>
      <thead><tr><th scope="col" lang="en">English</th><th scope="col" lang="ru">Русский перевод</th><th scope="col" lang="en">Example</th></tr></thead>
      {groups.map(item => {
        const entries = words.filter(entry => entry.group === item.id);
        return entries.length ? <tbody key={item.id}>
          <tr className="vocab-group-heading"><th colSpan={3} scope="rowgroup"><span lang="en">{item.title}</span><small lang="ru">{item.russian}</small></th></tr>
          {entries.map(entry => <tr className="vocab-entry" key={entry.id}>
            <th scope="row" lang="en"><span className="vocab-mobile-label" aria-hidden="true">English</span>{entry.english}</th>
            <td lang="ru"><span className="vocab-mobile-label" aria-hidden="true">Русский перевод</span>{entry.russian}</td>
            <td lang="en"><span className="vocab-mobile-label" aria-hidden="true">Example</span>{entry.example}</td>
          </tr>)}
        </tbody> : null;
      })}
    </table> : <div className="vocab-empty"><BookOpen size={36} aria-hidden="true" /><p>Слова не найдены. Попробуй другой запрос или выбери «Все слова».</p><button className="btn" onClick={() => { setQuery(''); setGroup('all'); }}>Показать все слова</button></div>}
  </main>;
}
