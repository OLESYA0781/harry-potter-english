import { useState } from 'react';
import { countryRows } from './data';
import { useBook } from './Controls';

/** Manual character ranges mark a syllable without guessing pronunciation,
 * grading spelling or disclosing nationalities not entered by the learner. */
export default function Stress(){
 const {read,write}=useBook();const [country,setCountry]=useState(countryRows[0].id),[kind,setKind]=useState<'country'|'nationality'>('country');
 const row=countryRows.find(row=>row.id===country)!;
 const draft=read('p125/1a/'+row.id);
 const word=kind==='country'?row.country:row.given??(typeof draft==='string'?draft:'');
 const id=`p125/1b/stress/${row.id}/${kind}`;
 const from=typeof read(id+'/from')==='number'?Math.min(Number(read(id+'/from')),Math.max(word.length-1,0)):0;
 const to=typeof read(id+'/to')==='number'?Math.min(Number(read(id+'/to')),Math.max(word.length-1,0)):from;
 const marked=typeof read(id+'/from')==='number'&&typeof read(id+'/to')==='number';
 return <div className="ct-stress">
  <label>Country<select aria-label="Stress: country" value={country} onChange={e=>setCountry(e.target.value)}>{countryRows.map(row=><option key={row.id} value={row.id}>{row.country}</option>)}</select></label>
  <label>Word<select aria-label="Stress: word" value={kind} onChange={e=>setKind(e.target.value as typeof kind)}><option value="country">Country</option><option value="nationality">Nationality</option></select></label>
  {word?<><p className="ct-stress-word">{marked?<>{word.slice(0,from)}<u>{word.slice(from,to+1)}</u>{word.slice(to+1)}</>:word}</p>
   <p>Choose the first and last letter of the stressed syllable to underline it.</p>
   <div className="ct-stress-controls"><label>First letter<select aria-label="Stress: first letter" value={from} onChange={e=>{const n=Number(e.target.value);write({[id+'/from']:n,[id+'/to']:Math.max(n,to)});}}>{[...word].map((letter,i)=><option value={i} key={i}>{i+1} · {letter}</option>)}</select></label>
   <label>Last letter<select aria-label="Stress: last letter" value={to} onChange={e=>write({[id+'/from']:from,[id+'/to']:Number(e.target.value)})}>{[...word].map((letter,i)=>i>=from&&<option value={i} key={i}>{i+1} · {letter}</option>)}</select></label>
   <button type="button" onClick={()=>write({[id+'/from']:'',[id+'/to']:''})}>Clear underline</button></div></>:<p>Complete this nationality in Exercise 1A first.</p>}
 </div>;
}
