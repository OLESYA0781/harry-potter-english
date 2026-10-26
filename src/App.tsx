import { useEffect, useState } from 'react';
import { ChevronDown, Home, Sparkles } from 'lucide-react';
import { useProgress } from './useProgress';
import { useTeacherAccess } from './useTeacherAccess';
import CloudProgress from './CloudProgress';
import LessonHome from './LessonHome';
import Homework from './lessons/Homework';
import { lessons } from './lessons/registry';
import { readLesson, updateLesson } from './lessons/progress';
import { statusLabels } from './lessons/types';
import type { LessonDefinition, LessonSummary } from './lessons/types';

const routeLesson = () => {
  const match = window.location.hash.match(/^#\/lessons\/([a-z0-9-]+)$/);
  return match?.[1] || null;
};
export default function App({ catalog = lessons }: { catalog?: readonly LessonDefinition[] }) {
  const progress = useProgress();
  const canTeach = useTeacherAccess();
  const [route, setRoute] = useState(routeLesson);
  const [trialTab, setTrialTab] = useState<'lesson' | 'homework'>('lesson');
  const [selected, setSelected] = useState(catalog[0].id);
  useEffect(() => {
    const change = () => { setRoute(routeLesson()); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  const active = catalog.find(lesson => lesson.id === route);
  const items = catalog.map(lesson => {
    try {
      const state = readLesson(progress.state, lesson);
      return { lesson, state, summary: lesson.summarize(state), error: undefined };
    }
    catch (e) { return { lesson, state: null, summary: { status: 'in-progress', percent: 0, detail: '' } as LessonSummary, error: e instanceof Error ? e.message : 'Не удалось открыть урок.' }; }
  });
  const current = items.find(item => item.lesson.id === active?.id);
  const open = (id: string) => { setSelected(id); window.location.hash = `/lessons/${id}`; };
  const Component = active?.Component;
  return <div className={`platform-shell ${active ? 'lesson-open' : ''}`}>
    <nav className="platform-bar" aria-label="Навигация по урокам">
      <a href="#/" className="platform-brand"><Sparkles size={25} /><span>VIKA ENGLISH</span></a>
      <div className="platform-links"><a className="platform-home-link" aria-label="Главное меню" href="#/" aria-current={!active ? 'page' : undefined}><Home size={22} /><span>Главное меню</span></a>
        <details className="lesson-menu" key={route || 'home'}>
          <summary>Уроки <ChevronDown size={22} /></summary>
          <ul>{items.map(({ lesson, summary }) => <li key={lesson.id}><a href={`#/lessons/${lesson.id}`} aria-current={active?.id === lesson.id ? 'page' : undefined}>
            <strong>{lesson.title}</strong><span className="lesson-translation" lang="ru">{lesson.subtitle}</span><span>{summary.status !== 'in-progress' ? `${statusLabels[summary.status]} · ` : ''}{summary.percent}%</span>{lesson.description && <small>{lesson.description}</small>}
          </a></li>)}</ul>
        </details>
      </div>
    </nav>
    <div className="platform-cloud"><CloudProgress progress={progress} /></div>
    {progress.error && <p role="alert" className="platform-error">{progress.error}</p>}
    {route && !active && <p role="status" className="platform-error">Этот урок пока недоступен. Выбери урок из списка.</p>}
    {active?.id === 'trial' && <div className="trial-tabs" role="tablist" aria-label="Trial Lesson sections"><button role="tab" aria-selected={trialTab === 'lesson'} onClick={() => setTrialTab('lesson')}>Lesson</button><button role="tab" aria-selected={trialTab === 'homework'} onClick={() => setTrialTab('homework')}>Homework</button></div>}
    {active?.id === 'trial' && current?.state && trialTab === 'homework' ? <Homework state={progress.state} setState={progress.setState} /> : active && current?.state && Component ? <Component key={active.id} canTeach={canTeach} state={current.state} setState={action => progress.setState(root => updateLesson(root, active, action))} />
      : active && current?.error ? <main><p role="alert">{current.error}</p><a className="btn" href="#/">Главное меню</a></main>
      : <LessonHome items={items} selected={selected} onSelect={setSelected} onOpen={open} />}
  </div>;
}
