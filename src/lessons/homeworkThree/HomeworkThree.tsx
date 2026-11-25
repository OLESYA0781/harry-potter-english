import { BookOpen, Pencil, Sparkles } from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { LessonProps } from '../types';
import { assetUrl } from '../../assetUrl';
import { articles, plurals, wordOrder, mistakes, questionPrompts, people, pictureLetters, listeningStatements } from './data';
import { articleId, completion, key } from './model';
import { originalAudio } from './audio';
import WordTable from './WordTable';
import '../homeworkOne/homeworkOne.css';
import './homeworkThree.css';

const TeacherAnswers = lazy(() => import('./TeacherAnswers'));
function numbered(items: readonly string[], lang = 'en') {
  return <ol className="hw1-numbered" lang={lang}>{items.map((sentence, index) => <li key={index}>
    <span className="hw1-sentence-number" aria-hidden="true">{index + 1}</span><span>{sentence}</span>
  </li>)}</ol>;
}
function Choices({ label, options, value, choose }: { label: string; options: readonly string[]; value: unknown; choose: (answer: string) => void }) {
  return <span className="hw3-choices" role="group" aria-label={label}>{options.map(option => <button type="button" key={option} aria-pressed={value === option}
    aria-label={option === '—' ? 'No article' : option} onClick={() => choose(value === option ? '' : option)}>{option}</button>)}</span>;
}
function AudioPlayer() {
  const [failed, setFailed] = useState(false);
  return <div className="hw3-audio">
    {originalAudio ? <><p>Audio 1.12 — My Top Three Things</p><audio controls preload="metadata" src={assetUrl(originalAudio)} aria-label="Audio 1.12 — My Top Three Things" onError={() => setFailed(true)} />
      {failed && <p role="alert">Не удалось загрузить оригинальную запись. Попробуй позже.</p>}</>
      : <p role="status">Оригинальная аудиозапись 1.12 пока не добавлена. Для Listening нужна запись SO3_A1_WB_1D_Audio_1_12.mp3.</p>}
  </div>;
}
export default function HomeworkThree({ state, setState, canTeach = false }: LessonProps) {
  const [teacherRequested, setTeacherRequested] = useState(false);
  const teacher = canTeach && teacherRequested;
  useEffect(() => { if (!canTeach) setTeacherRequested(false); }, [canTeach]);
  const save = (patch: Record<string, string | boolean>) => setState(previous => ({ ...previous,
    answers: { ...previous.answers, ...Object.fromEntries(Object.entries(patch).map(([id, value]) => [key(id), value])) },
  }));
  const completed = completion(state.answers).filter(Boolean).length;
  const notebook = (part: string) => <label className="hw1-notebook-done"><input type="checkbox" checked={state.answers[key(`notebook/${part}`)] === true}
    onChange={event => save({ [`notebook/${part}`]: event.target.checked })} />Done in my notebook</label>;
  const notebookNotice = <div className="hw1-notebook"><Pencil size={28} aria-hidden="true" /><strong>Do the task in your notebook.<span lang="ru">Выполни задание в тетради.</span></strong></div>;
  function section(part: string, title: string, instruction: string, children: ReactNode, inNotebook = false) {
    return <section className="hw1-task hw3-task" id={`hw3-part-${part}`} aria-labelledby={`hw3-title-${part}`}>
      <h2 id={`hw3-title-${part}`}><span className="hw1-number" aria-hidden="true">{part.toUpperCase()}</span><span>Part {part.toUpperCase()}. {title}</span></h2>
      <p lang="en">{instruction}</p>{inNotebook && notebookNotice}{children}{inNotebook && notebook(part)}
      {teacher && <Suspense fallback={null}><TeacherAnswers part={part} /></Suspense>}
    </section>;
  }
  return <main className="hw1-homework hw3-homework">
    <header className="hw1-heading"><Sparkles size={38} aria-hidden="true" /><h1>Homework — Lesson 3</h1></header>
    <div className="hw1-links"><a href="#/lessons/lesson-3">← Lesson 3</a><a href="#/vocabulary/lesson-3"><BookOpen size={23} aria-hidden="true" />My Vocabulary</a>
      {canTeach && <button type="button" className="teacher-toggle" aria-pressed={teacher} onClick={() => setTeacherRequested(value => !value)}>{teacher ? 'Exit teacher mode' : 'Teacher mode'}</button>}
    </div>
    <p className="hw3-progress" role="status">Completed parts: {completed} / 8</p>
    {section('1a', 'Articles', 'Complete with a, an or — (no article).', <ol className="hw1-numbered hw3-article-list" lang="en">{articles.map((sentence, i) => <li key={i}>
      <span className="hw1-sentence-number" aria-hidden="true">{i + 1}</span><span>{sentence.split('___').map((text, gap) => <span key={gap}>{gap > 0 && <Choices label={`Sentence ${i + 1}, gap ${gap}`} options={['a', 'an', '—']}
        value={state.answers[key(articleId(i, gap - 1))]} choose={value => save({ [articleId(i, gap - 1)]: value })} />}{text}</span>)}</span>
    </li>)}</ol>)}
    {section('1b', 'Singular and Plural', 'Rewrite the sentences in the plural. Change all the necessary words.', <><p lang="en">Example: She has a red bag. → They have red bags.</p>{numbered(plurals)}</>, true)}
    {section('2', 'Put the Words in the Correct Order', 'Put the words in the correct order to make sentences and questions.', numbered(wordOrder), true)}
    {section('3', 'Find and Correct the Mistakes', 'Each sentence has one or two mistakes. Find them and rewrite the sentence correctly.', numbered(mistakes), true)}
    {section('4a', 'Listening — Match', 'Listen to two people, Ralph and Yolanda. Match the people with pictures A–D.', <>
      <AudioPlayer /><div className="hw3-pictures">{pictureLetters.map(letter => <figure key={letter}><figcaption>{letter}</figcaption><img src={assetUrl(`/art/homework-3/picture-${letter.toLowerCase()}.webp`)} alt={`Picture ${letter}`} width={900} height={900} loading="lazy" /></figure>)}</div>
      <div className="hw3-matching">{people.map(person => <div key={person}><strong>{person}</strong><Choices label={`${person}: picture`} options={pictureLetters} value={state.answers[key(`listening/match/${person}`)]} choose={value => save({ [`listening/match/${person}`]: value })} /></div>)}</div>
    </>)}
    {section('4b', 'Listening — Complete the Table', 'Listen again. Complete the table with the words in the box.', <><AudioPlayer /><WordTable answers={state.answers} save={save} /></>)}
    {section('4c', 'Listening — True or False', 'Listen again. Are the sentences true (T) or false (F)?', <><AudioPlayer />
      <ol className="hw1-numbered hw3-true-false" lang="en">{listeningStatements.map((sentence, i) => <li key={sentence}>
        <span className="hw1-sentence-number" aria-hidden="true">{i + 1}</span><div>{sentence}<Choices label={`Statement ${i + 1}`} options={['True', 'False']} value={state.answers[key(`listening/true-false/${i + 1}`)]} choose={value => save({ [`listening/true-false/${i + 1}`]: value })} /></div>
      </li>)}</ol></>)}
    {section('5', 'Ask a Question', 'Read the sentences in Russian. Write one question in English for each sentence. Use different question words.', <>
      <p lang="ru">Прочитай предложения на русском языке. К каждому предложению составь один вопрос на английском языке. Используй разные вопросительные слова. Выполни задание в тетради.</p>
      <div className="hw3-example"><h3>Example</h3><p lang="ru">Гермиона каждый день читает английские книги в своей комнате.</p><p>Possible questions:</p><ul lang="en"><li>What does Hermione read?</li><li>Where does Hermione read English books?</li><li>How often does Hermione read books?</li><li>Does Hermione read books in her room?</li></ul></div>
      {numbered(questionPrompts, 'ru')}
    </>, true)}
  </main>;
}
