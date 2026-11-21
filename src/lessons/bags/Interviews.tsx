import { useEffect, useState } from 'react';
import { Review, useBag } from './Activities';

const letters = 'ABCDEFGHI'.split('');
function fields(text: unknown, count: number) {
  return Array.from({ length: count }, (_, i) => String(text ?? '').split('\n')[i]?.trim() ?? '');
}

export default function Interviews() {
  const { read, write, teacher } = useBag();
  const draft = (key: string) => String(read('street/' + key) ?? '');
  const save = (key: string, value: string) => write({ ['street/' + key]: value, 'street/done': false });
  const setup = (key: string) => String(read('street-setup/' + key) ?? '');
  const updateSetup = (key: string, value: string) => write({ ['street-setup/' + key]: value, 'street/done': false });
  const names = fields(setup('names'), 9);
  const statements = fields(setup('statements'), 6);
  const [video, setVideo] = useState('');
  useEffect(() => () => { if (video) URL.revokeObjectURL(video); }, [video]);
  const select = (key: string, label: string, choices = letters) => <label key={key}>{label}
    <select aria-label={label} value={draft(key)} onChange={event => save(key, event.target.value)}>
      <option value="">—</option>{choices.map(choice => <option key={choice}>{choice}</option>)}
    </select>
  </label>;
  return <>
    <section className="bag-task">
      <p>Посмотрите оригинальное интервью Speakout 1D вместе с преподавателем. Используйте его отдельно, например в Pearson English Portal.</p>
      {video && <video className="bag-video" controls src={video} aria-label="Оригинальное интервью" />}
      <Review id="street-setup">
        <label>Открыть оригинальное видео с компьютера
          <input type="file" accept="video/*" onChange={event => {
            const file = event.target.files?.[0];
            setVideo(file ? URL.createObjectURL(file) : '');
          }} />
        </label>
        <p>Перед уроком перенесите имена и шесть утверждений со страницы 14. Для проверки указывайте только ключи, сверенные по оригинальному видео.</p>
        <label>Девять имён A–I по порядку, по одному на строку
          <textarea rows={9} value={setup('names')} onChange={event => updateSetup('names', event.target.value)} />
        </label>
        <label>Шесть утверждений, по одному на строку
          <textarea rows={6} value={setup('statements')} onChange={event => updateSetup('statements', event.target.value)} />
        </label>
        <label>Проверенный ключ преподавателя (если есть)
          <textarea rows={4} value={setup('verified-key')} onChange={event => updateSetup('verified-key', event.target.value)} />
        </label>
      </Review>
    </section>
    <section className="bag-task"><h3>A. Who Speaks First?</h3>
      <p>Смотри первую часть. Расположи A–I по порядку появления. Первые два уже известны: 1 — H, 2 — A.</p>
      <div className="bag-fields">{Array.from({ length: 7 }, (_, i) => select('order/' + i, String(i + 3),
        letters.filter(letter => letter !== 'H' && letter !== 'A' &&
          (letter === draft('order/' + i) || !Array.from({ length: 7 }, (_, n) => draft('order/' + n)).includes(letter)))))}</div>
      <Review id="street/order" />
    </section>
    <section className="bag-task"><h3>B. Name Detective</h3>
      <p>Найди четыре ошибки в именах. Сверяйся со страницей 14, если имена ещё не внесены.</p>
      <div className="bag-fields">{letters.map((letter, i) => <label key={letter}>{letter}{names[i] && ' · ' + names[i]}
        <input value={draft('name/' + letter)} onChange={event => save('name/' + letter, event.target.value)} />
      </label>)}</div><Review id="street/name" />
    </section>
    <section className="bag-task"><h3>C. Whose Bag?</h3>
      <p>Во второй части видео найди владельцев двух сумок.</p>
      <div className="bag-fields">{select('owner/a','Bag A')}{select('owner/b','Bag B')}</div><Review id="street/owner" />
    </section>
    <section className="bag-task"><h3>D. Who Has What?</h3>
      <p>Сопоставь шесть утверждений с участниками. При необходимости читай утверждения на странице 14.</p>
      <div className="bag-fields">{statements.map((statement, i) => select('statement/' + i, (i + 1) + (statement ? '. ' + statement : '')))}</div>
      <Review id="street/statement" />
    </section>
    <section className="bag-task"><h3>E. Watch and Check</h3>
      <p>Пересмотри интервью и сверь свои ответы с преподавателем.</p>
      {read('street/done') === true && <p>Просмотр проверен.</p>}
      <Review id="street/done" doneKey="street/done" answers={teacher && setup('verified-key') ? <p className="bag-pre">{setup('verified-key')}</p> : 'Проверьте ответы непосредственно по оригинальной записи.'} />
    </section>
  </>;
}
