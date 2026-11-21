import { Oral, Picture, Practice, Reminder, Review, Sort, Written, useBag } from './Activities';
import { emmaBag, finalBag, finalGrammar, harryBag, rules } from './data';
import type { BagItem, ObjectWord } from './data';

export function Items({ items }: { items: readonly BagItem[] }) {
  return <div className="bag-items">{items.map(([word, count], index) => <div className="bag-item" key={word} aria-label={`Предмет ${index + 1}, количество ${count}`} role="img">
    {Array.from({ length: count }, (_, i) => <Picture key={i} word={word} />)}
    {count > 1 && <strong>×{count}</strong>}
  </div>)}</div>;
}
function Bag({ owner, cell, items, hiddenItems = false }: { owner: string; cell: number; items: readonly BagItem[]; hiddenItems?: boolean }) {
  const { read, write } = useBag();
  const key = cell === 7 ? 'intro-a' : 'intro-b';
  const open = !hiddenItems || read(key) === true;
  return <article className="bag-display"><h3>{owner}</h3>
    {hiddenItems ? <button className="bag-image-button" aria-label={`Открыть ${owner}`} aria-expanded={open}
      onClick={() => write({ [key]: !open, ...(!open ? { [key + '-seen']: true } : {}) })}><Picture cell={cell} />{open ? 'Закрыть сумку' : 'Открыть сумку'}</button>
      : <Picture cell={cell} />}
    {open && <Items items={items} />}
  </article>;
}
export function Introduction() {
  return <><p>Открой обе сумки. Назови знакомые предметы и найди одинаковые вещи.</p>
    <div className="bag-pair">
      <Bag owner="Bag A — Emma" cell={7} items={emmaBag.slice(0, 3)} hiddenItems />
      <Bag owner="Bag B — Harry" cell={8} items={harryBag.slice(0, 3)} hiddenItems />
    </div>
    <Review id="intro-" answers="Общие предметы: a mobile phone, a notebook." />
  </>;
}

const emmaModel = 'Emma has a phone, a notebook, two pens, three keys and a book.';
const harryModel = 'Harry has a phone, a notebook, a banana, an umbrella and a wallet.';
const compared = ['umbrella', 'key', 'notebook', 'wallet', 'mobile phone', 'book', 'banana', 'pen'] as const;
const questions = [
  ['Узнай, есть ли у Эммы зонт.', "Does Emma have an umbrella? No, she doesn't."],
  ['Узнай, есть ли у Гарри две ручки.', "Does Harry have two pens? No, he doesn't."],
  ['Узнай, есть ли у Эммы телефон.', 'Does Emma have a phone? Yes, she does.'],
  ['Спроси, что находится в сумке Гарри.', `What does Harry have in his bag? ${harryModel}`],
];
export function Speaking() {
  const { read } = useBag();
  return <>
    <Reminder id="speaking-rule-have" rule={rules.have} />
    <Reminder id="speaking-rule-plural" rule={rules.plural} />
    <Reminder id="speaking-rule-articles" rule={rules.articles} />
    <div className="bag-pair">
      <Oral id="describe-a" title="A. Describe Bag A" instruction="Look at Emma’s bag. Tell your teacher what Emma has." model={emmaModel}>
        <Bag owner="Bag A — Emma" cell={7} items={emmaBag} />
      </Oral>
      <Oral id="describe-b" title="B. Describe Bag B" instruction="Look at Harry’s bag. Tell your teacher what Harry has." model={harryModel}>
        <Bag owner="Bag B — Harry" cell={8} items={harryBag} />
      </Oral>
    </div>
    <section className="bag-task"><h3>C. Find the Same Objects</h3>
      <Sort id="same" instruction="Помести общие предметы в Both Bags, а остальные — в One Bag."
        cards={compared.map(word => ({ id: word, label: <Picture word={word} />, name: word,
          target: word === 'notebook' || word === 'mobile phone' ? 'both' : 'one' }))}
        targets={[{ id:'both', label:'Both Bags' }, { id:'one', label:'One Bag' }]} />
      {read('same/done') === true && <Oral id="same-speaking" title="Say what they both have"
        instruction="Скажи одним предложением, какие предметы есть у обоих."
        model="Emma and Harry both have a phone and a notebook." />}
    </section>
    <Oral id="difference" title="D. Find the Differences"
      instruction="Скажи, какие предметы есть только у Эммы и какие только у Гарри."
      model={<><p>Emma has two pens, three keys and a book.</p><p>Harry has a banana, an umbrella and a wallet.</p></>} />
    <Practice id="questions-rule" rule={rules.questions}>
      <Oral id="questions-speaking" title="E. Ask the Teacher" instruction="Задай вопросы по этим подсказкам."
        model={<ol>{questions.map(([,answer]) => <li key={answer}>{answer}</li>)}</ol>}>
        <ol>{questions.map(([goal]) => <li key={goal}>{goal}</li>)}</ol>
      </Oral>
    </Practice>
  </>;
}

