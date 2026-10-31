import { useEffect } from 'react';
import type { LessonProps } from './types';
import ToBeDiagram from './toBe/ToBeDiagram';
import ToBeTheory from './toBe/Theory';
import {completeItems,mixedItems,mistakeItems,readingText,toBeStages,transformationItems} from './toBe/data';
import type {SourceItem} from './toBe/data';
import './toBeLesson.css';

export default function ToBeLesson({state,setState}:LessonProps) {
 const step=Math.min(Math.max(state.step,0),12);
 useEffect(()=>{if(state.answers[`seen:${step}`]!==true) setState(previous=>({...previous,answers:{...previous.answers,[`seen:${step}`]:true}}));},[step,state.answers,setState]);
 const save=(key:string,value:string)=>setState(previous=>({...previous,answers:{...previous.answers,[key]:value}}));
 const value=(key:string)=>typeof state.answers[key]==='string'?state.answers[key] as string:'';
 const navigate=(next:number)=>{setState(previous=>({...previous,step:next}));window.scrollTo({top:0});};
 const field=(key:string,label:string,small=false)=><label className="tb-answer" key={key}><span id={`tb-label-${key}`}>{label}</span>{small?<input aria-labelledby={`tb-label-${key}`} value={value(key)} onChange={e=>save(key,e.target.value)} spellCheck={false} autoCorrect="off" autoCapitalize="off" />:<textarea aria-labelledby={`tb-label-${key}`} rows={3} value={value(key)} onChange={e=>save(key,e.target.value)} spellCheck={false} autoCorrect="off" autoCapitalize="off" />}</label>;
 const exercises=(prefix:string,items:SourceItem[],short=false)=><div className="tb-tasks">{items.map(item=><article className="tb-task" key={item.id}><small>{item.source}</small>{field(`${prefix}:${item.id}`,item.text,short)}</article>)}</div>;
 return <div className="app-shell tb-shell"><aside className="sidebar tb-sidebar"><div className="brand"><span className="brand-icon">✦</span><span>HOGWARTS<small>THE MAGIC OF TO BE</small></span></div><div className="lesson-label">LESSON 0</div><nav aria-label="Lesson 0 stages">{toBeStages.map((title,i)=><button className={`nav-item ${step===i?'active':''}`} key={title} aria-current={step===i?'step':undefined} onClick={()=>navigate(i)}><span className="tb-stage-number">{i+1}</span><span>{title}</span></button>)}</nav></aside>
 <div className="main-shell"><div className="mobile-stage"><select aria-label="Choose Lesson 0 stage" value={step} onChange={e=>navigate(Number(e.target.value))}>{toBeStages.map((title,i)=><option value={i} key={title}>{i+1}. {title}</option>)}</select></div><main className="tb-main"><header className="tb-heading"><span>{String(step+1).padStart(2,'0')}</span><div><small>Lesson 0 · The Magic of To Be</small><h1>{toBeStages[step]}</h1></div></header>
 <section className="tb-panel" aria-label={toBeStages[step]}>
 {step===0 && <ToBeDiagram />}
 {[1,2,3,4,12].includes(step) && <ToBeTheory step={step} />}
 {step===5 && <><h2>Complete the sentences</h2><p>Вставь am, is или are. Голицынский: «Вставьте глагол to be в Present Simple».</p>{exercises('complete',completeItems,true)}</>}
 {step===6 && <><h2>Make negative sentences</h2><div className="tb-source-note">Адаптация предложений упражнения 157. В оригинале — вставить to be; здесь — написать полное отрицательное предложение. Исходные пропуски уже заполнены.</div><p>Перепиши каждое предложение с not.</p>{exercises('negative',transformationItems)}</>}
 {step===7 && <><h2>Make questions</h2><div className="tb-source-note">Адаптация предложений упражнения 157. В оригинале — вставить to be; здесь — превратить утверждение в вопрос. Исходные пропуски уже заполнены.</div><p>Начни вопрос с Am, Is или Are.</p>{exercises('question',transformationItems)}</>}
 {step===8 && <><h2>Correct the mistakes</h2><p>Find the mistake in each sentence. Write the correct sentence.</p><div className="tb-tasks">{mistakeItems.map((item,i)=><article className="tb-task" key={item.id}>{field(`mistake:${item.id}`,`${i+1}. ${item.text}`)}</article>)}</div></>}
 {step===9 && <><h2>Read and complete</h2><p>Упражнение 157, № 20. Вставьте глагол to be в Present Simple.</p><div className="tb-reading">{readingText.split('...').map((part,i)=><span key={i}>{i>0 && <input aria-label={`Пропуск ${i}`} value={value(`reading:${i-1}`)} onChange={e=>save(`reading:${i-1}`,e.target.value)} spellCheck={false} autoCorrect="off" autoCapitalize="off" />}{part}</span>)}</div></>}
 {step===10 && <><h2>Mixed Grammar Challenge</h2><p>Упражнение 157: № 7, 8, 10, 11, 13, 15 — в исходном порядке. В оригинале нужно вставить to be. Здесь перепиши целиком каждый диалог, заполнив пропуски.</p>{exercises('mixed',mixedItems)}</>}
 {step===11 && <><h2>My Hogwarts Profile</h2><div className="tb-source-note">Авторское задание — не из учебника.</div><p>Напиши три утверждения о себе, два отрицания и два вопроса о другом человеке.</p><div className="tb-profile-example"><p>Образец утверждения: <strong>I am a student.</strong></p><p>Образец отрицания: <strong>I am not a teacher.</strong></p><p>Образец вопроса: <strong>Is she your friend?</strong></p></div>{Array.from({length:7},(_,i)=>field(`profile:${i}`,i<3?`Утверждение ${i+1}`:i<5?`Отрицание ${i-2}`:`Вопрос ${i-4}`))}</>}
 </section><footer className="tb-paging"><button className="btn" disabled={step===0} onClick={()=>navigate(step-1)}>← Back</button><span>{step+1} / {toBeStages.length}</span><button className="btn" disabled={step===12} onClick={()=>navigate(step+1)}>Next →</button></footer></main></div></div>;
}
