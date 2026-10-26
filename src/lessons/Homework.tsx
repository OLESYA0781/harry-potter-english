import { useEffect, useRef, useState } from 'react';
import type { LessonProps } from './types';
import { homeworkCompletion, homeworkPrefix, homeworkValue, letter, mistakes, questions, remember, sections, sentenceCount, words } from './homeworkData';
import './homework.css';

export default function Homework({ state, setState }: LessonProps) {
  const [step, setStep] = useState(0);
  const [notice, setNotice] = useState('');
  const speech = useRef<SpeechSynthesisUtterance | null>(null);
  useEffect(() => () => { if (speech.current && 'speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);
  const speak = (text: string) => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) { setNotice('Английское произношение недоступно в этом браузере. Попробуй другой браузер.'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB'; utterance.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(item => item.lang.toLowerCase().startsWith('en'));
    if (voice) utterance.voice = voice;
    else if (voices.length) { setNotice('Английский голос недоступен. Добавь английский голос в настройках устройства.'); return; }
    utterance.onerror = event => { if (event.error !== 'canceled' && event.error !== 'interrupted') setNotice('Не удалось воспроизвести английский голос. Проверь настройки звука и голосов устройства.'); };
    speech.current = utterance; setNotice(''); window.speechSynthesis.speak(utterance);
  };
  const value = (key: string) => homeworkValue(state.answers, key);
  const text = (key: string) => typeof value(key) === 'string' ? value(key) as string : '';
  const save = (key: string, answer: unknown) => setState(previous => ({ ...previous, answers: { ...previous.answers, [homeworkPrefix + key]: answer } }));
  const done = homeworkCompletion(state.answers);
  const count = done.filter(Boolean).length;
  const field = (key: string, label: string, large = false) => <label className="hw-field" key={key}><span>{label}</span><textarea rows={large ? 8 : 2} value={text(key)} onChange={event => save(key, event.target.value)} spellCheck={false} autoCorrect="off" autoCapitalize="off" /></label>;
  const go = (next: number) => { setStep(next); window.speechSynthesis?.cancel(); };
  return <main className="homework">
    <header><p className="hw-eyebrow">Homework 1 · A1–A2 · 20–25 minutes</p><h1>My First Hogwarts Mission</h1><p>Write your own answers. You can come back and change them.</p><small>Ответы сохраняются автоматически. Облачный статус — в панели наверху.</small></header>
    <nav className="hw-steps" aria-label="Homework sections">{sections.map((name, i) => <button key={name} aria-current={step === i ? 'step' : undefined} onClick={() => go(i)}>{i + 1}. {name}{done[i] ? ' ✓' : ''}</button>)}<button onClick={() => go(5)} aria-current={step === 5 ? 'step' : undefined}>Mission progress</button></nav>
    {notice && <p role="status">{notice}</p>}
    <section className="hw-panel" aria-label={sections[step] || 'Mission progress'}>
      {step < 5 && <h2>{sections[step]}</h2>}
      {step === 0 && <><p>Listen, read and learn. Tap the translation to hide it.</p><div className="hw-words">{words.map(([english, russian, example], i) => <article key={english}><h3>{english}</h3><button className="btn" aria-label={`Listen: ${english}`} onClick={() => speak(english)}>♫ Listen</button><details open><summary>Перевод</summary><p lang="ru">{russian}</p></details><p className="hw-example">{example}</p><label><input type="checkbox" checked={value(`learned${i}`) === true} onChange={event => save(`learned${i}`, event.target.checked)} /> Выучено</label></article>)}</div><h3>Remember the Words</h3>{remember.map((q, i) => field(`remember${i}`, q))}</>}
      {step === 1 && <><p>Hermione made some mistakes. Help her! Find the mistake and write the correct sentence.</p>{mistakes.map((q, i) => field(`grammar${i}`, `${i + 1}. ${q}`))}</>}
      {step === 2 && <><p>Read Hermione's letter and answer the questions.</p><button className="btn" onClick={() => speak(letter)}>♫ Listen to the letter</button><div className="hw-letter">{letter}</div>{questions.map((q, i) => field(`letter${i}`, q))}</>}
      {step === 3 && <><p>Imagine you are a student at Hogwarts. Write 5–7 sentences about your magical day.</p><ul>{['What house are you in?', 'What lessons do you have?', 'Who is your best friend?', 'What magical animal do you like?', 'What do you do after classes?'].map(q => <li key={q}>{q}</li>)}</ul><aside><h3>Useful Words</h3><p>usually · sometimes · after school · rest · spend time with my family · favourite subjects · Russian language · literature</p><small>You do not need to use every word.</small></aside>{field('day', 'My magical day', true)}<p>About {sentenceCount(text('day'))} sentences · aim for 5–7</p><label><input type="checkbox" disabled={!text('day').trim()} checked={value('dayDone') === true && !!text('day').trim()} onChange={event => save('dayDone', event.target.checked)} /> Mark as completed</label></>}
      {step === 4 && <><p>Look at the picture. Write 4 sentences about the room.</p><img className="hw-room" src="/images/magic-room.svg" alt="A magical student bedroom with a bed, a desk, books, an owl sitting on the floor, a cup of tea on the desk and a broom near the bed." /><aside><h3>Useful Words</h3><p>There is… · There are… · I can see… · I like…</p><p>on the floor · is sitting · a cup of tea · clean my room</p></aside>{field('room', 'My room description', true)}<label><input type="checkbox" disabled={!text('room').trim()} checked={value('roomDone') === true && !!text('room').trim()} onChange={event => save('roomDone', event.target.checked)} /> Выполнено</label></>}
      {step === 5 && <><h2>{count === 5 ? 'Mission Complete!' : 'Your Mission'}</h2><p>{count} / 5 sections completed</p><progress value={count} max={5} aria-label="Homework completion" /><ul className="hw-summary">{sections.map((name, i) => <li key={name}><button onClick={() => go(i)}>{name}</button><span>{done[i] ? i === 0 ? 'Изучено' : 'Выполнено' : 'Не завершено'}</span></li>)}</ul>{count === 5 && <div className="hw-award">✦<h3>Hogwarts Homework Star</h3><p>You completed your mission!</p></div>}</>}
    </section>
    <div className="hw-paging"><button className="btn" disabled={step === 0} onClick={() => go(step - 1)}>← Back</button><span>{step + 1} / 6</span><button className="btn" disabled={step === 5} onClick={() => go(step + 1)}>Next →</button></div>
  </main>;
}
