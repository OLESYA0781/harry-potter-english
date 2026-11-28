import { lazy, Suspense, useEffect, useState } from 'react';
import type { LessonProps } from '../types';
import LostBagLesson from '../lostBag/LostBagLesson';
import { blocks } from './data';
import type { BlockId } from './data';
import { key, lessonFourSummary } from './model';
import { BookContext } from './Controls';
import Countries from './Countries';
import Hello from './Hello';
import Reading from './Reading';
import Adjectives from './Adjectives';
import Grammar from './Grammar';
import Speaking from './Speaking';
import './countries.css';
const TeacherAnswers=lazy(()=>import('./TeacherAnswers'));
const components={countries:Countries,hello:Hello,reading:Reading,adjectives:Adjectives,grammar:Grammar,speaking:Speaking};
const sourceLabels:Record<string,string>={countries:'Vocabulary Bank · page 125',hello:'Student’s Book · page 8 · Grammar Bank page 92',reading:'Student’s Book · page 19',adjectives:'Vocabulary Bank · page 127',grammar:'Student’s Book · page 19 · Grammar Bank page 96',speaking:'Student’s Book · page 19 · Student A page 140 · Student B page 143'};
export default function LessonFour(props:LessonProps){
 const {state,setState,canTeach=false}=props;
 const [requested,setRequested]=useState(false);const teacher=canTeach&&requested;
 useEffect(()=>{if(!canTeach)setRequested(false);},[canTeach]);
 const read=(id:string)=>state.answers[key(id)];
 const write=(patch:Record<string,string|number|boolean>)=>setState(previous=>({...previous,answers:{...previous.answers,...Object.fromEntries(Object.entries(patch).map(([id,value])=>[key(id),value]))}}));
 const active=blocks.find(block=>block.id===read('ui/block'))??blocks[0];
 const index=blocks.indexOf(active),summary=lessonFourSummary(state);
 const go=(block:BlockId)=>{write({'ui/block':block});window.scrollTo({top:0});};
 const Activity=active.id in components?components[active.id as keyof typeof components]:null;
 return <div className="l4-course"><header className="l4-overview" id="l4-blocks"><p className="l4-course-title">Lesson 4 — Countries, Nationalities and People</p><p>Speakout Third Edition A1 Student’s Book</p>
  <div className="l4-mobile-nav"><label>Choose a block<select aria-label="Choose Lesson 4 block" value={active.id} onChange={e=>go(e.target.value as BlockId)}>{blocks.map((block,i)=><option key={block.id} value={block.id}>Block {i+1}. {block.title}</option>)}</select></label></div>
  <nav aria-label="Lesson 4 blocks">{blocks.map((block,i)=><button type="button" key={block.id} aria-current={active.id===block.id?'step':undefined} aria-pressed={active.id===block.id} onClick={()=>go(block.id)}><span>Block {i+1}</span>{block.title}</button>)}</nav>
 </header>
 {active.id==='warmup'?<LostBagLesson {...props}/>:<BookContext.Provider value={{read,write,go,teacher}}><main className="ct-main"><header className="ct-heading"><div><p>Block {index+1} · {sourceLabels[active.id]}</p><h1>{active.title}</h1></div>{canTeach&&<button type="button" className="teacher-toggle" aria-pressed={teacher} onClick={()=>setRequested(value=>!value)}>{teacher?'Exit teacher mode':'Teacher mode'}</button>}</header>
  <p className="ct-progress">{summary.detail}</p>
  {Activity&&<Activity/>}
  {teacher&&<Suspense fallback={<p>Loading teacher notes…</p>}><TeacherAnswers block={active.id}/></Suspense>}
  <div className="ct-block-controls"><button type="button" onClick={()=>go(blocks[index-1].id)}>← Block {index}</button><button type="button" onClick={()=>document.getElementById('l4-blocks')?.scrollIntoView({block:'start'})}>Back to blocks</button>{index<blocks.length-1&&<button type="button" onClick={()=>go(blocks[index+1].id)}>Block {index+2} →</button>}</div>
 </main></BookContext.Provider>}
 </div>;
}
