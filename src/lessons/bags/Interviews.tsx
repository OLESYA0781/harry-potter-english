import { useEffect, useState } from 'react';
import { Review, useBag } from './Activities';

const letters = 'ABCDEFGHI'.split('');
const printedNames = ['William', 'Rachel', 'Chris', 'Sharon', 'Ian', 'Simnit', 'Beba', 'Lajan', 'Tom'];
const statements = [
  'A phone and a wallet.',
  'A bottle of water, a purse and keys.',
  'A laptop and two books.',
  'An umbrella, a mobile phone and a purse.',
  'A bottle of water, a notebook and a banana.',
  'A sandwich.',
];

export default function Interviews() {
  const { read, write, teacher } = useBag();
  const draft = (key: string) => String(read('street/' + key) ?? '');
  const save = (key: string, value: string) => write({ ['street/' + key]: value, 'street/done': false });
  const key = String(read('street-setup/verified-key') ?? '');
  const [video, setVideo] = useState('');
  useEffect(() => () => { if (video) URL.revokeObjectURL(video); }, [video]);
  const select = (key: string, label: string, choices = letters) => <label key={key}>{label}
    <select aria-label={label} value={draft(key)} onChange={event => save(key, event.target.value)}>
      <option value="">—</option>{choices.map(choice => <option key={choice}>{choice}</option>)}
    </select>
  </label>;
  return <>
    <section className="bag-task">
      <p>Для заданий ниже посмотри оригинальное интервью Speakout 1D с преподавателем. Буквы A–I обозначают людей на фотографиях на странице 14.</p>
      {video && <video className="bag-video" controls src={video} aria-label="Оригинальное интервью" />}
      <Review id="street-setup">
        <label>Открыть оригинальное видео с компьютера
          <input type="file" accept="video/*" onChange={event => {
            const file = event.target.files?.[0];
            setVideo(file ? URL.createObjectURL(file) : '');
          }} />
        </label>
        <label>Ключ, сверенный по оригинальной записи
          <textarea rows={4} value={key}
            onChange={event => write({ 'street-setup/verified-key': event.target.value, 'street/done': false })} />
        </label>
      </Review>
    </section>
    <section className="bag-task"><h3>A. Who Speaks First?</h3>
      <p>Смотри первую часть. Расположи A–I по порядку появления. Первые два уже известны: 1 — H, 2 — A.</p>
      <div className="bag-fields">{Array.from({ length: 7 }, (_, i) => select('order/' + i, String(i + 3),
        letters.filter(letter => letter !== 'H' && letter !== 'A' &&
          (letter === draft('order/' + i) || !Array.from({ length: 7 }, (_, n) => draft('order/' + n)).includes(letter)))))}</div>
      <Review id="street/order" answers="Известные соответствия: 1 — H, 2 — A." />
    </section>
    <section className="bag-task"><h3>B. Name Detective</h3>
      <p>Посмотри первую часть ещё раз. Исправь четыре имени. Остальные поля оставь пустыми.</p>
      <div className="bag-fields">{printedNames.map(name => <label key={name}>{name}
        <input aria-label={`Исправление: ${name}`} value={draft('printed-name/' + name)}
          onChange={event => save('printed-name/' + name, event.target.value)} />
      </label>)}</div><Review id="street/printed-name" />
    </section>
    <section className="bag-task"><h3>C. Whose Bag?</h3>
      <p>Во второй части видео найди владельцев сумок A и B, изображённых на странице 14.</p>
      <div className="bag-fields">{select('owner/a','Bag A')}{select('owner/b','Bag B')}</div><Review id="street/owner" />
    </section>
    <section className="bag-task"><h3>D. Who Has What?</h3>
      <p>Сопоставь описания содержимого с участниками второй части видео.</p>
      <div className="bag-fields">{statements.map((statement, i) => select('statement/' + i, `${i + 1}. ${statement}`))}</div>
      <Review id="street/statement" />
    </section>
    <section className="bag-task"><h3>E. Watch and Check</h3>
      <p>Пересмотри интервью и сверь свои ответы с преподавателем.</p>
      {read('street/done') === true && <p>Просмотр проверен.</p>}
      <Review id="street/done" doneKey="street/done"
        answers={teacher && key ? <p className="bag-pre">{key}</p> : 'Порядок, исправления имён и владельцев сумок сверяйте по оригинальной записи.'} />
    </section>
  </>;
}
