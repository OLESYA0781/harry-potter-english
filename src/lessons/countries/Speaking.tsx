import { useState } from 'react';
import { Done, Exercise, Field, useBook } from './Controls';
import { speakingInstruction } from './data';

export const speakingCards = {
 a: { page: 140, partner: 'B', names: 'Jamie, Mira, Keanu', ages: 'all 24', friends: 'Friends from university', nationality: 'British, German, Brazilian', now: 'London', example: 'A: They’re Jamie, Mira and …', ownExample: 'A: They’re Luana, Demi and me. Luana is …' },
 b: { page: 143, partner: 'A', names: 'Sam, Cathy, Pete', ages: '46, 25, 25', friends: 'Friends from work', nationality: 'British, Italian, Swiss', now: 'Italy', example: 'B: They’re Sam, Cathy and …', ownExample: 'B: They’re Mark, Beatrice and me. Mark is …' },
} as const;
export const speakingFields = [['names', 'Names'], ['ages', 'Ages'], ['nationality', 'Nationality'], ['now', 'Where are they now?']] as const;
export default function Speaking() {
 const { read, write } = useBook();
 const role = read('speaking/role') === 'b' ? 'b' : 'a';
 const card = speakingCards[role];
 // Cover state is transient: changing roles always starts with covered information.
 const [revealed, setRevealed] = useState<string | null>(null);
 const visible = revealed === role;
 const [coveredDraft,setCoveredDraft]=useState(false);
 return <>
  <Exercise id="p19-7" number="7" instruction={speakingInstruction}>
   <div className="ct-speaking-roles" role="group" aria-label="Choose your speaking card">
    {(['a','b'] as const).map(value => <button key={value} type="button" aria-pressed={role===value} onClick={()=>{setRevealed(null);setCoveredDraft(false);write({'speaking/role':value});}}>Student {value.toUpperCase()}</button>)}
   </div>
   <p>Only your card is shown. Your partner uses the other card.</p>
  </Exercise>
  <article className="ct-speaking-card" aria-label={`Student ${role.toUpperCase()} card`}>
   <p className="ct-source">Communication Bank · 2A speaking · page {card.page}</p>
   <h2>Student {role.toUpperCase()}</h2>
   <Exercise id="speaking-7a" number="7A" instruction={`Student ${role.toUpperCase()}. Look at the photo and the information about three of your friends.`}>
    <button type="button" aria-expanded={visible} onClick={()=>setRevealed(visible?null:role)}>{visible?'Cover the information':'Show the information'}</button>
    {visible && <dl className="ct-speaking-facts"><div><dt>Names:</dt><dd>{card.names}</dd></div><div><dt>Ages:</dt><dd>{card.ages}</dd></div><div><dt>Friends</dt><dd>{card.friends}</dd></div><div><dt>Nationality:</dt><dd>{card.nationality}</dd></div><div><dt>Where are they now?</dt><dd>{card.now}</dd></div></dl>}
   </Exercise>
   <Exercise id="speaking-7b" number="B" instruction={`Cover the information and tell Student ${card.partner} about the people.`}>
    <p className="ct-example">{card.example}</p><Done id={`speaking/${role}/7b/done`} label={`Student ${role.toUpperCase()}: speaking practice B complete`}/>
   </Exercise>
   <Exercise id="speaking-7c" number="C" instruction="Look at the photo of you and your friends. Choose one person to be you. Complete the information.">
    <button type="button" aria-expanded={!coveredDraft} onClick={()=>setCoveredDraft(value=>!value)}>{coveredDraft?'Show my information':'Cover my information'}</button>
    <div className="ct-speaking-fields" hidden={coveredDraft}>{speakingFields.map(([id,label])=><label key={id}><span>{label}{label.endsWith('?')?'':':'}</span><Field wide id={`speaking/${role}/7c/${id}`} label={`Student ${role.toUpperCase()}, Exercise 7C, ${label}`}/></label>)}</div>
   </Exercise>
   <Exercise id="speaking-7d" number="D" instruction={`Cover the information and tell Student ${card.partner} about the people.`}>
    <p className="ct-example">{card.ownExample}</p><Done id={`speaking/${role}/7d/done`} label={`Student ${role.toUpperCase()}: speaking practice D complete`}/>
   </Exercise>
  </article>
 </>;
}
