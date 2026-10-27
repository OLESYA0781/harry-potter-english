import { Feather, Sparkles } from 'lucide-react';
import './magicalLetter.css';

/** A light stationery card; every paragraph remains selectable HTML text. */
export default function MagicalLetter({ text }: { text: string }) {
  return <div className="magic-letter-scene">
    <div className="magic-letter-card">
      <div className="magic-letter-top" aria-hidden="true">
        <span className="letter-quill"><Feather size={27} /></span>
        <span className="letter-rule" />
        <Sparkles size={21} className="letter-stars" />
      </div>
      <article className="magic-letter-text" aria-label="Hermione’s letter" lang="en">
        {text.split('\n\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      </article>
      <div className="magic-letter-bottom" aria-hidden="true"><span className="letter-rule" /><span className="letter-small-seal">✦</span></div>
    </div>
  </div>;
}
