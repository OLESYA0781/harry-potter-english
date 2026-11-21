import { createContext, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArtIcon } from '../../Art';
import { assetUrl } from '../../assetUrl';
import { objects } from './data';
import type { ObjectWord, Prompt, Rule } from './data';

export type BagStore = {
  teacher: boolean;
  read: (key: string) => unknown;
  write: (values: Record<string, unknown>) => void;
  reset: (key: string) => void;
};
export const BagContext = createContext<BagStore | null>(null);
export function useBag() { return useContext(BagContext)!; }
export const normalize = (text: string) => text.toLowerCase().trim().replace(/[.!?]+$/, '').replace(/’/g, "'").replace(/\s+/g, ' ');
function matchingSentence(draft: string, answer: string) {
  const numbers: Record<string, string> = { '2': 'two', '3': 'three' };
  const typed = normalize(draft).replace(/\b[23]\b/g, number => numbers[number]);
  const expected = normalize(answer);
  return typed === expected || expected.endsWith('a phone') && typed === expected.replace('a phone', 'a mobile phone');
}

export function Picture({ word, cell }: { word?: ObjectWord; cell?: number }) {
  const art = cell ?? objects.find(item => item[0] === word)?.[2] ?? word;
  if (typeof art === 'number') return <span className="bag-picture bag-atlas" aria-hidden="true" style={{
    backgroundImage: `url(${assetUrl('/art/lesson-3/bag-objects.webp')})`,
    backgroundPosition: `${(art % 3) * 50}% ${Math.floor(art / 3) * 50}%`,
  }} />;
  if (art === 'key') return <img className="bag-picture" alt="" src={assetUrl('/art/lesson-2/quest/key.webp')} />;
  return <ArtIcon className="bag-picture" name={art ?? 'bag'} />;
}

export function Review({ id, answers, children, doneKey }: {
  id: string; answers?: ReactNode; children?: ReactNode; doneKey?: string;
}) {
  const { teacher, reset, write, read } = useBag();
  if (!teacher) return null;
  return <details className="bag-review">
    <summary>Teacher’s Mode{read(doneKey ?? id + '/done') === true ? ' · подтверждено' : ''}</summary>
    {answers && <div>{answers}</div>}
    {children}
    <div className="bag-row">
      {doneKey && <button type="button" onClick={() => write({ [doneKey]: read(doneKey) !== true })}>
        {read(doneKey) === true ? 'Снять подтверждение' : 'Подтвердить выполнение'}
      </button>}
      <button type="button" onClick={() => reset(id)}>Сбросить это задание</button>
    </div>
  </details>;
}

export function Written({ id, prompts, illustrations }: {
  id: string; prompts: readonly Prompt[]; illustrations?: readonly ReactNode[];
}) {
  const { read, write, teacher } = useBag();
  const drafts = prompts.map((_, i) => String(read(id + '/' + i) ?? ''));
  const matches = prompts.map(([, answer], i) => matchingSentence(drafts[i], answer));
  const checked = read(id + '/checked') === true;
  return <div className="bag-task">
    <form onSubmit={event => {
      event.preventDefault();
      write({ [id + '/checked']: true, [id + '/done']: matches.every(Boolean) });
    }}>
      <ol className="bag-input-list">{prompts.map(([prompt], i) => <li key={prompt}>
        {illustrations?.[i]}
        <label>{prompt}<input required value={drafts[i]} autoComplete="off" spellCheck={false}
          onChange={event => write({ [id + '/' + i]: event.target.value, [id + '/checked']: false, [id + '/done']: false })} /></label>
        {checked && <small>{matches[i] ? 'Верно' : 'Попробуй ещё раз'}</small>}
      </li>)}</ol>
      <button>Проверить</button>
      {checked && <p role="status">Верно {matches.filter(Boolean).length} из {prompts.length}.</p>}
    </form>
    <Review id={id} answers={<ol>{prompts.map(([prompt, answer]) => <li key={prompt}>{answer}</li>)}</ol>}>
      {teacher && <button type="button" onClick={() => write(Object.fromEntries(prompts.flatMap(([, answer], i) =>
        matches[i] ? [] : [[id + '/' + i, answer], [id + '/checked', false], [id + '/done', false]])))}>Исправить ответы по ключу</button>}
    </Review>
  </div>;
}