const firstMessages = [
  { id:'keys', label:'Hi Jim! I lost three keys at the park. Where can we meet?', target:'jim' },
  { id:'wallet', label:'Hi Evi! I found a black wallet. There’s a card and some money inside.', target:'evi' },
];
const posts = [
  { id:'evi', label:'Evi · LOST: I lost a small black wallet. It has a bank card and about five euros inside.' },
  { id:'jim', label:'Jim · FOUND: I found a set of three keys in the park.' },
];
const matches = [
  { id:'sam', label:'Sam: Hi! I found your green umbrella near the station.', target:'umbrella' },
  { id:'lee', label:'Lee: That blue notebook with my name inside is mine.', target:'notebook' },
  { id:'jo', label:'Jo: I found your phone on the bus. It has a red case.', target:'phone' },
];
const matchingPosts = [
  { id:'phone', label:'LOST · A phone in a red case. Left on the bus.' },
  { id:'notebook', label:'FOUND · A blue notebook with Lee’s name inside.' },
  { id:'umbrella', label:'LOST · A green umbrella near the station.' },
];
function Draft({ id, label, tip }: { id: 'post'|'message'; label: string; tip: string }) {
  const { teacher, read, write, reset } = useBag();
  const text = String(read(id + '/text') ?? '');
  const done = read(id + '-done') === true;
  return <div>
    <label>{label}<textarea rows={7} spellCheck={false} value={text} onChange={event =>
      write({ [id + '/text']: event.target.value, [id + '-done']: false })} /></label>
    <button disabled={!text.trim() || done} onClick={() => write({ [id + '-done']: true })}>{done ? 'Готово' : 'Отметить как готовое'}</button>
    {teacher && <details className="bag-review"><summary>Teacher’s Mode</summary>
      <p>{tip} Исправления можно внести прямо в поле.</p>
      <p className="bag-pre">{text || 'Ответ пока пуст.'}</p>
      <button type="button" onClick={() => reset(id)}>Сбросить это задание</button>
    </details>}
  </div>;
}
export function Writing() {
  const { read, write } = useBag();
  return <>
    <section className="bag-task bag-noticeboard"><h3>A. Read the Posts</h3>
      <Sort id="writing-first" instruction="Прочитай объявления и подбери личное сообщение к каждому."
        cards={firstMessages} targets={posts} />
    </section>
    <section className="bag-explanation"><h3>B. How to Write a Lost Post</h3>
      <ol><li><strong>LOST</strong> — назови потерянную вещь.</li>
        <li><strong>Description</strong> — опиши цвет, размер или примету.</li>
        <li><strong>Where and when</strong> — напиши, где и когда.</li>
        <li><strong>Contact</strong> — объясни, как с тобой связаться.</li></ol>
      <div className="bag-paper" lang="en"><strong>LOST</strong><p>A small blue notebook.<br />It has my name inside.<br />Lost in the park today.<br />Please PM me.<br />Thank you!</p></div>
      <p><strong>Lost</strong> — потеряно. <strong>Found</strong> — найдено. <strong>It has…</strong> — в нём есть… <strong>Please PM me</strong> — напишите мне личное сообщение.</p>
    </section>
    <section className="bag-task"><h3>C. Write Your Own Post</h3>
      <label>Предмет<select aria-label="Предмет" value={String(read('post/item') ?? '')} onChange={event =>
        write({ 'post/item': event.target.value, 'post-done': false })}>
        <option value="">Выбери предмет</option>{['umbrella','phone','wallet','notebook'].map(word => <option key={word}>{word}</option>)}
      </select></label>
      <Draft id="post" label="Твоё объявление" tip="Проверьте, что названы вещь, примета, место или время и способ связи." />
    </section>
    <section className="bag-explanation"><h3>D. How to Write a Private Message</h3>
      <p>Поздоровайся, скажи, что ты нашла, и попроси связаться с тобой.</p>
      <blockquote className="bag-paper" lang="en">Hi! I found your notebook. Please contact me.</blockquote>
      <p>Привет! Я нашла твой блокнот. Пожалуйста, свяжись со мной.</p>
      <Draft id="message" label="Твоё личное сообщение" tip="Проверьте приветствие, найденную вещь и просьбу связаться." />
    </section>
    <section className="bag-task bag-noticeboard"><h3>E. Match the Messages</h3>
      <Sort id="writing-match" instruction="Подбери сообщение к каждому объявлению." cards={matches} targets={matchingPosts} />
    </section>
  </>;
}
const finalWords = ['umbrella', 'wallet', 'bottle of water', 'notebook', 'banana'] as const;
export function Final() {
  const { read } = useBag();
  const done = ['final-vocab/done','final-grammar/done','final-speaking'].every(key => read(key) === true);
  return <>
    <section className="bag-task"><h3>Part 1 — Vocabulary</h3>
      <Written id="final-vocab" prompts={finalWords.map((word, i) => [`Предмет ${i + 1}`, word])}
        illustrations={finalWords.map(word => <Picture key={word} word={word as ObjectWord} />)} />
    </section>
    <section className="bag-task"><h3>Part 2 — Grammar</h3>
      <Reminder id="final-rule-a" rule={rules.articles} />
      <Reminder id="final-rule-p" rule={rules.plural} />
      <Reminder id="final-rule-h" rule={rules.have} />
      <Written id="final-grammar" prompts={finalGrammar} />
    </section>
    <Oral id="final-speaking" title="Part 3 — Speaking" instruction="Посмотри на новую сумку и опиши всё содержимое вслух."
      model="I have a laptop, two sandwiches, three keys and a bottle of water."><div className="bag-display"><Picture word="bag" /><Items items={finalBag} /></div></Oral>
    {done && <section className="bag-explanation" role="status"><h3>Mission Complete!</h3>
      <p>You can talk about objects, describe bags and write lost-and-found posts!</p></section>}
  </>;
}
