import { ArrowRight } from 'lucide-react';
import { Castle } from './Art';
import type { LessonDefinition, LessonSummary } from './lessons/types';
import { statusLabels } from './lessons/types';

type Item = { lesson: LessonDefinition; summary: LessonSummary; error?: string };
export default function LessonHome({ items, selected, onSelect, onOpen }: {
  items: Item[]; selected: string; onSelect: (id: string) => void; onOpen: (id: string) => void;
}) {
  const current = items.find(item => item.lesson.id === selected) || items[0];
  return <main className="classroom-home">
    <section className="classroom-lessons" aria-labelledby="my-lessons-title">
      <div className="classroom-intro"><div className="classroom-intro-copy">
      <div className="classroom-section-title"><div><h1 id="my-lessons-title" lang="en">My Lessons</h1><span className="heading-translation" lang="ru">Мои занятия</span></div></div>
      <div className="lesson-picker">
        <label htmlFor="dashboard-lesson">Выбери своё приключение</label>
        <div><select id="dashboard-lesson" value={current.lesson.id} onChange={e => onSelect(e.target.value)}>
          {items.map(({ lesson, summary }) => <option key={lesson.id} value={lesson.id}>{lesson.title}{summary.status !== 'in-progress' ? ` · ${statusLabels[summary.status]}` : ''}</option>)}
        </select><button className="btn" disabled={!!current.error} onClick={() => onOpen(current.lesson.id)}>{current.summary.status === 'not-started' ? 'Начать урок' : 'Продолжить урок'} <ArrowRight size={18} /></button></div>
        <small className="lesson-picker-translation" lang="ru">{current.lesson.subtitle}</small>
      </div>
      </div><div className="classroom-intro-art" aria-hidden="true"><Castle /></div></div>
      <div className="lesson-cards">
        {items.map(({ lesson, summary, error }, index) => <article key={lesson.id} className={`lesson-card ${selected === lesson.id ? 'selected' : ''}`}>
          <div className="lesson-card-top"><span className="lesson-number">{String(items.length - index).padStart(2, '0')}</span>{summary.status !== 'in-progress' && <span className={`lesson-status ${summary.status}`}>{statusLabels[summary.status]}</span>}</div>
          <h3>{lesson.title}</h3><span className="lesson-subtitle" lang="ru">{lesson.subtitle}</span>{lesson.description && <p>{lesson.description}</p>}
          {error ? <p role="alert">{error}</p> : <><div className="lesson-completion"><span>Прогресс урока</span><strong>{summary.percent}%</strong></div><div className="progress-track" role="progressbar" aria-label={`Прогресс: ${lesson.title}`} aria-valuenow={summary.percent} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${summary.percent}%` }} /></div><small>{summary.detail}</small></>}
          <button className="text-btn" disabled={!!error} onClick={() => onOpen(lesson.id)}>Открыть урок <ArrowRight size={16} /></button>
        </article>)}
      </div>
    </section>
  </main>;
}