export function Sort({ id, cards, targets, instruction }: {
  id: string;
  cards: readonly { id: string; label: ReactNode; target: string; name?: string }[];
  targets: readonly { id: string; label: ReactNode; name?: string }[];
  instruction: string;
}) {
  const { read, write } = useBag();
  const [selected, select] = useState('');
  const placements = cards.map(card => String(read(id + '/' + card.id) ?? ''));
  const checked = read(id + '/checked') === true;
  const place = (cardId: string, target: string) => {
    if (!cards.some(card => card.id === cardId)) return;
    write({ [id + '/' + cardId]: target, [id + '/checked']: false, [id + '/done']: false, ...(id === 'same' ? { 'same-speaking': false } : {}) });
    select('');
  };
  const cardButton = (card: typeof cards[number]) => <button key={card.id} type="button" draggable
    aria-pressed={card.id === selected} aria-label={card.name}
    onDragStart={event => { event.dataTransfer.setData('text/plain', card.id); select(card.id); }}
    onClick={() => select(selected === card.id ? '' : card.id)}>{card.label}</button>;
  const count = cards.filter((card, i) => card.target === placements[i]).length;
  return <div className="bag-task">
    <p>{instruction} Перетащи карточку или сначала нажми на неё, затем на нужное место.</p>
    <div className="bag-row bag-bank" aria-label="Карточки">{cards.filter((_, i) => !placements[i]).map(cardButton)}</div>
    <div className="bag-targets">{targets.map(target => <div key={target.id} className="bag-target"
      onDragOver={event => event.preventDefault()}
      onDrop={event => { event.preventDefault(); place(event.dataTransfer.getData('text/plain'), target.id); }}>
      <button type="button" className="bag-destination" aria-label={target.name} onClick={() => place(selected, target.id)}>{target.label}</button>
      <div className="bag-row">{cards.filter((_, i) => placements[i] === target.id).map(cardButton)}</div>
    </div>)}</div>
    <button type="button" disabled={placements.some(value => !value)} onClick={() => write({
      [id + '/checked']: true, [id + '/done']: count === cards.length,
    })}>Проверить</button>
    {checked && <p role="status">Верно {count} из {cards.length}.</p>}
    <Review id={id} answers={<ul>{cards.map(card => <li key={card.id}>{card.label} → {targets.find(target => target.id === card.target)?.label}</li>)}</ul>}>
      <button onClick={() => write({ ...Object.fromEntries(cards.map(card => [id + '/' + card.id, card.target])), [id + '/checked']: false, [id + '/done']: false })}>Исправить по ключу</button>
    </Review>
  </div>;
}

export function GrammarExplanationCard({ rule, id, onStart }: { rule: Rule; id: string; onStart: () => void }) {
  const [checked, setChecked] = useState(false);
  const { read, write } = useBag();
  return <section className="bag-explanation" aria-label={rule.title}>
    <p><strong>What are we learning?</strong></p>
    <h3>{rule.title}</h3>
    <p>{rule.rule}</p>
    <table><thead><tr>{rule.columns.map(column => <th key={column}>{column}</th>)}</tr></thead>
      <tbody>{rule.rows.map(([left, right]) => <tr key={left}><td>{left}</td><td>{right}</td></tr>)}</tbody>
    </table>
    <div className="bag-examples"><Picture word="notebook" /><div><strong>Examples</strong>
      <ul>{rule.examples.map(([example, translation]) => <li key={example}><span lang="en">{example}</span> — {translation}</li>)}</ul>
    </div></div>
    <p className="bag-remember"><strong>Remember!</strong> {rule.remember}</p>
    <details><summary>Quick Check</summary>
      {rule.quick.map(([prompt], index) => <label className="bag-quick" key={prompt}>{prompt}
        <input value={String(read(id + '/quick/' + index) ?? '')} onChange={event => {
          setChecked(false); write({ [id + '/quick/' + index]: event.target.value });
        }} />
        {checked && <small>{normalize(String(read(id + '/quick/' + index) ?? '')) === rule.quick[index][1] ? 'Верно' : 'Попробуй снова'}</small>}
      </label>)}
      <button type="button" onClick={() => setChecked(true)}>Проверить</button>
      <Review id={id + '/quick'} answers={rule.quick.map(([, answer]) => answer).join(' · ')} />
    </details>
    <button type="button" onClick={onStart}>Понятно, перейти к заданию{rule.start ? ` · ${rule.start}` : ''}</button>
  </section>;
}

export function Practice({ rule, id, children }: { rule: Rule; id: string; children: ReactNode }) {
  const target = useRef<HTMLDivElement>(null);
  return <>
    <GrammarExplanationCard rule={rule} id={id} onStart={() => {
      target.current?.focus({ preventScroll: true }); target.current?.scrollIntoView({ block: 'start' });
    }} />
    <div className="bag-practice" ref={target} tabIndex={-1}>{children}</div>
  </>;
}

export function Reminder({ rule, id }: { rule: Rule; id: string }) {
  const explanation = useRef<HTMLDetailsElement>(null);
  return <div className="bag-remember"><p><strong>Remember the Rule</strong> {rule.remember}</p>
    <details ref={explanation}><summary>Полное объяснение</summary>
      <GrammarExplanationCard id={id} rule={rule} onStart={() => { if (explanation.current) explanation.current.open = false; }} />
    </details>
  </div>;
}

export function Oral({ id, title, instruction, model, children }: {
  id: string; title: string; instruction: ReactNode; model: ReactNode; children?: ReactNode;
}) {
  const { read } = useBag();
  return <section className="bag-task"><h3>{title}</h3><p>{instruction}</p>{children}
    {read(id) === true && <p role="status">Преподаватель подтвердил выполнение.</p>}
    <Review id={id} doneKey={id} answers={model} />
  </section>;
}
