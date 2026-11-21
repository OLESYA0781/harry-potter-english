import { assetUrl } from '../../assetUrl';
import { Character } from '../../Art';
import { Practice, Reminder, Sort, Written } from './Activities';
import { articlePractice, havePractice, pluralPractice, rules } from './data';
import type { BagItem, Prompt } from './data';
import { Items } from './SpeakingWriting';

const pluralImages: Record<number, readonly BagItem[]> = {
  0:[['book',2]], 1:[['mobile phone',4]], 2:[['key',3]], 4:[['sandwich',3]],
};
const haveImages: readonly (readonly BagItem[])[] = [
  [['umbrella',1]], [['book',2]], [['mobile phone',1]], [['key',3]], [['banana',1]],
  [['notebook',1]], [['sandwich',2]], [['laptop',1]],
];
function ArticleSort({ id }: { id: string }) {
  return <div className="bag-article-baskets"><Sort id={id} instruction="Распредели слова и словосочетания по корзинам A и AN."
    cards={articlePractice.map(([word, answer]) => ({ id:word, label:word, target:answer }))}
    targets={[{ id:'a', label:'A' },{ id:'an', label:'AN' }]} /></div>;
}
function Plurals({ id }: { id: string }) {
  return <Written id={id} prompts={pluralPractice} illustrations={pluralPractice.map((_, index) =>
    pluralImages[index] ? <Items items={pluralImages[index]} /> : null)} />;
}
export function Articles() {
  return <Practice rule={rules.articles} id="article-rule"><ArticleSort id="articles" /></Practice>;
}
export function Plural() {
  return <Practice rule={rules.plural} id="plural-rule"><p>Напиши только форму множественного числа.</p><Plurals id="plural" /></Practice>;
}
export function Have() {
  return <Practice rule={rules.have} id="have-rule"><p>Напиши полные предложения.</p>
    <Written id="have" prompts={havePractice} illustrations={haveImages.map((items, index) => <div className="bag-person-items" key={index}>
      {index === 0 && <img alt="Emma" src={assetUrl('/art/lesson-2/homework/artist.webp')} />}
      {index === 1 && <Character name="Harry" />}
      <Items items={items} />
    </div>)} />
  </Practice>;
}
const picturePrompts: readonly Prompt[] = [
  ['I have… · 1 umbrella','I have an umbrella.'],
  ['I have… · 2 sandwiches','I have two sandwiches.'],
  ['My city has… · 1 museum','My city has a museum.'],
  ['My city has… · 2 restaurants','My city has two restaurants.'],
];
function Buildings({ cell, count }: { cell: number; count: number }) {
  return <div className="bag-items" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => <span key={i} className="bag-picture bag-building"
      style={{ backgroundImage: `url(${assetUrl('/art/lesson-2/quest/buildings.webp')})`, backgroundPosition: `${cell * 50}% 0` }} />)}
  </div>;
}
export function GrammarBank() {
  return <>
    <section className="bag-task"><h3>Round 1. A or An?</h3>
      <Reminder rule={rules.articles} id="bank-rule-a" /><ArticleSort id="bank-a" />
    </section>
    <section className="bag-task"><h3>Round 2. Singular and Plural Nouns</h3>
      <Reminder rule={rules.plural} id="bank-rule-p" /><Plurals id="bank-p" />
    </section>
    <section className="bag-task"><h3>Round 3. I have… / My city has…</h3>
      <Reminder rule={rules.have} id="bank-rule-h" />
      <Reminder rule={rules.articles} id="bank-rule-picture-a" />
      <Reminder rule={rules.plural} id="bank-rule-picture-p" />
      <Written id="bank-pictures" prompts={picturePrompts} illustrations={[
        <Items items={[['umbrella',1]]} />, <Items items={[['sandwich',2]]} />,
        <Buildings count={1} cell={2} />, <Buildings count={2} cell={1} />,
      ]} />
    </section>
  </>;
}
