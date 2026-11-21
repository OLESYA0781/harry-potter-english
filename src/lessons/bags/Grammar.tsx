import { assetUrl } from '../../assetUrl';
import { Character } from '../../Art';
import { Practice, Reminder, Sort, Written } from './Activities';
import { articlePractice, havePractice, mixedGrammar, pluralPractice, rules } from './data';
import type { BagItem, Prompt } from './data';
import { Items } from './SpeakingWriting';

const pluralImages: Record<number, readonly BagItem[]> = {
  9:[['sandwich',4]],
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
    <section className="bag-task"><h3>4A. A / An / Have / Has</h3>
      <Reminder rule={rules.articles} id="mixed-rule-a" />
      <Reminder rule={rules.have} id="mixed-rule-h" />
      <p>Заполни пропуски. Если в строке несколько пропусков, напиши слова по порядку через пробел.</p>
      <Written id="mixed-grammar" prompts={mixedGrammar} />
      <p>Далее открой Grammar Bank Challenge, чтобы повторить правила.</p>
    </section>
  </Practice>;
}
const picturePrompts: readonly Prompt[] = [
  ['1. I have… · bag','I have two bags.'],
  ['2. I have… · umbrella','I have an umbrella.'],
  ['3. I have… · sandwich','I have two sandwiches.'],
  ['4. I have… · laptop','I have a laptop.'],
  ['5. My city has… · museum','My city has a museum.'],
  ['6. My city has… · restaurant','My city has two restaurants.'],
  ['7. My city has… · theatre','My city has a theatre.'],
  ['8. My city has… · school','My city has three schools.'],
];
function Buildings({ cell, count }: { cell: number; count: number }) {
  return <div className="bag-items" role="img" aria-label={`Количество зданий: ${count}`}>
    {Array.from({ length: count }, (_, i) => <span key={i} className="bag-picture bag-building"
      style={{ backgroundImage: `url(${assetUrl('/art/lesson-2/quest/buildings.webp')})`,
        backgroundPosition: `${cell % 3 * 50}% ${Math.floor(cell / 3) * 100}%` }} />)}
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
      <p>Посчитай объекты на иллюстрациях и напиши полные предложения. Картинки созданы для этой версии урока.</p>
      <p><strong>Пример:</strong> I have two bags.</p>
      <Written id="bank-pictures" prompts={picturePrompts} illustrations={[
        <Items items={[['bag',2]]} />, <Items items={[['umbrella',1]]} />,
        <Items items={[['sandwich',2]]} />, <Items items={[['laptop',1]]} />,
        <Buildings count={1} cell={2} />, <Buildings count={2} cell={1} />,
        <Buildings count={1} cell={4} />, <Buildings count={3} cell={5} />,
      ]} />
    </section>
  </>;
}
