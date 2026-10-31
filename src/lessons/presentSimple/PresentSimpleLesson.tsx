import { useEffect, useRef, useState } from 'react';
import { Volume2, BookOpen, X } from 'lucide-react';
import type { LessonProps } from '../types';
import type { Word } from './course';
import { expressions, pages, places, topics, transport } from './course';
import { legacyResponses, lesson1Summary, pageIndex, readCourse, updateCourse } from './model';
import WordArt, { TownArt } from './WordArt';
import './presentSimple.css';

export default function PresentSimpleLesson({state,setState,canTeach=false}:LessonProps){
 const course=readCourse(state),index=pageIndex(course),page=pages[index];
 const topic=topics.find(topic=>topic.id===page.topicId)!;
 const topicIndex=topics.indexOf(topic),unit=page.unit;
 const [teacherRequested,setTeacherRequested]=useState(false),[dictionary,setDictionary]=useState(false),[notice,setNotice]=useState('');
 const dictionaryButton=useRef<HTMLButtonElement>(null),dialog=useRef<HTMLDialogElement>(null),speech=useRef<SpeechSynthesisUtterance|null>(null);
 const teacher=canTeach && teacherRequested;
 useEffect(()=>{if(!canTeach)setTeacherRequested(false);},[canTeach]);
 useEffect(()=>{if(!course.seen.includes(topic.id))setState(previous=>updateCourse(previous,current=>({...current,seen:[...new Set([...current.seen,topic.id])]})));},[topic.id,course.seen,setState]);
 useEffect(()=>{if(dictionary && !dialog.current?.open)dialog.current?.showModal();else if(!dictionary && dialog.current?.open)dialog.current?.close();},[dictionary]);
 useEffect(()=>()=>{if(speech.current && 'speechSynthesis' in window)window.speechSynthesis.cancel();},[]);
 const navigate=(id:string)=>{window.speechSynthesis?.cancel();setState(previous=>updateCourse(previous,current=>({...current,activePage:id})));window.scrollTo({top:0,behavior:'instant'});};
 const save=(id:string,value:string)=>setState(previous=>updateCourse(previous,current=>({...current,responses:{...current.responses,[id]:value}})));
 const speak=(text:string)=>{
  if(!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)){setNotice('Английское произношение недоступно в этом браузере.');return;}
  window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-GB';utterance.rate=.85;
  const voices=window.speechSynthesis.getVoices();const voice=voices.find(voice=>voice.lang==='en-GB')||voices.find(voice=>voice.lang.startsWith('en'));if(voice)utterance.voice=voice;
  utterance.onerror=event=>{if(event.error!=='interrupted' && event.error!=='canceled')setNotice('Не удалось включить произношение. Попробуй ещё раз.');};speech.current=utterance;setNotice('');window.speechSynthesis.speak(utterance);
 };
 const pronounce=(english:string)=><button className="ps2-speak" aria-label={`Listen: ${english}`} onClick={()=>speak(english)}><Volume2 size={23} aria-hidden="true"/></button>;
 const cards=(words:Word[])=><div className="ps2-word-grid">{words.map(word=><article className="ps2-word" key={word.en}><WordArt name={word.art} label={word.ru}/><div><h3>{word.en}</h3>{pronounce(word.en)}</div><p lang="ru">{word.ru}</p></article>)}</div>;
 const vocabulary=()=> <><h3>Places in town</h3>{cards(places)}<h3>Means of transport</h3>{cards(transport)}<h3>Useful expressions</h3><dl className="ps2-expressions">{expressions.map(([en,ru])=><div key={en}><dt>{en}{pronounce(en)}</dt><dd lang="ru">{ru}</dd></div>)}</dl></>;
 const old=legacyResponses(state);
 const closeDictionary=()=>{setDictionary(false);dictionaryButton.current?.focus();};
 return <div className="app-shell ps2-shell"><aside className="sidebar ps2-sidebar"><div className="brand"><span className="brand-icon">✦</span><span>HOGWARTS<small>LESSON 1</small></span></div><div className="lesson-label">PRESENT SIMPLE</div><nav aria-label="Lesson 1 topics">{topics.map((topic,i)=><button className={`nav-item ${topic.id===page.topicId?'active':''}`} key={topic.id} aria-current={topic.id===page.topicId?'step':undefined} onClick={()=>navigate(pages.find(page=>page.topicId===topic.id)!.id)}><span>{String(i+1).padStart(2,'0')}</span><span>{topic.title}</span></button>)}</nav></aside>
 <div className="main-shell"><div className="mobile-stage"><select aria-label="Choose Lesson 1 topic" value={topic.id} onChange={event=>navigate(pages.find(page=>page.topicId===event.target.value)!.id)}>{topics.map((topic,i)=><option value={topic.id} key={topic.id}>{i+1}. {topic.title}</option>)}</select></div>
 <main className="ps2-main"><header className="ps2-heading"><span>{String(topicIndex+1).padStart(2,'0')}</span><div><small>Lesson 1 · Present Simple</small><h1>{topic.title}</h1></div></header>
 <div className="ps2-tools"><button className="ps2-button" ref={dictionaryButton} onClick={()=>setDictionary(true)}><BookOpen size={21} aria-hidden="true"/>My Vocabulary</button>{canTeach && <button className="teacher-toggle" aria-pressed={teacher} onClick={()=>setTeacherRequested(!teacherRequested)}>{teacher?'Exit teacher mode':'Teacher mode'}</button>}</div>
 {notice && !dictionary && <p role="status">{notice}</p>}
 <section className="ps2-panel" aria-label={unit.title}><h2>{unit.title}</h2>
 {teacher && <aside className="ps2-source">{unit.book||'Авторский материал по Present Simple и лексике Go Getter 3, стр. 4–5. Не дословное упражнение учебника.'}</aside>}
 {page.first && <>
 {unit.text && <p>{unit.text}</p>}
 {unit.visual==='book' && <div className="ps2-magic-book" aria-hidden="true"><BookOpen size={100}/><span>✦</span></div>}
 {unit.visual==='town' && <TownArt/>}
 {unit.visual==='order' && <div className="ps2-order" aria-label="Порядок слов"><strong>WHO?</strong><span aria-hidden="true">→</span><strong>DOES WHAT?</strong><span aria-hidden="true">→</span><strong>WHAT / WHERE / WHEN?</strong></div>}
 {unit.visual==='frequency' && <ol className="ps2-frequency">{['always','usually','often','sometimes','never'].map((word,i)=><li key={word}><strong>{word}</strong><span aria-hidden="true">{'●'.repeat(5-i)}{'○'.repeat(i)}</span></li>)}</ol>}
 {unit.formula && <div className="ps2-formula">{unit.formula.map((part,i)=><span key={part}>{i>0 && <b aria-hidden="true"> + </b>}{part}</span>)}</div>}
 {unit.table && <div className={`ps2-table ${unit.id==='short-rule'?'ps2-question-table':''}`} role="table"><div className="ps2-table-head" role="row">{unit.table.headers.map(header=><strong role="columnheader" key={header}>{header}</strong>)}</div>{unit.table.rows.map((row,i)=><div className="ps2-table-row" role="row" key={i}>{row.map((cell,j)=><div role="cell" key={j}><span className="ps2-cell-label" aria-hidden="true">{unit.table!.headers[j]}</span><span>{cell}</span></div>)}</div>)}</div>}
 {unit.examples && <div className="ps2-examples">{unit.examples.map(([en,ru])=><article key={en}><strong>{en}</strong><p lang="ru">{ru}</p></article>)}</div>}
 {unit.words==='places' && cards(places)}{unit.words==='transport' && cards(transport)}{unit.words==='all' && vocabulary()}
 </>}
 {!page.first && unit.text && <p>{unit.text}</p>}
 {/* Keep the town picture beside all five labels, including the second task page. */}
 {!page.first && unit.visual==='town' && <TownArt/>}
 <div className="ps2-tasks">{page.tasks.map(task=><article className="ps2-task" key={task.id}>{task.art && <WordArt name={task.art} label={transport.find(word=>word.art===task.art)?.ru||'Транспорт'}/>}<label><span>{task.prompt}</span>{task.options?<select aria-label={task.prompt} value={course.responses[task.id]||''} onChange={event=>save(task.id,event.target.value)}><option value="">Выбери соответствие</option>{task.options.map(option=><option value={option} key={option}>{option}</option>)}</select>:<textarea rows={task.long?8:3} spellCheck={false} autoCorrect="off" value={course.responses[task.id]||''} onChange={event=>save(task.id,event.target.value)} />}</label></article>)}</div>
 {page.topicId==='final' && page.unit.id==='final-story' && lesson1Summary(state).status==='completed' && <p className="ps2-finish">Lesson 1 Complete! ✦</p>}
 </section>
 <footer className="ps2-paging"><button className="ps2-button" disabled={index===0} onClick={()=>navigate(pages[index-1].id)}>← Back</button><span>Экран {index+1} / {pages.length}</span><button className="ps2-button" disabled={index===pages.length-1} onClick={()=>navigate(pages[index+1].id)}>Next →</button></footer>
 {old.length>0 && <details className="ps2-legacy"><summary>Ответы предыдущей версии урока</summary><p>Они сохранены отдельно от новых заданий и доступны только для чтения.</p>{old.map(([key,value],i)=><label key={key}><span>{key==='grammarNotes'?'Заметки по грамматике':key.endsWith(':busy-days')?'Занятые дни':`Сохранённый ответ ${i+1}`}</span>{teacher && <small>{key}</small>}<textarea readOnly value={value} rows={3}/></label>)}</details>}
 </main></div>
 <dialog className="ps2-dictionary" ref={dialog} aria-labelledby="ps2-dictionary-title" onCancel={event=>{event.preventDefault();closeDictionary();}} onClose={()=>setDictionary(false)}><header><h2 id="ps2-dictionary-title">My Vocabulary</h2><button className="ps2-button" aria-label="Закрыть словарь" onClick={closeDictionary}><X aria-hidden="true"/></button></header>{notice && <p role="status">{notice}</p>}{vocabulary()}</dialog>
 </div>;
}
