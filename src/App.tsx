import { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronDown, Home, Sparkles } from 'lucide-react';
import { useProgress } from './useProgress';
import { useTeacherAccess } from './useTeacherAccess';
import CloudProgress from './CloudProgress';
import LessonHome from './LessonHome';
import MyVocabulary from './vocabulary/MyVocabulary';
import HomeworkZero from './lessons/homeworkZero/HomeworkZero';
import HomeworkOne from './lessons/homeworkOne/HomeworkOne';
import {homeworks} from './lessons/homeworkCatalog';
import './lessons/homework.css';
import './lessons/homeworkGame.css';
import { lessons } from './lessons/registry';
import {TransferredContext,transferredProgress} from './lessons/transferred';
import {presentSimpleLesson} from './lessons/registry';
import { readLesson, updateLesson } from './lessons/progress';
import { statusLabels } from './lessons/types';
import type { LessonDefinition, LessonSummary } from './lessons/types';

const routeLesson = () => {
  if (window.location.hash === '#/vocabulary') return 'vocabulary';
  if (window.location.hash === '#/homework/0') return 'homework-0';
  if (window.location.hash === '#/homework/1') return 'homework-1';
  const match = window.location.hash.match(/^#\/lessons\/([a-z0-9-]+)$/);
  return match?.[1] || null;
};
export default function App({ catalog = lessons }: { catalog?: readonly LessonDefinition[] }) {
  const progress = useProgress();
  const canTeach = useTeacherAccess();
  const [route, setRoute] = useState(routeLesson);
  const [trialTab, setTrialTab] = useState<'lesson' | 'homework'>(window.location.hash === '#/homework/1' ? 'homework' : 'lesson');
  const [selected, setSelected] = useState(catalog[0].id);
  const [menu, setMenu] = useState<'lessons' | 'homework' | null>(null);
  const navigation = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!navigation.current?.contains(event.target as Node)) setMenu(null); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  useEffect(() => {
    const change = () => { setRoute(routeLesson()); setMenu(null); setTrialTab(window.location.hash === '#/homework/1' ? 'homework' : 'lesson'); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  const active = catalog.find(lesson => lesson.id === route);
  const items = catalog.map(lesson => {
    try {
      const state = readLesson(progress.state, lesson);
      let summary=lesson.summarize(state);
      if(lesson.id==='lesson-2'){const moved=transferredProgress(readLesson(progress.state,presentSimpleLesson));const done=Number(summary.detail.split(' ')[0])+moved.done,total=53+moved.total;summary={percent:Math.round(done/total*100),status:done===total?'completed':done||summary.status==='in-progress'?'in-progress':'not-started',detail:`${done} из ${total} этапов`};}
      return { lesson, state, summary, error: undefined };
    }
    catch (e) { return { lesson, state: null, summary: { status: 'in-progress', percent: 0, detail: '' } as LessonSummary, error: e instanceof Error ? e.message : 'Не удалось открыть урок.' }; }
  });
  const current = items.find(item => item.lesson.id === active?.id);
  const open = (id: string) => { setSelected(id); window.location.hash = `/lessons/${id}`; };
  const Component = active?.Component;
  const homeworkZero = route === 'homework-0';
  const homeworkOne = route === 'homework-1';
  const vocabularyOpen = route === 'vocabulary';
  return <div className={`platform-shell ${active ? 'lesson-open' : ''} ${active?.id === 'trial' && trialTab === 'homework' ? 'homework-open homework-empty' : ''}`}>
    <nav className="platform-bar" aria-label="Main navigation">
      <a href="#/" className="platform-brand"><Sparkles size={25} /><span>VIKA ENGLISH</span></a>
      <div className="platform-links" ref={navigation} onClick={event => { if ((event.target as Element).closest('a')) setMenu(null); }} onKeyDown={event => { if (event.key === 'Escape') { navigation.current?.querySelector<HTMLElement>('.lesson-menu[open] > summary')?.focus(); setMenu(null); } }}><a className="platform-home-link" aria-label="Main Menu" href="#/" aria-current={!route ? 'page' : undefined}><Home size={22} /><span>Main Menu</span></a>
        <details className="lesson-menu" key={route || 'home'} open={menu === 'lessons'}>
          <summary aria-expanded={menu === 'lessons'} onClick={event => { event.preventDefault(); setMenu(previous => previous === 'lessons' ? null : 'lessons'); }}>Lessons <ChevronDown size={22} /></summary>
          <ul>{items.map(({ lesson, summary }) => <li key={lesson.id}><a href={`#/lessons/${lesson.id}`} aria-current={active?.id === lesson.id ? 'page' : undefined}>
            <strong>{lesson.title}</strong><span className="lesson-translation" lang="ru">{lesson.subtitle}</span><span>{summary.status !== 'in-progress' ? `${statusLabels[summary.status]} · ` : ''}{summary.percent}%</span>{lesson.description && <small>{lesson.description}</small>}
          </a></li>)}</ul>
        </details>
        <details open={menu === 'homework'} className="lesson-menu homework-menu" key={`homework-${route}-${trialTab}`}><summary aria-expanded={menu === 'homework'} onClick={event => { event.preventDefault(); setMenu(previous => previous === 'homework' ? null : 'homework'); }}><BookOpen size={20} aria-hidden="true" />Homework<ChevronDown size={22} aria-hidden="true" /></summary><ul>{homeworks.map(homework=><li key={homework.id}><a href={homework.href} aria-current={route===homework.id?'page':undefined}><strong>{homework.title}</strong><span className="lesson-translation">{homework.subtitle}</span></a></li>)}</ul></details>
        <a className="vocabulary-nav-link" href="#/vocabulary" aria-current={vocabularyOpen ? 'page' : undefined}><BookOpen size={22} aria-hidden="true" /><span>My Vocabulary</span></a>
      </div>
    </nav>
    <div className="platform-cloud"><CloudProgress progress={progress} /></div>
    {progress.error && <p role="alert" className="platform-error">{progress.error}</p>}
    {route && !active && !homeworkZero && !homeworkOne && !vocabularyOpen && <p role="status" className="platform-error">Этот урок пока недоступен. Выбери урок из списка.</p>}
    {active?.id === 'trial' && <div className="trial-tabs" role="tablist" aria-label="Trial Lesson sections"><button role="tab" aria-selected={trialTab === 'lesson'} onClick={() => setTrialTab('lesson')}>Lesson</button><button role="tab" aria-selected={trialTab === 'homework'} onClick={() => setTrialTab('homework')}>Homework 1</button></div>}
    {active?.id === 'trial' && current?.state && trialTab === 'homework' ? <main className="homework-zero"><section className="panel"><h1>Homework 1</h1></section></main> : active && current?.state && Component ? <TransferredContext.Provider value={active.id==='lesson-2'?{canTeach,state:readLesson(progress.state,presentSimpleLesson),setState:action=>progress.setState(root=>updateLesson(root,presentSimpleLesson,action))}:null}><Component key={active.id} canTeach={canTeach} state={current.state} setState={action => progress.setState(root => updateLesson(root, active, action))} /></TransferredContext.Provider>
      : active && current?.error ? <main><p role="alert">{current.error}</p><a className="btn" href="#/">Main Menu</a></main>
      : vocabularyOpen ? <MyVocabulary /> : homeworkOne ? <HomeworkOne state={progress.state} setState={progress.setState} /> : homeworkZero ? <HomeworkZero state={progress.state} setState={progress.setState} /> : <LessonHome items={items} selected={selected} onSelect={setSelected} onOpen={open} />}
  </div>;
}
