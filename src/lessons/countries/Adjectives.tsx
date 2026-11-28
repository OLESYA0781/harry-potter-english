import { useState } from 'react';
import { assetUrl } from '../../assetUrl';
import { adjectives, pictureLetters } from './data';
import { Audio, Done, Exercise, Select, useBook } from './Controls';
export default function Adjectives(){
 const [selected,setSelected]=useState('');const {write}=useBook();
 return <>
  <Exercise id="p127-1a" number="1A" instruction="Match the adjectives (1–11) with the pictures (A–K).">
   <div className="ct-adjective-pictures">{pictureLetters.map(letter=><button type="button" key={letter} aria-label={`Picture ${letter}`} aria-pressed={selected===letter} onClick={()=>setSelected(value=>value===letter?'':letter)}><img src={assetUrl(`/art/lesson-4/textbook/p127-${letter.toLowerCase()}.webp`)} alt="" loading="lazy"/><span>{letter}</span></button>)}</div>
   <p className="ct-control-note">Choose a picture and place it next to an adjective, or choose its letter from the list.</p>
   <ol className="ct-numbered ct-adjective-matches">{adjectives.map((adjective,i)=><li key={adjective}><label>{i+1}. {adjective}<Select id={`p127/1a/${i+1}`} label={`Page 127, Exercise 1A, ${i+1}: ${adjective}`} options={pictureLetters}/></label><button type="button" aria-label={`Place picture for ${adjective}`} disabled={!selected} onClick={()=>{write({[`p127/1a/${i+1}`]:selected});setSelected('');}}>Place {selected||'picture'}</button></li>)}</ol>
  </Exercise>
  <Exercise id="p127-1b" number="1B" instruction="Look at the pictures again. Listen and repeat."><Audio track="VB2.01"/><Done id="p127/1b/done"/></Exercise>
  <Exercise id="p127-1c" number="1C" instruction="Work in pairs and test each other. Then swap roles."><ol><li>Student A: Point to a picture in Ex 1A. Student B: Say the word or words.</li><li>Student A: Say one word in a word pair. Student B: Say the other word.</li></ol><Done id="p127/1c/done" label="Done with my teacher"/></Exercise>
  <Exercise id="p127-1d" number="1D" instruction="Work in pairs. Student A: Choose an adjective from Ex 1A and say a noun that goes with it. Student B: Guess the adjective and say the phrase."><p>A: a coffee</p><p>B: a hot coffee</p><Done id="p127/1d/done" label="Done with my teacher"/></Exercise>
 </>;
}
