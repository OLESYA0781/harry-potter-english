import { useState } from 'react';
import { Feather, MailOpen, Sparkles } from 'lucide-react';
import './magicalLetter.css';

function OwlStamp() {
  return <svg viewBox="0 0 80 80" aria-hidden="true" focusable="false"><path d="M17 26L16 10L31 20Q40 15 49 20L64 10L63 26Q72 58 52 67H28Q8 58 17 26Z" fill="#9a7652" /><path d="M27 40Q15 49 22 62M53 40Q65 49 58 62" fill="none" stroke="#75563e" strokeWidth="8" strokeLinecap="round" /><ellipse cx="40" cy="52" rx="16" ry="17" fill="#edd7ac" /><circle cx="28" cy="33" r="14" fill="#fff5d9" /><circle cx="52" cy="33" r="14" fill="#fff5d9" /><circle cx="29" cy="34" r="7" fill="#294d41" /><circle cx="51" cy="34" r="7" fill="#294d41" /><circle cx="31" cy="31" r="2.5" fill="white" /><circle cx="53" cy="31" r="2.5" fill="white" /><path d="M35 43L40 50L45 43" fill="#d5a144" /><path d="M31 70V65M49 70V65" stroke="#bc8b3b" strokeWidth="5" strokeLinecap="round" /><rect x="24" y="52" width="32" height="20" rx="4" fill="#f9efcc" stroke="#bd9e61" strokeWidth="2" /><path d="M25 54L40 63L55 54" fill="none" stroke="#bd9e61" strokeWidth="2" /></svg>;
}

/** Opening is a local presentation effect, never a saved task or score. */
export default function MagicalLetter({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return <div className={`magic-letter-scene ${open ? 'letter-is-open' : ''}`}>
    <div className="letter-postal-header"><span><Sparkles size={18} aria-hidden="true" /> Owl Post</span><span className="letter-from">От Гермионы · Для Вики</span></div>
    {!open && <div className="letter-envelope" aria-hidden="true"><div className="letter-envelope-flap" /><div className="letter-envelope-front" /><div className="letter-envelope-seal">✦</div><span className="letter-envelope-star star-left">✧</span><span className="letter-envelope-star star-right">✦</span></div>}
    <button className="letter-open-button" aria-expanded={open} aria-controls="hermione-letter" onClick={() => setOpen(previous => !previous)}><MailOpen size={22} aria-hidden="true" />{open ? 'Свернуть письмо' : 'Открыть письмо'}<Sparkles size={18} aria-hidden="true" /></button>
    <div id="hermione-letter" hidden={!open} className="magic-letter-card">
      <div className="magic-letter-top" aria-hidden="true"><span className="letter-quill"><Feather size={27} /></span><span className="letter-rule" /><span className="letter-owl-stamp"><OwlStamp /></span></div>
      <article className="magic-letter-text" aria-label="Hermione’s letter" lang="en">{text.split('\n\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}</article>
      <div className="magic-letter-bottom" aria-hidden="true"><span className="letter-rule" /><span className="letter-small-seal">✦</span></div>
    </div>
  </div>;
}
