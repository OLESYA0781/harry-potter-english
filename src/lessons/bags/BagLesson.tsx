import { useEffect, useState } from 'react';
import type { LessonProps } from '../types';
import MixedVillage from '../mixedVillage/MixedVillage';
import { BagContext } from './Activities';
import { sections } from './data';
import { Articles, GrammarBank, Have, Plural } from './Grammar';
import Interviews from './Interviews';
import { Final, Introduction, Speaking, Writing } from './SpeakingWriting';
import { bagPrefix, bagSummary } from './state';
import Vocabulary from './Vocabulary';
import './bags.css';

const activities = [Introduction, Vocabulary, Interviews, Articles, Plural, Have, GrammarBank, Speaking, Writing, Final];
export default function BagLesson(props: LessonProps) {
  const { state, setState, canTeach } = props;
  const [requested, requestTeacher] = useState(false);
  const teacher = !!canTeach && requested;
  useEffect(() => { if (!canTeach) requestTeacher(false); }, [canTeach]);
  const read = (key: string) => state.answers[bagPrefix + key];
  const write = (values: Record<string, unknown>) => setState(previous => ({
    ...previous, answers: {
      ...previous.answers, ...Object.fromEntries(Object.entries(values).map(([key, value]) => [bagPrefix + key, value])),
    },
  }));
  const reset = (key: string) => {
    if (!teacher) return;
    const target = bagPrefix + key;
    setState(previous => ({ ...previous, answers: Object.fromEntries(Object.entries(previous.answers).filter(([id]) =>
      !(id === target || id.startsWith(target + '/') || id.startsWith(target + '-') ||
        (key === 'intro-' && id.startsWith(target)) || ((key.startsWith('street/') || key === 'street-setup') && id === bagPrefix + 'street/done') ||
        (key === 'same' && id === bagPrefix + 'same-speaking')))) }));
  };
  const saved = read('section');
  const page = typeof saved === 'number' && Number.isInteger(saved) && saved >= 0 && saved < sections.length ? saved : 0;
  const go = (next: number) => {
    write({ section: next });
    window.scrollTo({ top: 0 });
  };
  const Activity = activities[page - 1];
  return <div className="bag-shell">
    <aside className="ar-sidebar bag-sidebar">
      <span className="bag-sidebar-title">Lesson 3</span>
      <nav aria-label="Lesson 3 sections">{sections.map((title, i) =>
        <button type="button" key={title} aria-current={page === i ? 'step' : undefined} aria-pressed={page === i} onClick={() => go(i)}>
          <span>{i + 1}</span><span>{title}</span>
        </button>)}</nav>
    </aside>
    <div className="bag-content">
      <div className="ar-mobile-menu"><label>Раздел урока
        <select aria-label="Choose Lesson 3 section" value={page} onChange={event => go(Number(event.target.value))}>
          {sections.map((title, i) => <option value={i} key={title}>{i + 1}. {title}</option>)}
        </select>
      </label></div>
      {page === 0 ? <>
        <MixedVillage {...props} />
        <div className="bag-section-nav"><button onClick={() => go(1)}>2. {sections[1]} →</button></div>
      </> : <main className="bag-main" key={page}>
        <div className="bag-heading">
          <div><p>Lesson 3 — What’s in Your Bag?</p><h1>{page + 1}. {sections[page]}</h1></div>
          {canTeach && <button className="teacher-toggle" aria-pressed={teacher} onClick={() => requestTeacher(!requested)}>
            {teacher ? 'Exit teacher mode' : 'Teacher mode'}
          </button>}
        </div>
        <BagContext.Provider value={{ teacher, read, write, reset }}>
          {teacher && <p className="bag-progress">Прогресс урока · {bagSummary(state).detail}</p>}
          <Activity />
        </BagContext.Provider>
        <div className="bag-section-nav">
          <button onClick={() => go(page - 1)}>← {sections[page - 1]}</button>
          {page < sections.length - 1 && <button onClick={() => go(page + 1)}>{sections[page + 1]} →</button>}
        </div>
      </main>}
    </div>
  </div>;
}
