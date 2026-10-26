import { ArrowRight } from 'lucide-react';
import { Castle } from './Art';
import type { LessonDefinition, LessonSummary } from './lessons/types';
import { statusLabels } from './lessons/types';

type Item = { lesson: LessonDefinition; summary: LessonSummary; error?: string };
export default function LessonHome({ items, selected, onSelect, onOpen }: {
  items: Item[]; selected: string; onSelect: (id: string) => void; onOpen: (id: string) => void;
}) {
  const current = items.find(item => item.lesson.id === selected) || items[0];
  const finished = items.filter(item => item.summary.status === 'completed').length;
  return <main className="classroom-home">
    <section className="classroom-welcome" aria-labelledby="welcome-title">
      <div className="classroom-welcome-copy">
        <span className="eyebrow">✧ VIKA ENGLISH · YOUR MAGICAL CLASSROOM</span>
        <h1 id="welcome-title">Welcome to your <em>English Adventure!</em></h1>
      </div>
      <div className="classroom-castle" aria-hidden="true"><Castle /><span className="classroom-caption">Little steps. Big magic.</span></div>
    </section>
    <section className="classroom-lessons" aria-labelledby="my-lessons-title">
      <div className="classroom-section-title"><div><h2 id="my-lessons-title">Мои уроки</h2></div><span className="classroom-total">Завершено: {finished} из {items.length}</span></div>
      <div className="lesson-picker">
        <label htmlFor="dashboard-lesson">Выбери своё приключение</label>
        <div><select id="dashboard-lesson" value={current.lesson.id} onChange={e => onSelect(e.target.value)}>
          {items.map(({ lesson, summary }) => <option key={lesson.id} value={lesson.id}>{lesson.title}{summary.status !== 'in-progress' ? ` · ${statusLabels[summary.status]}` : ''}</option>)}
        </select><button className="btn" disabled={!!current.error} onClick={() => onOpen(current.lesson.id)}>{current.summary.status === 'not-started' ? 'Начать урок' : 'Продолжить урок'} <ArrowRight size={18} /></button></div>
      </div>
      <div className="lesson-cards">
        {items.map(({ lesson, summary, error }, index) => <article key={lesson.id} className={`lesson-card ${selected === lesson.id ? 'selected' : ''}`}>
          <div className="lesson-card-top"><span className="lesson-number">{String(items.length - index).padStart(2, '0')}</span>{summary.status !== 'in-progress' && <span className={`lesson-status ${summary.status}`}>{statusLabels[summary.status]}</span>}</div>
          <span className="lesson-subtitle">{lesson.subtitle}</span><h3>{lesson.title}</h3><p>{lesson.description}</p>
          {error ? <p role="alert">{error}</p> : <><div className="lesson-completion"><span>Прогресс урока</span><strong>{summary.percent}%</strong></div><div className="progress-track" role="progressbar" aria-label={`Прогресс: ${lesson.title}`} aria-valuenow={summary.percent} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${summary.percent}%` }} /></div><small>{summary.detail}</small></>}
          <button className="text-btn" disabled={!!error} onClick={() => onOpen(lesson.id)}>Открыть урок <ArrowRight size={16} /></button>
        </article>)}
      </div>
    </section>
  </main>;
}
