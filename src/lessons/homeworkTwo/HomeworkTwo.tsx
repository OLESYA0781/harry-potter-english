import { BookOpen, Sparkles } from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { assetUrl } from '../../assetUrl';
import type { LessonProps } from '../types';
import { articleText, letter, questionWords, secretAnswers, statements, warmup, witnesses, wrongQuestions } from './data';
import '../homeworkOne/homeworkOne.css';
import './homeworkTwo.css';

const TeacherAnswers = lazy(() => import('./TeacherAnswers'));

function numbered(items: readonly ReactNode[]) {
  return <ol className="hw1-numbered" lang="en">
    {items.map((item, index) => <li key={index}>
      <span className="hw1-sentence-number" aria-hidden="true">{index + 1}</span>
      <span>{item}</span>
    </li>)}
  </ol>;
}

export default function HomeworkTwo({ canTeach = false }: Pick<LessonProps, 'canTeach'>) {
  const [teacherRequested, setTeacherRequested] = useState(false);
  const teacher = canTeach && teacherRequested;
  useEffect(() => { if (!canTeach) setTeacherRequested(false); }, [canTeach]);

  function section(number: number, title: string, instructions: string[], children: ReactNode) {
    return <section className="hw1-task" aria-labelledby={`hw2-title-${number}`}>
      <h2 id={`hw2-title-${number}`}>
        <span className="hw1-number" aria-hidden="true">{number}</span>
        <span>Task {number}. {title}</span>
      </h2>
      <div className="hw1-instructions" lang="ru">
        {instructions.map(instruction => <p key={instruction} lang="ru">{instruction}</p>)}
      </div>
      {children}
      {teacher && <Suspense fallback={null}><TeacherAnswers task={number} /></Suspense>}
    </section>;
  }

  return <main className="hw1-homework hw2-homework">
    <div className="hw1-heading">
      <Sparkles size={38} aria-hidden="true" />
      <div>
        <h1>Homework — Lesson 2: The Hogwarts Investigation</h1>
        <p className="hw1-subtitle" lang="ru">Дело о пропавшем письме</p>
      </div>
    </div>
    <div className="hw1-links">
      <a href="#/lessons/lesson-2">← Lesson 2</a>
      <a href="#/vocabulary"><BookOpen size={23} aria-hidden="true" />My Vocabulary</a>
      {canTeach && <button type="button" className="teacher-toggle" aria-pressed={teacher}
        onClick={() => setTeacherRequested(requested => !requested)}>
        {teacher ? 'Exit teacher mode' : 'Teacher mode'}
      </button>}
    </div>

    {section(1, 'Question Words — Разминка', [
      'Гарри рассказывает другу о работе своего папы. Друг задаёт ему вопросы для школьного проекта.',
      'Вставь подходящие вопросительные слова из списка:',
    ], <>
      <p className="hw2-word-bank" lang="en">{questionWords.join(' · ')}</p>
      <div className="hw1-instructions">
        <p lang="ru">Запиши в тетрадь номер вопроса и подходящее слово. Полностью переписывать вопросы не нужно.</p>
        <p lang="ru">Пример: 1 — What</p>
      </div>
      {numbered(warmup)}
      <p lang="ru">Одно вопросительное слово не понадобится.</p>
    </>)}

    {section(2, 'The Wrong Questions — Найди ошибки', [
      'Прочитай вопросы. Некоторые из них составлены неправильно, а некоторые уже правильные.',
      'Запиши все 12 вопросов в тетрадь.',
      'Если вопрос неправильный — исправь его. Если правильный — перепиши без изменений и поставь рядом ✓.',
    ], numbered(wrongQuestions))}

    {section(3, 'The Secret Answers — Составь вопросы', [
      'Прочитай ответы персонажей.',
      'К каждому ответу самостоятельно составь подходящий вопрос на английском языке.',
      'Запиши в тетрадь номер задания и полный вопрос.',
    ], numbered(secretAnswers.map(([answer, hint]) => <>
      {answer}<span className="hw1-question-translation" lang="ru">{hint}</span>
    </>)))}

    {section(4, 'The Article Mystery — Тайна артиклей', [
      'Прочитай текст.',
      'В каждом пропуске стоит номер.',
      'Определи, какой артикль нужен: a, an, the или артикль не нужен (—).',
      'В тетради записывай только номер пропуска и ответ.',
    ], <>
      <div className="hw1-instructions">
        <p lang="ru">Пример записи:</p>
        <ul className="hw2-answer-pairs" lang="en">
          <li>1 — an</li><li>2 — the</li><li>3 — a</li><li>4 — —</li>
        </ul>
        <p lang="ru">Не нужно переписывать весь текст.</p>
      </div>
      <div className="hw1-written-card" lang="en">
        {articleText.map(paragraph => <p key={paragraph}>
          {paragraph.split(/(\(\d+\) ___)/).map((part, index) => index % 2
            ? <span className="hw2-blank" key={part}>{part}</span> : part)}
        </p>)}
      </div>
    </>)}

    {section(5, 'The Witness Statements — Показания свидетелей', [
      'Прочитай показания трёх свидетелей.',
      'Затем прочитай утверждения.',
      'В тетради запиши номер и True или False.',
    ], <div lang="en">
      <div className="hw2-witnesses">
        {witnesses.map(({ job, image, statement }, index) => <article key={job} className="hw1-written-card">
          <img src={assetUrl(`/art/lesson-2/homework/${image}.webp`)} alt="" width={384} height={384} loading="lazy" />
          <h3>Witness {index + 1} — {job}</h3>
          <p>{statement}</p>
        </article>)}
      </div>
      <h3>Statements:</h3>
      {numbered(statements)}
    </div>)}

    {section(6, 'The Grammar Detective — Исправь письмо', [
      'В волшебном письме спрятаны грамматические ошибки.',
      'Найди их и перепиши весь текст в тетрадь правильно.',
      'Обрати внимание на артикли, глагол to be, Present Simple, Do / Does и порядок слов в вопросах.',
    ], <article className="hw2-letter" lang="en">
      <h3>The Secret Letter</h3>
      {letter.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      <span className="hw2-seal" aria-hidden="true"><Sparkles size={26} /></span>
    </article>)}
  </main>;
}
