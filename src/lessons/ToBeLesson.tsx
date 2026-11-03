import { useEffect, useState } from 'react';
import type { LessonProps } from './types';
import ToBeDiagram from './toBe/ToBeDiagram';
import ToBeTheory from './toBe/Theory';
import {completeItems,mistakeItems,readingText,toBeStages,toBeBlocks,toBeBlockIndex,legacyPartTitles,affirmativeItems,shortAnswerItems,negativeItems,questionItems} from './toBe/data';
import type {SourceItem} from './toBe/data';
import './toBeLesson.css';
import { WhoIsThis, DescribeTown, FalseFacts, MagicTown } from './toBe/Speaking';

export default function ToBeLesson({state,setState,canTeach=false}:LessonProps) {
 const [teacherRequested,setTeacherRequested]=useState(false);
 const teacher=canTeach && teacherRequested;
 useEffect(()=>{if(!canTeach)setTeacherRequested(false);},[canTeach]);
 const sourceNote=(text:string)=>teacher?<div className="tb-source-note">{text}</div>:null;
 const activeIndex=toBeBlockIndex(state);
 const block=toBeBlocks[activeIndex];
 const theoryPart=block.parts.find(part=>[0,1,2,3,4,12].includes(part));
 useEffect(()=>{if(theoryPart!==undefined && state.answers[`seen:${theoryPart}`]!==true) setState(previous=>({...previous,answers:{...previous.answers,[`seen:${theoryPart}`]:true}}));},[theoryPart,state.answers,setState]);
 const save=(key:string,value:string|boolean)=>setState(previous=>({...previous,answers:{...previous.answers,[key]:value}}));
 const value=(key:string)=>typeof state.answers[key]==='string'?state.answers[key] as string:'';
 const navigate=(next:number)=>{const target=toBeBlocks[next];setState(previous=>({...previous,step:target.legacyStep,answers:{...previous.answers,toBeActiveBlock:target.id}}));window.scrollTo({top:0});};
 const field=(key:string,label:string,small=false)=><label className="tb-answer" key={key}><span id={`tb-label-${key}`}>{label}</span>{small?<input aria-labelledby={`tb-label-${key}`} value={value(key)} onChange={e=>save(key,e.target.value)} spellCheck={false} autoCorrect="off" autoCapitalize="off" />:<textarea aria-labelledby={`tb-label-${key}`} rows={3} value={value(key)} onChange={e=>save(key,e.target.value)} spellCheck={false} autoCorrect="off" autoCapitalize="off" />}</label>;
 const exercises=(prefix:string,items:SourceItem[],short=false)=><div className="tb-tasks">{items.map(item=><article className="tb-task" key={item.id}>{teacher && <small>{item.source}</small>}{!teacher && prefix==='short' && <small>{item.source.split(' · ').at(-1)}</small>}{field(`${prefix}:${item.id}`,item.text,short)}</article>)}</div>;
 const renderPart=(step:number)=><>
 {step===15 && <MagicTown state={state} teacher={teacher} save={save}/>}
 {step===16 && <WhoIsThis state={state} teacher={teacher} save={save}/>}
 {step===17 && <DescribeTown state={state} teacher={teacher} save={save}/>}
 {step===18 && <FalseFacts state={state} teacher={teacher} save={save}/>}
 {step===0 && <ToBeDiagram />}
 {[1,2,3,4,12].includes(step) && <ToBeTheory step={step} />}
 {step===5 && <><h2>Complete the sentences</h2><p>Вставь am, is или are.</p>{sourceNote('Голицынский: «Вставьте глагол to be в Present Simple».')}{exercises('complete',completeItems,true)}</>}
 {step===6 && <><h2>Make negative sentences</h2>{sourceNote('Авторское закрепление to be с лексикой Go Getter 3, стр. 5.')}<p>Перепиши каждое предложение с not.</p>{exercises('negative',negativeItems)}</>}
 {step===7 && <><h2>Make questions</h2>{sourceNote('Авторское закрепление to be с лексикой Go Getter 3, стр. 5.')}<p>Начни вопрос с Am, Is или Are.</p>{exercises('question',questionItems)}</>}
 {step===8 && <><h2>Correct the mistakes</h2><p>Find the mistake in each sentence. Write the correct sentence.</p><div className="tb-tasks">{mistakeItems.map((item,i)=><article className="tb-task" key={item.id}>{field(`mistake:${item.id}`,`${i+1}. ${item.text}`)}</article>)}</div></>}
 {step===9 && <><h2>Read and complete</h2>{sourceNote('Упражнение 157, № 20.')}<p>Вставьте глагол to be в Present Simple.</p><div className="tb-reading">{readingText.split('...').map((part,i)=><span key={i}>{i>0 && <input aria-label={`Пропуск ${i}`} value={value(`reading:${i-1}`)} onChange={e=>save(`reading:${i-1}`,e.target.value)} spellCheck={false} autoCorrect="off" autoCapitalize="off" />}{part}</span>)}</div></>}
 {step===13 && <><h2>Make affirmative sentences</h2><p>Напиши полное утвердительное предложение, заполнив пропуск.</p>{sourceNote('Авторское закрепление лексики Go Getter 3, стр. 4.')}{exercises('affirmative',affirmativeItems)}</>}
 {step===14 && <><h2>Write short answers</h2><p>Напиши краткий ответ по отметке «Да» или «Нет».</p>{sourceNote('Авторское закрепление лексики Go Getter 3, стр. 5.')}{exercises('short',shortAnswerItems)}</>}
 </>;
 return <div className="app-shell tb-shell"><aside className="sidebar tb-sidebar"><div className="brand"><span className="brand-icon">✦</span><span>HOGWARTS<small>THE MAGIC OF TO BE</small></span></div><div className="lesson-label">LESSON 0</div><nav aria-label="Lesson 0 stages">{toBeStages.map((title,i)=><button className={`nav-item ${activeIndex===i?'active':''}`} key={title} aria-current={activeIndex===i?'step':undefined} onClick={()=>navigate(i)}><span className="tb-stage-number">{i+1}</span><span>{title}</span></button>)}</nav></aside>
 <div className="main-shell"><div className="mobile-stage"><select aria-label="Choose Lesson 0 stage" value={activeIndex} onChange={e=>navigate(Number(e.target.value))}>{toBeStages.map((title,i)=><option value={i} key={title}>{i+1}. {title}</option>)}</select></div><main className="tb-main"><header className="tb-heading"><span>{String(activeIndex+1).padStart(2,'0')}</span><div><small>Lesson 0 · The Magic of To Be</small><h1>{block.title}</h1></div></header>
 <div>{canTeach && <button className={`teacher-toggle ${teacher?'enabled':''}`} aria-pressed={teacher} onClick={()=>setTeacherRequested(!teacherRequested)}>{teacher?'Exit teacher mode':'Teacher mode'}</button>}</div>
 <a className="tb-homework-link" href="#/homework/0">Hogwarts Homework — The Magic of To Be →</a>
 <section className="tb-panel" aria-label={block.title}>
 {block.parts.map(part=><section className="tb-part" aria-label={legacyPartTitles[part]} key={part}>{renderPart(part)}</section>)}
 </section><footer className="tb-paging"><button className="btn" disabled={activeIndex===0} onClick={()=>navigate(activeIndex-1)}>← Back</button><span>{activeIndex+1} / {toBeStages.length}</span><button className="btn" disabled={activeIndex===toBeBlocks.length-1} onClick={()=>navigate(activeIndex+1)}>Next →</button></footer></main></div></div>;
}
