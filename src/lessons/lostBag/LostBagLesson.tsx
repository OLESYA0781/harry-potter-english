import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BookOpen, Search, Sparkles } from 'lucide-react';
import { assetUrl } from '../../assetUrl';
import type { LessonProps } from '../types';
import { finalQuestions, neighbours, noteColumns, prompts, reply } from './data';
import { key, noteId, progress, questionId, replyId } from './model';
import Portrait from './Portrait';
import './lostBag.css';

const TeacherAnswers = lazy(() => import('./TeacherAnswers'));
const sections = [['case', 'A mysterious bag'], ['neighbours', 'Ask the neighbours'], ['notebook', "Detective’s Notebook"], ['final', 'Final Investigation']] as const;

export default function LostBagLesson({ state, setState, canTeach = false }: LessonProps) {
  const [teacherRequested, requestTeacher] = useState(false);
  const teacher = canTeach && teacherRequested;
  useEffect(() => { if (!canTeach) requestTeacher(false); }, [canTeach]);
  const dialogHeading = useRef<HTMLHeadingElement>(null);
  const text = (id: string) => typeof state.answers[key(id)] === 'string' ? state.answers[key(id)] as string : '';
  const seen = (id: string) => state.answers[key(id)] === true;
  const write = (patch: Record<string, string | boolean>) => setState(previous => ({ ...previous, answers: {
    ...previous.answers, ...Object.fromEntries(Object.entries(patch).map(([id, value]) => [key(id), value])),
  } }));
  const activeId = text('dialog/active');
  const person = neighbours.find(neighbour => neighbour.id === activeId);
  const saved = progress(state.answers);
  const open = (id: string) => {
    write({ 'dialog/active': id, [`dialog/visited/${id}`]: true });
    requestAnimationFrame(() => { dialogHeading.current?.focus({ preventScroll: true }); dialogHeading.current?.scrollIntoView({ behavior: 'auto', block: 'start' }); });
  };
  const close = () => {
    write({ 'dialog/active': '' });
    requestAnimationFrame(() => { const window = document.getElementById(`lb-window-${activeId}`); document.querySelector('.lb-house')?.scrollIntoView({ block: 'start' }); window?.focus({ preventScroll: true }); });
  };

  return <div className="lb-layout">
    <aside className="lb-sidebar"><span>Lesson 4</span><nav aria-label="Lesson 4 warm-up sections">{sections.map(([id, title], i) => <a key={id} href={`#lb-${id}`} onClick={event => { event.preventDefault(); document.getElementById(`lb-${id}`)?.scrollIntoView({ behavior: 'auto' }); }}><b>{String(i + 1).padStart(2, '0')}</b>{title}</a>)}</nav></aside>
    <main className="lb-main">
      <header className="lb-heading"><div><p>Lesson 4 · Warm-up</p><h1>The Mystery of the Lost Bag</h1></div><Search size={38} aria-hidden="true" /></header>
      <div className="lb-toolbar"><a href="#/vocabulary/lesson-3"><BookOpen size={21} aria-hidden="true" />Common objects — My Vocabulary</a>
        {canTeach && <button type="button" className="teacher-toggle" aria-pressed={teacher} onClick={() => requestTeacher(value => !value)}>{teacher ? 'Exit teacher mode' : 'Teacher mode'}</button>}
      </div>
      <p className="lb-progress" role="status">{saved.done} / {saved.total} entries saved · {saved.interviews} questions asked · {saved.notes} notes · {saved.final} final answers</p>
      <section id="lb-case" className="lb-panel lb-case" aria-labelledby="lb-case-title"><div><span className="lb-kicker">The case file</span><h2 id="lb-case-title">A mysterious bag</h2>
        <p>Someone has lost a bag near this house. Six people live here. Ask them questions, collect information and find the owner of the bag.</p>
        <p><strong>Good luck, detective!</strong></p><p>Look inside the brown bag:</p><ul><li>a notebook;</li><li>a wallet;</li><li>a blue umbrella;</li><li>glasses;</li><li>two keys.</li></ul>
        <p className="lb-help">You can visit any flat and come back later. Your questions and notes are saved as you write.</p>
      </div><img src={assetUrl('/art/lesson-4/evidence.webp')} width={1000} height={1000} alt="An open brown bag with a notebook, a wallet, a blue umbrella, glasses and two separate keys, all clearly visible." /></section>
      <section id="lb-neighbours" className="lb-panel" aria-labelledby="lb-neighbours-title"><h2 id="lb-neighbours-title">Ask the neighbours</h2><p>Choose a window. Use each clue to write your own question, then press Ask to read your neighbour’s reply.</p>
        <div className={`lb-investigation ${person ? 'lb-dialog-open' : ''}`}>
          <div className="lb-house" role="group" aria-label="Three-storey house with six flats">
            <img src={assetUrl('/art/lesson-4/house.webp')} width={1000} height={1250} alt="A three-storey English house with two windows on each floor." />
            {neighbours.map((neighbour, index) => <button type="button" id={`lb-window-${neighbour.id}`} className={`lb-window lb-window-${index + 1} ${seen(`dialog/visited/${neighbour.id}`) ? 'lb-visited' : ''}`} key={neighbour.id}
              aria-label={`Flat ${index + 1} — ${neighbour.name}`} aria-expanded={person?.id === neighbour.id} aria-controls="lb-dialog" onClick={() => open(neighbour.id)}>
              <Portrait index={index} /><span className="lb-window-label">{index + 1} · {neighbour.name}</span>
            </button>)}
          </div>
          {person && <section className="lb-dialog" id="lb-dialog" aria-labelledby="lb-dialog-title">
            <div className="lb-dialog-heading"><Portrait index={neighbours.indexOf(person)} /><div><p>Flat {neighbours.indexOf(person) + 1}</p><h3 id="lb-dialog-title" ref={dialogHeading} tabIndex={-1}>{person.name}</h3></div></div>
            <button type="button" className="lb-back" onClick={close}>← Back to the house</button>
            <p>Write a full question for each clue. You can change your questions at any time.</p>
            <div className="lb-questions">{prompts.map((prompt, index) => {
              const id = questionId(person.id, prompt.id), responseId = replyId(person.id, prompt.id);
              return <article className="lb-question" key={prompt.id}>
                <label htmlFor={`lb-${person.id}-${prompt.id}`}><span>{index + 1}</span>{prompt.label}</label>
                <textarea id={`lb-${person.id}-${prompt.id}`} aria-label={`${person.name}, ${prompt.label}: your question`} rows={2} autoCapitalize="off" autoCorrect="off" spellCheck={false} lang="en" value={text(id)} onChange={event => write({ [id]: event.target.value })} />
                <button type="button" disabled={!text(id).trim()} onClick={() => write({ [responseId]: true })}>Ask</button>
                {seen(responseId) && <p className="lb-reply" role="status"><strong>{person.name}:</strong> {reply(person, prompt.id)}</p>}
              </article>;
            })}</div>
            <button type="button" className="lb-back" onClick={close}>← Back to the house</button>
          </section>}
        </div>
      </section>
      <section id="lb-notebook" className="lb-panel" aria-labelledby="lb-notebook-title"><h2 id="lb-notebook-title">Detective’s Notebook</h2><p>Write the information you collect. The notebook is yours to fill in.</p>
        <table className="lb-notebook"><caption className="lb-sr-only">Your investigation notes about all six neighbours</caption><thead><tr><th scope="col">Name</th>{noteColumns.map(column => <th scope="col" key={column.id}>{column.title}</th>)}</tr></thead>
          <tbody>{neighbours.map(neighbour => <tr key={neighbour.id}><th scope="row">{neighbour.name}</th>{noteColumns.map(column => {
            const id = noteId(neighbour.id, column.id); return <td key={column.id}><label><span className="lb-note-label">{column.title}</span><input aria-label={`${neighbour.name}, ${column.title}`} type="text" autoComplete="off" autoCorrect="off" spellCheck={false} value={text(id)} onChange={event => write({ [id]: event.target.value })} /></label></td>;
          })}</tr>)}</tbody>
        </table>
      </section>
      <section id="lb-final" className="lb-panel" aria-labelledby="lb-final-title"><h2 id="lb-final-title">Final Investigation</h2><p>Answer in full sentences.</p>
        <div className="lb-final-questions">{finalQuestions.map((question, index) => <label key={question.id}><span>{index + 1}. {question.text}</span>
          <textarea aria-label={question.text} rows={3} lang="en" autoCapitalize="off" autoCorrect="off" spellCheck={false} value={text('final/' + question.id)} onChange={event => write({ ['final/' + question.id]: event.target.value })} />
        </label>)}</div>
        <label className="lb-description"><span>Write 4–6 sentences about the owner of the bag.</span><textarea aria-label="Write 4–6 sentences about the owner of the bag." rows={7} lang="en" autoCapitalize="off" autoCorrect="off" spellCheck={false} value={text('final/description')} onChange={event => write({ 'final/description': event.target.value })} /></label>
        <p className="lb-help"><Sparkles size={22} aria-hidden="true" />Your investigation is saved as you write. You can return and edit it later.</p>
      </section>
      {teacher && <Suspense fallback={<p>Loading teacher notes…</p>}><TeacherAnswers state={state} /></Suspense>}
    </main>
  </div>;
}
