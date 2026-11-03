import { BookOpen, Sparkles } from 'lucide-react';
import PhotoAttachments from './PhotoAttachments';
import type { LessonProps } from '../types';
import { gapKey, gapTasks, translationDialogues, translationSentences, writtenKey } from './data';

export default function HomeworkZero({ state, setState }: LessonProps) {
  const writtenField = (key: string, label: string, rows = 3) => <textarea className="hw0-written" aria-label={label} lang="en" rows={rows} value={typeof state.answers[key] === 'string' ? state.answers[key] as string : ''} onChange={e => { const answer = e.target.value; setState(previous => ({ ...previous, answers: { ...previous.answers, [key]: answer } })); }} spellCheck={false} autoCorrect="off" autoCapitalize="off" />;
  const gapTask = (task: typeof gapTasks[number]) => <section className="hw0-task" id={`hw0-task-${task.number}`} aria-labelledby={`hw0-title-${task.number}`}>
    <h2 id={`hw0-title-${task.number}`}><span className="hw0-number">{task.number}</span><span>Task {task.number}. {task.title}</span></h2>
    <p className="hw0-instruction" lang="en">{task.instruction}</p>
    <ol className="hw0-sentences">{task.sentences.map((sentence, index) => <li key={sentence.id} lang="en">{sentence.text.split('___').map((part, i) => {
      const key = gapKey(task.id, sentence.id, i - 1);
      return <span key={i}>{i > 0 && <input type="text" className="hw0-gap" aria-label={`Task ${task.number}, sentence ${index + 1}, gap ${i}`} value={typeof state.answers[key] === 'string' ? state.answers[key] as string : ''} onChange={e => { const answer = e.target.value; setState(previous => ({ ...previous, answers: { ...previous.answers, [key]: answer } })); }} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} />}{part}</span>;
    })}</li>)}</ol>
  </section>;
  return <main className="hw0-homework">
    <div className="hw0-heading"><Sparkles size={38} aria-hidden="true" /><div><p>Lesson 0 · Homework 0</p><h1>Hogwarts Homework — The Magic of To Be</h1></div></div>
    <nav className="hw0-links" aria-label="Homework 0 navigation"><a href="#/lessons/lesson-0">← Lesson 0</a><a href="#/vocabulary"><BookOpen size={23} aria-hidden="true" />My Vocabulary</a></nav>
    {gapTask(gapTasks[0])}
    <section className="hw0-task" aria-labelledby="hw0-title-2"><h2 id="hw0-title-2"><span className="hw0-number">2</span><span>Task 2. Translate into English</span></h2><p className="hw0-instruction" lang="en">Translate the sentences into English. Use the verb to be.</p><ol className="hw0-sentences" lang="ru">{translationSentences.map((item, i) => <li key={item.id}>{item.text}{writtenField(writtenKey('translations', item.id), `Task 2, sentence ${i + 1}, translation`)}</li>)}</ol></section>
    <section className="hw0-task" aria-labelledby="hw0-title-3"><h2 id="hw0-title-3"><span className="hw0-number">3</span><span>Task 3. Translate the Dialogues</span></h2><p className="hw0-instruction" lang="en">Translate the dialogues into English.</p><ol className="hw0-sentences" lang="ru">{translationDialogues.map((item, i) => <li key={item.id}>{item.text}{writtenField(writtenKey('dialogues', item.id), `Task 3, dialogue ${i + 1}, translation`, 4)}</li>)}</ol></section>
    {gapTask(gapTasks[1])}
    <section className="hw0-task" aria-labelledby="hw0-title-5"><h2 id="hw0-title-5"><span className="hw0-number">5</span><span>Task 5. My Hogwarts Profile</span></h2><p className="hw0-instruction" lang="en">Write 5 sentences about yourself as a pupil at Hogwarts.</p><p>Напиши пять самостоятельных предложений о своей воображаемой жизни в Хогвартсе.</p><ul><li>Используй am / is / are.</li><li>Используй минимум 5 слов из My Vocabulary.</li><li>Добавь хотя бы одно отрицательное предложение.</li></ul>{writtenField(writtenKey('profile'), 'Task 5, My Hogwarts Profile', 8)}</section>
    <PhotoAttachments state={state} setState={setState} />
  </main>;
}
