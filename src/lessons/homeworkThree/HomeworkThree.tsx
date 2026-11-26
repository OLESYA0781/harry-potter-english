/// <reference types="vite/client" />
import { Pencil, Sparkles } from 'lucide-react';
import { Fragment, lazy, Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import audioUrl from '../../../SO3_A1_WB_1D_Audio_1_12.mp3?url';
import { assetUrl } from '../../assetUrl';
import { lessonPrefix } from '../progress';
import type { LessonProps } from '../types';
import { articles, listeningStatements, mistakes, people, pictures, plurals, questionPrompts, tableRows, wordBank, wordOrder } from './data';
import '../homeworkOne/homeworkOne.css';
import './homeworkThree.css';

const TeacherAnswers = lazy(() => import('./TeacherAnswers'));

function Numbered({ items, lang = 'en' }: { items: readonly ReactNode[]; lang?: string }) {
  return <ol className="hw1-numbered" role="list" lang={lang}>
    {items.map((item, index) => <li key={index}>
      <span className="hw1-sentence-number">{index + 1}.</span><span>{item}</span>
    </li>)}
  </ol>;
}

function ListeningAudio() {
  const [failed, setFailed] = useState(false);
  return <div className="hw3-audio">
    <p>Audio 1.12</p>
    <audio aria-label="Audio 1.12" controls preload="metadata" src={audioUrl} onError={() => setFailed(true)} />
    {failed && <p lang="ru">Оригинальная аудиозапись пока недоступна.</p>}
  </div>;
}

export default function HomeworkThree({ state, setState, canTeach }: LessonProps) {
  const [teacherRequested, setTeacherRequested] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  const teacher = canTeach && teacherRequested;
  useEffect(() => { if (!canTeach) setTeacherRequested(false); }, [canTeach]);

  const key = (field: string) => `${lessonPrefix}lesson-3-homework/v1/${field}`;
  const save = (field: string, value: string | boolean) => {
    setState(previous => ({ ...previous, answers: { ...previous.answers, [key(field)]: value } }));
  };
  const value = (field: string) => {
    const saved = state.answers[key(field)];
    return typeof saved === 'string' ? saved : '';
  };
  function choices(field: string, label: string, options: readonly string[]) {
    return <select aria-label={label} value={value(field)} onChange={event => save(field, event.target.value)}>
      <option value="">___</option>
      {options.map(option => <option key={option}>{option}</option>)}
    </select>;
  }
  function section(part: string, title: string, instruction: string, children: ReactNode) {
    return <section className="hw1-task" aria-labelledby={`hw3-title-${part}`}>
      <h2 id={`hw3-title-${part}`}>Part {part}. {title}</h2>
      <div className="hw1-instructions"><p>{instruction}</p></div>
      {children}
      {teacher && <Suspense fallback={null}><TeacherAnswers part={part} /></Suspense>}
    </section>;
  }
  function notebook(translation = 'Выполни задание в тетради.') {
    return <div className="hw1-notebook">
      <Pencil size={24} aria-hidden="true" />
      <strong>Do the task in your notebook.<span lang="ru">{translation}</span></strong>
    </div>;
  }
  function done(part: string) {
    const field = `notebook-${part}`;
    return <label className="hw1-notebook-done">
      <input type="checkbox" checked={state.answers[key(field)] === true}
        onChange={event => save(field, event.target.checked)} />
      Done in my notebook
    </label>;
  }
  function placeWord(field: string, word: string) {
    if (!wordBank.includes(word)) return;
    save(field, word);
    setSelectedWord('');
  }

  return <main className="hw1-homework hw3-homework" lang="en">
    <header className="hw1-heading">
      <Sparkles size={38} aria-hidden="true" />
      <h1>Homework — Lesson 3</h1>
    </header>
    {canTeach && <div className="hw1-links">
      <button type="button" className="teacher-toggle" aria-pressed={teacher}
        onClick={() => setTeacherRequested(requested => !requested)}>
        {teacher ? 'Exit teacher mode' : 'Teacher mode'}
      </button>
    </div>}

    {section('1A', 'Articles', 'Complete with a, an or — (no article).',
      <Numbered items={articles.map((sentence, index) => sentence.split('___').map((text, blank) =>
        <Fragment key={blank}>
          {blank > 0 && choices(`article-${index + 1}-${blank}`, `Sentence ${index + 1}, article ${blank}`, ['a', 'an', '—'])}
          {text}
        </Fragment>))} />)}

    {section('1B', 'Singular and Plural', 'Rewrite the sentences in the plural. Change all the necessary words.', <>
      {notebook()}
      <p><strong>Example</strong><br />She has a red bag. → They have red bags.</p>
      <Numbered items={plurals} />
      {done('1B')}
    </>)}

    {section('2', 'Put the Words in the Correct Order', 'Put the words in the correct order to make sentences and questions.', <>
      {notebook()}
      <Numbered items={wordOrder} />
      {done('2')}
    </>)}

    {section('3', 'Find and Correct the Mistakes', 'Each sentence has one or two mistakes. Find them and rewrite the sentence correctly.', <>
      {notebook()}
      <Numbered items={mistakes} />
      {done('3')}
    </>)}

    {section('4A', 'Listening — Match', 'Listen to two people, Ralph and Yolanda. Match the people with pictures A–D.', <>
      <p><strong>My Top Three Things</strong><br />Source: Speakout Third Edition A1 Workbook, Lesson 1D, page 9.</p>
      <ListeningAudio />
      <div className="hw3-pictures">
        {pictures.map(({ letter, description }) => <figure key={letter}>
          <img src={assetUrl(`/art/lesson-3/homework/${letter.toLowerCase()}.webp`)}
            alt={description} width={512} height={512} loading="lazy" />
          <figcaption>{letter}</figcaption>
        </figure>)}
      </div>
      <div className="hw3-matches">
        {people.map(person => <label key={person}>{person} {choices(`match-${person}`, person, pictures.map(picture => picture.letter))}</label>)}
      </div>
    </>)}

    {section('4B', 'Listening — Complete the Table', 'Listen again. Complete the table with the words in the box.', <>
      <ListeningAudio />
      <div className="hw3-bank" role="group" aria-label="Word bank">
        {wordBank.map(word => <button type="button" key={word} draggable
          aria-pressed={selectedWord === word}
          onClick={() => setSelectedWord(current => current === word ? '' : word)}
          onDragStart={event => event.dataTransfer.setData('text/plain', word)}>{word}</button>)}
      </div>
      <table className="hw3-table">
        <thead><tr><td />{people.map(person => <th scope="col" key={person}>{person}</th>)}</tr></thead>
        <tbody>{tableRows.map(row => <tr key={row}>
          <th scope="row">{row}</th>
          {people.map(person => {
            const field = `table-${person}-${row}`;
            const label = `${person} — ${row}`;
            return <td key={person}
              onDragOver={event => event.preventDefault()}
              onDrop={event => {
                event.preventDefault();
                placeWord(field, event.dataTransfer.getData('text/plain'));
              }}>
              {selectedWord
                ? <button type="button" aria-label={`Put ${selectedWord} in ${label}`}
                    onClick={() => placeWord(field, selectedWord)}>{value(field) || '___'}</button>
                : <div className="hw3-table-choice">
                    {choices(field, label, wordBank)}
                    <span aria-hidden="true">{value(field) || '___'}</span>
                  </div>}
            </td>;
          })}
        </tr>)}</tbody>
      </table>
    </>)}

    {section('4C', 'Listening — True or False', 'Listen again. Are the sentences true (T) or false (F)?', <>
      <ListeningAudio />
      <Numbered items={listeningStatements.map((sentence, index) => <>
        {sentence} {choices(`true-false-${index + 1}`, `Statement ${index + 1}, True or False`, ['True', 'False'])}
      </>)} />
    </>)}

    {section('5', 'Ask a Question', 'Read the sentences in Russian. Write one question in English for each sentence. Use different question words.', <>
      {notebook('Прочитай предложения на русском языке. К каждому предложению составь один вопрос на английском языке. Используй разные вопросительные слова. Выполни задание в тетради.')}
      <div className="hw1-written-card hw3-example">
        <h3>Example</h3>
        <p lang="ru">Гермиона каждый день читает английские книги в своей комнате.</p>
        <p>Possible questions:</p>
        <ul>
          <li>What does Hermione read?</li>
          <li>Where does Hermione read English books?</li>
          <li>How often does Hermione read books?</li>
          <li>Does Hermione read books in her room?</li>
        </ul>
      </div>
      <h3>Your task</h3>
      <Numbered items={questionPrompts} lang="ru" />
      {done('5')}
    </>)}
  </main>;
}
