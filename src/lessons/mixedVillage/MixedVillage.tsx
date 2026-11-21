import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BookOpen, MapPin, Sparkles } from 'lucide-react';
import { Character } from '../../Art';
import type { LessonProps } from '../types';
import { residents } from './data';
import { editVillage, readVillage } from './model';
import type { VillageAction } from './model';
import VillageBoard, { ResidentPortrait } from './VillageBoard';
import './village.css';

const TeacherDesk = lazy(() => import('./TeacherDesk'));

export default function MixedVillage({ state, setState, canTeach = false }: LessonProps) {
  const [requested, setRequested] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [overview, setOverview] = useState(false);
  const lessonTitle = useRef<HTMLHeadingElement>(null);
  const teacher = canTeach && requested;
  useEffect(() => {
    if (!canTeach) { setRequested(false); setResetting(false); }
  }, [canTeach]);

  const progress = readVillage(state);
  const active = residents.find(({ name }) => name === progress.active);
  const residentProgress = active && progress.interviewed[active.name];
  const home = residents.filter(({ name }) => progress.interviewed[name]?.articles).length;
  const complete = home === residents.length;

  const dispatch = (action: VillageAction) => {
    if (!teacher && action.type !== 'choose' && action.type !== 'move') return;
    setState(previous => editVillage(previous, action));
  };
  const showOverview = () => {
    setOverview(true);
    lessonTitle.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  };

  return <main className="village-lesson">
    <div className="village-heading">
      <div>
        <h1 ref={lessonTitle} tabIndex={-1}>Lesson 3 — The Mixed-Up Village</h1>
        <p lang="ru">Урок 3 — Перепутанная деревня</p>
      </div>
      <a href="#/vocabulary"><BookOpen size={20} aria-hidden="true" />My Vocabulary</a>
      {canTeach && <button type="button" className={`teacher-toggle ${teacher ? 'enabled' : ''}`}
        aria-pressed={teacher} onClick={() => { setRequested(!requested); setResetting(false); }}>
        {teacher ? 'Exit teacher mode' : 'Teacher mode'}
      </button>}
    </div>

    {overview ? <section className="village-overview" aria-label="Lesson 3 sections">
      <button onClick={() => setOverview(false)}>1. Warm-up: The Mixed-Up Village</button>
      <p>{home} / {residents.length} жителей дома</p>
    </section> : <>
      <section className="village-briefing" aria-labelledby="village-warmup">
        <div className="village-hermione" aria-hidden="true"><Character name="Hermione" /></div>
        <div>
          <h2 id="village-warmup">1. Warm-up: The Mixed-Up Village</h2>
          <p>Ночью ветер сорвал именные таблички с домов. Помоги жителям вернуться домой.</p>
          <blockquote lang="en">“Oh no! The name signs are missing! Nobody knows who lives in each house. Can you help us?”</blockquote>
        </div>
        <div className="village-count" role="status"><MapPin size={20} aria-hidden="true" />{home} / {residents.length} жителей дома</div>
      </section>

      <VillageBoard progress={progress} complete={complete} dispatch={dispatch} />

      {complete ? <section className="village-finale" aria-labelledby="village-finale-title" role="status">
        <div className="village-hermione" aria-hidden="true"><Character name="Hermione" /></div>
        <div lang="en">
          <Sparkles size={30} aria-hidden="true" />
          <h2 id="village-finale-title">Amazing work! Everyone is home again!</h2>
          <p>You are a great detective!</p>
          <p>Thank you, Vika!</p>
          <button onClick={showOverview}>Back to Lesson 3</button>
        </div>
      </section> : active && <section className="village-interview" aria-labelledby="village-interview-title">
        <ResidentPortrait resident={active} />
        <div>
          <h3 id="village-interview-title">{active.name}</h3>
          {!residentProgress ? <>
            <p className="village-prompt" lang="en">Ask the resident some questions!</p>
            <p>Узнай профессию, место работы, транспорт и номер дома. Задай хотя бы три вопроса вслух.</p>
          </> : !residentProgress.placed ? <>
            <p className="village-prompt" lang="en">Find the House</p>
            <p>{residentProgress.house
              ? `Табличка ${active.name} на доме ${residentProgress.house}. Можно перенести её до подтверждения преподавателем.`
              : 'Выбери дом по подсказкам из интервью.'}</p>
          </> : <>
            <p className="village-prompt" lang="en">The Article Challenge</p>
            <p>Скажи вслух два предложения. В первом назови профессию жителя. Во втором расскажи, в каком доме живёт этот человек, и снова назови его профессию.</p>
            {residentProgress.articles && <p lang="en">{active.name} is home!</p>}
          </>}
        </div>
      </section>}

      {teacher && <Suspense fallback={<p role="status">Открываем картотеку…</p>}>
        <TeacherDesk progress={progress} dispatch={dispatch} onReset={() => setResetting(true)} />
        {resetting && <section className="village-reset" aria-label="Подтверждение сброса">
          <p>Сбросить все интервью и таблички в этом расследовании?</p>
          <button onClick={() => { dispatch({ type: 'reset' }); setResetting(false); }}>Начать заново</button>
          <button onClick={() => setResetting(false)}>Отмена</button>
        </section>}
      </Suspense>}
    </>}
  </main>;
}
