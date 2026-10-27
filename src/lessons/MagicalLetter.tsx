import './magicalLetter.css';

/** Decorative artwork never contains or overlaps the selectable letter text. */
export default function MagicalLetter({ text }: { text: string }) {
  return <div className="magic-letter-scene">
    <div className="magic-letter-scroll"><div className="magic-letter-decoration" aria-hidden="true" />
      <div className="magic-letter-cap magic-letter-top" aria-hidden="true" />
      <article className="magic-letter-text" aria-label="Hermione’s letter" lang="en">
        {text.split('\n\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      </article>
      <div className="magic-letter-cap magic-letter-bottom" aria-hidden="true" />
    </div>
    <span className="magic-letter-spark spark-one" aria-hidden="true">✦</span>
    <span className="magic-letter-spark spark-two" aria-hidden="true">✧</span>
    <span className="magic-letter-spark spark-three" aria-hidden="true">✦</span>
  </div>;
}
