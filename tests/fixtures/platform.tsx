// Dev-server-only fixture. Vite production builds include only the real index.html.
import { createRoot } from 'react-dom/client';
import App from '../../src/App';
import { initial } from '../../src/data';
import { sortLessons, trialLesson } from '../../src/lessons/registry';
import type { LessonDefinition, LessonProps } from '../../src/lessons/types';
import '../../src/style.css';
function Exercise({ state, setState }: LessonProps) {
  return <main><h1>Тестовый новый урок</h1>
    <label>Ответ нового урока<input value={String(state.answers.draft || '')} onChange={e => { const value = e.target.value; setState(s => ({ ...s, answers: { ...s.answers, draft: value } })); }} /></label>
    <button className="btn" onClick={() => setState(s => ({ ...s, step: 1, ratings: { teacher: 2 }, scores: { check: { correct: true, first: false, latest: true, skill: 'Grammar' } } }))}>Проверить новый урок</button>
    <button className="pill" onClick={() => setState(structuredClone(initial))}>Сбросить этот урок</button>
  </main>;
}
const word: LessonDefinition = {
  id: 'word-quest', title: 'Слова и открытия', subtitle: 'Word Quest', addedAt: '2026-11-01', description: 'Тестовый модуль слов.', initialState: initial, Component: Exercise,
  summarize: s => ({ status: s.step ? 'completed' : s.answers.draft ? 'in-progress' : 'not-started', percent: s.step ? 100 : s.answers.draft ? 50 : 0, detail: s.step ? '1 из 1' : '0 из 1' }),
};
const reading: LessonDefinition = { ...word, id: 'reading-quest', title: 'Волшебное чтение', subtitle: 'Reading Quest', addedAt: '2026-11-02' };
createRoot(document.getElementById('root')!).render(<App catalog={sortLessons([word, trialLesson, reading])} />);
