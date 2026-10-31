import { useEffect, useState } from 'react';
import type { LessonProps } from '../types';
import { lesson1Materials as materials, weekDays } from './materials';
import type { BookExercise } from './materials';
import { grammarSeen, lesson1Summary, slideTitles, stageTitles } from './model';
import GrammarSlides from './GrammarSlides';
import './presentSimple.css';

export default function PresentSimpleLesson({state,setState,canTeach=false}: LessonProps) {
  const [teacherRequested,setTeacherRequested]=useState(false);
  const teacher=canTeach && teacherRequested;
  useEffect(()=>{if(!canTeach)setTeacherRequested(false);},[canTeach]);
  const step=Math.min(state.step,8);
  const slide=typeof state.answers.grammarSlide === 'number' ? Math.max(0,Math.min(5,state.answers.grammarSlide)) : 0;
  const save=(key:string,value:unknown)=>setState(previous=>({...previous,answers:{...previous.answers,[key]:value}}));
  const navigate=(next:number)=>{setState(previous=>({...previous,step:next,answers:next===1?{...previous.answers,[`grammarSeen${slide}`]:true}:previous.answers}));window.scrollTo({top:0});};
  const changeSlide=(next:number)=>setState(previous=>({...previous,answers:{...previous.answers,grammarSlide:next,[`grammarSeen${next}`]:true}}));
  const summary=lesson1Summary(state);
  const exercise=step>=2?step+1:null;
  const source=(text:string)=>teacher && text?<p className="ps-source-note">{text}</p>:null;
  const media=(src:string|null,label:string)=>src?<audio controls preload="metadata" src={src} aria-label={label} />:<p className="ps-media-missing">{label} пока недоступно. Можно прочитать текст и слова с учителем.</p>;
  const task=(key:string,book:BookExercise)=>{
    const selected=Array.isArray(state.answers[`${key}:busy-days`])?state.answers[`${key}:busy-days`] as string[]:['Thursday'];
    return <div className="ps-book-task"><p>{book.instruction}</p>
      {book.words && <div className="ps-word-bank" aria-label="Vocabulary">{book.words.map(word=><span key={word}>{word}</span>)}</div>}
      {book.image && <img className="ps-book-image" src={book.image} alt={book.imageAlt || ''} />}
      {book.dialogue && <div className="ps-dialogue">{materials.introduction.dialogue}</div>}
      {book.example && <div className="ps-book-example"><strong>Example</strong><p>{book.example}</p></div>}
      {book.calendar && <fieldset className="ps-calendar"><legend>Cross out the busy days</legend><div>{weekDays.map(day=><button type="button" className={selected.includes(day)?'is-busy':''} aria-pressed={selected.includes(day)} key={day} onClick={()=>save(`${key}:busy-days`,selected.includes(day)?selected.filter(value=>value!==day):[...selected,day])}>{day}</button>)}</div></fieldset>}
      {book.items.map(item=>item.example?<p className="ps-book-example" key={item.id}>{item.prompt}</p>:<label className="ps-answer" key={item.id}><span>{item.prompt}</span>{item.choices?<select value={typeof state.answers[`${key}:${item.id}`]==='string'?state.answers[`${key}:${item.id}`] as string:''} onChange={e=>save(`${key}:${item.id}`,e.target.value)}><option value="">Выбери ответ</option>{item.choices.map(option=><option key={option} value={option}>{option}</option>)}</select>:<textarea rows={3} spellCheck={false} autoCorrect="off" value={typeof state.answers[`${key}:${item.id}`]==='string'?state.answers[`${key}:${item.id}`] as string:''} onChange={e=>save(`${key}:${item.id}`,e.target.value)} />}</label>)}
    </div>;
  };
  return <div className="app-shell ps-shell"><aside className="sidebar ps-sidebar"><div className="brand"><span className="brand-icon">✦</span><span>HOGWARTS<small>LESSON 1</small></span></div><div className="lesson-label">PRESENT SIMPLE</div><nav aria-label="Lesson 1 stages">{stageTitles.map((title,i)=><button className={`nav-item ${step===i?'active':''}`} aria-current={step===i?'step':undefined} key={title} onClick={()=>navigate(i)}><span className="ps-nav-number">{i+1}</span><span>{title}</span></button>)}</nav></aside>
    <div className="main-shell"><div className="mobile-stage"><select aria-label="Choose Lesson 1 stage" value={step} onChange={e=>navigate(Number(e.target.value))}>{stageTitles.map((title,i)=><option value={i} key={title}>{i+1}. {title}</option>)}</select></div>
    <main className="ps-main"><header className="ps-heading"><span>{String(step+1).padStart(2,'0')}</span><div><small>Lesson 1 · Present Simple</small><h1>{stageTitles[step]}</h1></div></header>
      {canTeach && <button className={`teacher-toggle ${teacher?'enabled':''}`} aria-pressed={teacher} onClick={()=>setTeacherRequested(!teacherRequested)}>{teacher?'Exit teacher mode':'Teacher mode'}</button>}
      {step===0 && <section className="ps-panel"><h2>Hello!</h2>{source('Go Getter 3 · Student’s Book · page 4 · Exercise 1')}{materials.introVideo && <video controls preload="metadata" src={materials.introVideo} aria-label="Intro Video 0.1" />}{source(!materials.introVideo?'Intro Video 0.1 — исходный файл не подключён.':'')}{media(materials.audio12,'Audio 1.2')}<div className="ps-dialogue">{materials.introduction.dialogue}</div>{task('intro',materials.introduction.comprehension)}</section>}
      {step===1 && <section className="ps-panel"><div className="ps-slide-indicator" aria-label="Grammar slide">{slide+1} / 6 · {grammarSeen(state).length} просмотрено</div><GrammarSlides slide={slide} /><div className="ps-slide-controls"><button className="btn" disabled={slide===0} onClick={()=>changeSlide(slide-1)}>← Back slide</button>{slide<5?<button className="btn" onClick={()=>changeSlide(slide+1)}>Next slide →</button>:<button className="btn" onClick={()=>navigate(2)}>Continue to Student's Book</button>}</div><label className="ps-answer"><span>Мои заметки по грамматике</span><textarea rows={3} value={typeof state.answers.grammarNotes==='string'?state.answers.grammarNotes:''} onChange={e=>save('grammarNotes',e.target.value)} spellCheck={false} autoCorrect="off" /></label></section>}
      {exercise && <section className="ps-panel"><h2>Exercise {exercise}</h2>{source(`Go Getter 3 · Student’s Book · page 5 · Exercise ${exercise}`)}{exercise===4 && media(materials.audio13,'Audio 1.3')}{exercise===6 && media(materials.audio14,'Audio 1.4')}{task(`exercise${exercise}`,materials.exercises[exercise])}{exercise===9 && summary.status==='completed' && <div className="ps-finish"><h2>Lesson 1 Complete!</h2><p>Вика, ещё одно волшебное приключение позади! Ты познакомилась с Present Simple и выполнила задания.</p></div>}</section>}
      <footer className="ps-paging"><button className="btn" disabled={step===0} onClick={()=>navigate(step-1)}>← Back</button><span>{step+1} / 9</span><button className="btn" disabled={step===8} onClick={()=>navigate(step+1)}>Next →</button></footer>
    </main></div></div>;
}
