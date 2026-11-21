import { useEffect, useState } from 'react';
import { Oral, Picture, Review, Sort, useBag } from './Activities';
import { objects } from './data';
import type { ObjectWord } from './data';

const words = objects.map(([word]) => word);
const listenOrder = [8, 3, 11, 6, 0, 12, 2, 10, 1, 5, 9, 4, 7];
const missingRounds = [[0, 2, 3, 4, 5, 8], [1, 6, 7, 10, 11, 12], [2, 3, 5, 7, 9, 10]];
const removed = [3, 1, 4];

function usePronunciation() {
  const [message, setMessage] = useState('');
  const available = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  return { available, message, pronounce: (text: string) => {
    if (!available) return;
    speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(text);
    voice.lang = 'en-GB';
    voice.rate = 0.85;
    voice.onerror = event => { if (event.error !== 'canceled' && event.error !== 'interrupted') setMessage('Озвучка недоступна. Попроси преподавателя прочитать слово.'); };
    setMessage('');
    speechSynthesis.speak(voice);
  }};
}
function Listen() {
  const { read, write } = useBag();
  const audio = usePronunciation();
  const round = Math.min(Number(read('listen/round') ?? 0), listenOrder.length - 1);
  const correct = listenOrder[round];
  const choices = [correct, (correct + 3) % 13, (correct + 7) % 13, (correct + 11) % 13].sort((a,b) => a-b);
  const submitted = read('listen/choice');
  const done = read('listen/done') === true;
  return <section className="bag-task"><h3>C. Listen and Find</h3>
    <p>Слово {round + 1} из {words.length}. Послушай и выбери картинку.</p>
    {audio.available ? <button onClick={() => audio.pronounce(words[correct])}>Послушать слово</button>
      : <p>Попроси преподавателя прочитать слово из ключа.</p>}
    <p role="status">{audio.message}</p>
    <div className="bag-pictures">{choices.map((index, i) => <button key={index} aria-label={`Картинка ${i + 1}`}
      aria-pressed={submitted === index} disabled={done} onClick={() => write({ 'listen/choice': index })}><Picture word={words[index]} /></button>)}</div>
    {typeof submitted === 'number' && <p role="status">{submitted === correct ? 'Верно.' : 'Послушай ещё раз.'}</p>}
    <button disabled={done || submitted !== correct} onClick={() => write(round + 1 === words.length
      ? { 'listen/done': true } : { 'listen/round': round + 1, 'listen/choice': null })}>{round + 1 === words.length ? 'Завершить' : 'Следующее слово'}</button>
    <Review id="listen" answers={<p>Текущее слово: <strong>{words[correct]}</strong></p>} />
  </section>;
}
function Missing() {
  const { read, write } = useBag();
  const [phase, setPhase] = useState<'ready'|'looking'|'guess'>('ready');
  const round = Math.min(Number(read('missing/round') ?? 0), missingRounds.length - 1);
  const items = missingRounds[round];
  const answer = items[removed[round]];
  const selected = read('missing/choice');
  const done = read('missing/done') === true;
  useEffect(() => {
    if (phase !== 'looking') return;
    const timer = window.setTimeout(() => setPhase('guess'), 4400);
    return () => window.clearTimeout(timer);
  }, [phase]);
  return <section className="bag-task"><h3>D. What’s Missing?</h3><p>Раунд {round + 1} из {missingRounds.length}. Запомни шесть предметов.</p>
    {phase === 'ready' && !done && <button onClick={() => { write({ 'missing/choice': null }); setPhase('looking'); }}>Показать предметы</button>}
    {phase !== 'ready' && <div className="bag-pictures">{items.map((index, i) => <div key={index} className="bag-memory" aria-label={`Место ${i + 1}`}>
      {(phase === 'looking' || index !== answer) && <Picture word={words[index]} />}
    </div>)}</div>}
    {phase === 'guess' && !done && <><p>Какой предмет исчез?</p>
      <div className="bag-row">{items.map(index => <button key={index} aria-pressed={selected === index}
        onClick={() => write({ 'missing/choice': index })}>{words[index]}</button>)}</div>
      {typeof selected === 'number' && <p role="status">{selected === answer ? 'Верно.' : 'Попробуй ещё раз.'}</p>}
      <button disabled={selected !== answer} onClick={() => {
        write(round + 1 === missingRounds.length ? { 'missing/done': true } : { 'missing/round': round + 1, 'missing/choice': null });
        setPhase('ready');
      }}>{round + 1 === missingRounds.length ? 'Завершить' : 'Следующий раунд'}</button>
    </>}
    {done && <p>Все раунды завершены.</p>}
    <Review id="missing" answers={<p>Раунд {round + 1}: {words[answer]}</p>} />
  </section>;
}

export default function Vocabulary() {
  const { read, write } = useBag();
  const audio = usePronunciation();
  const oralIndex = Number(read('word-speaking/index') ?? 5);
  return <>
    <section className="bag-task"><h3>A. Learn the Words</h3>
      <div className="bag-cards">{objects.map(([word, translation]) => <article key={word}>
        <Picture word={word} /><strong lang="en">{word}</strong><span>{translation}</span>
        {audio.available && <button aria-label={`Послушать: ${word}`} onClick={() => audio.pronounce(word)}>Послушать</button>}
      </article>)}</div>
      <p role="status">{audio.message}</p>
      <button disabled={read('learn') === true} onClick={() => write({ learn: true })}>{read('learn') === true ? 'Слова просмотрены' : 'Все слова просмотрены'}</button>
      <Review id="learn" />
    </section>
    <section className="bag-task"><h3>B. Match the Objects</h3>
      <Sort id="match" instruction="Соедини слова с картинками."
        cards={[...words].reverse().map(word => ({ id: word, label: word, target: word }))}
        targets={[4,10,3,11,5,0,12,6,8,1,9,7,2].map((index, i) => ({
          id: words[index], label: <Picture word={words[index]} />, name: `Картинка ${i + 1}`,
        }))} />
    </section>
    <Listen /><Missing />
    <Oral id="word-speaking" title="E. Say the Word" instruction="Назови предмет вслух." model={<p>{words[oralIndex]}</p>}>
      <div className="bag-oral-picture"><Picture word={words[oralIndex] as ObjectWord} /></div>
      <button onClick={() => write({ 'word-speaking/index': (oralIndex + 1) % words.length, 'word-speaking': false })}>Другой предмет</button>
    </Oral>
  </>;
}
