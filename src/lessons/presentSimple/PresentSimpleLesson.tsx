import { assetUrl } from '../../assetUrl';
import { useEffect, useRef, useState } from 'react';
import { Volume2, BookOpen, X } from 'lucide-react';
import type { LessonProps } from '../types';
import type { Word } from './course';
import { vocabulary as sharedVocabulary } from '../../vocabulary/model';
import { expressions, pages, places, topics, transport } from './course';
import { legacyResponses, lesson1Summary, pageIndex, readCourse, updateCourse } from './model';
import WordArt from './WordArt';
import TravelRandomizer from './TravelRandomizer';
import { randomizerKey } from './travelRandomizer';
import './presentSimple.css';

export default function PresentSimpleLesson({state,setState,canTeach=false}:LessonProps){
 const course=readCourse(state),index=pageIndex(course),page=pages[index];
 const topic=topics.find(topic=>topic.id===page.topicId)!;
 const topicIndex=topics.indexOf(topic),unit=page.unit;
 const sectionLabel=(item:typeof page)=>item.unit.title+((item.unit.tasks?.length||0)>4?` · ${item.unit.tasks!.findIndex(task=>task.id===item.tasks[0].id)+1}–${item.unit.tasks!.findIndex(task=>task.id===item.tasks[0].id)+item.tasks.length}`:'');
 const sections=pages.filter(item=>item.topicId===topic.id);
 const [collapsedTopic,setCollapsedTopic]=useState<string|null>(null);
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
 const vocabulary=()=> <><h3>Places in town</h3>{cards(places)}<h3>Means of transport</h3>{cards(transport)}<h3>Jobs</h3><dl className="ps2-expressions">{sharedVocabulary.filter(word=>word.group==='jobs').map(word=><div key={word.id}><dt>{word.english}{pronounce(word.english)}</dt><dd lang="ru">{word.russian}</dd></div>)}</dl><h3>Useful expressions</h3><dl className="ps2-expressions">{expressions.map(([en,ru])=><div key={en}><dt>{en}{pronounce(en)}</dt><dd lang="ru">{ru}</dd></div>)}</dl></>;
 const old=legacyResponses(state);
 const closeDictionary=()=>{setDictionary(false);dictionaryButton.current?.focus();};
 return <div className="app-shell ps2-shell"><aside className="sidebar ps2-sidebar"><div className="brand"><span className="brand-icon">✦</span><span>HOGWARTS<small>LESSON 1</small></span></div><div className="lesson-label">PRESENT SIMPLE</div><nav aria-label="Lesson 1 topics">{topics.map((topic,i)=><div key={topic.id}><button className={`nav-item ${topic.id===page.topicId?'active':''}`} key={topic.id} aria-current={topic.id===page.topicId?'step':undefined} aria-expanded={topic.id===page.topicId && collapsedTopic!==topic.id} aria-controls={`ps2-sections-${topic.id}`} onClick={()=>{if(topic.id===page.topicId)setCollapsedTopic(current=>current===topic.id?null:topic.id);else {setCollapsedTopic(null);navigate(pages.find(page=>page.topicId===topic.id)!.id);}}}><span>{String(i).padStart(2,'0')}</span><span>{topic.title}</span><span className="ps2-section-chevron" aria-hidden="true">{topic.id===page.topicId && collapsedTopic!==topic.id?'⌃':'⌄'}</span></button>{topic.id===page.topicId && collapsedTopic!==topic.id && <div id={`ps2-sections-${topic.id}`} className="ps2-subnav" aria-label={`Sections of ${topic.title}`}>{sections.map(item=><a key={item.id} href="#/lessons/lesson-1" aria-current={item.id===page.id?'step':undefined} onClick={event=>{event.preventDefault();navigate(item.id);}}>{sectionLabel(item)}</a>)}</div>}</div>)}</nav></aside>
 <div className="main-shell"><div className="mobile-stage"><select aria-label="Choose Lesson 1 topic" value={topic.id} onChange={event=>navigate(pages.find(page=>page.topicId===event.target.value)!.id)}>{topics.map((topic,i)=><option value={topic.id} key={topic.id}>{i}. {topic.title}</option>)}</select><select aria-label="Choose Lesson 1 section" value={page.id} onChange={event=>navigate(event.target.value)}>{sections.map(item=><option key={item.id} value={item.id}>{sectionLabel(item)}</option>)}</select></div>
 <main className="ps2-main"><header className="ps2-heading"><span>{String(topicIndex).padStart(2,'0')}</span><div><small>Lesson 1 · Present Simple</small><h1>{topic.title}</h1></div></header>
 <div className="ps2-tools"><button className="ps2-button" ref={dictionaryButton} onClick={()=>setDictionary(true)}><BookOpen size={21} aria-hidden="true"/>My Vocabulary</button>{canTeach && <button className="teacher-toggle" aria-pressed={teacher} onClick={()=>setTeacherRequested(!teacherRequested)}>{teacher?'Exit teacher mode':'Teacher mode'}</button>}</div>
 {notice && !dictionary && <p role="status">{notice}</p>}
 <section className="ps2-panel" aria-label={unit.title}><div className="ps2-unit-heading"><h2>{unit.title}</h2>{unit.id==='travel-rule' && <span className="ps2-by-badge">By …</span>}</div>
 {teacher && <aside className="ps2-source">{unit.book||'Авторский материал по Present Simple и лексике Go Getter 3, стр. 4–5. Не дословное упражнение учебника.'}</aside>}
 {page.first && <>
 {unit.text && <p>{unit.text}</p>}
 {unit.visual==='randomizer' && <TravelRandomizer value={course.responses[randomizerKey]} onChange={value=>save(randomizerKey,value)}/>}
 {unit.visual==='book' && <div className="ps2-magic-book" aria-hidden="true"><BookOpen size={100}/><span>✦</span></div>}

 {unit.visual==='order' && <div className="ps2-order" aria-label="Порядок слов"><strong>WHO?</strong><span aria-hidden="true">→</span><strong>DOES WHAT?</strong><span aria-hidden="true">→</span><strong>WHAT / WHERE / WHEN?</strong></div>}
 {unit.visual==='frequency' && <ol className="ps2-frequency">{['always','usually','often','sometimes','never'].map((word,i)=><li key={word}><strong>{word}</strong><span aria-hidden="true">{'●'.repeat(5-i)}{'○'.repeat(i)}</span></li>)}</ol>}
 {unit.formula && <div className="ps2-formula">{unit.formula.map((part,i)=><span key={part}>{i>0 && <b aria-hidden="true"> + </b>}{part}</span>)}</div>}
 {unit.table && <div className={`ps2-table ${unit.id==='short-rule'?'ps2-question-table':unit.id==='question-rule'?'ps2-helper-table':''}`} role="table"><div className="ps2-table-head" role="row">{unit.table.headers.map(header=><strong role="columnheader" key={header}>{header}</strong>)}</div>{unit.table.rows.map((row,i)=><div className="ps2-table-row" role="row" key={i}>{row.map((cell,j)=><div role="cell" key={j}><span className="ps2-cell-label" aria-hidden="true">{unit.table!.headers[j]}</span>{unit.id==='question-rule' && j===1?<strong className="ps2-helper-token">{cell}</strong>:<span>{cell}</span>}</div>)}</div>)}</div>}
 {unit.examples && <div className="ps2-examples">{unit.examples.map(([en,ru])=><article key={en}><strong>{en}</strong><p lang="ru">{ru}</p></article>)}</div>}
 {unit.words==='jobs' && <dl className="ps2-expressions ps2-jobs-vocabulary">{sharedVocabulary.filter(word=>word.group==='jobs').map(word=><div key={word.id}><dt>{word.english}{pronounce(word.english)}</dt><dd lang="ru">{word.russian}</dd></div>)}</dl>}
 {unit.words==='places' && cards(places)}{unit.words==='transport' && cards(transport)}{unit.words==='all' && vocabulary()}
 </>}
 {!page.first && unit.text && <p>{unit.text}</p>}
 {unit.townScene && <figure className="ps2-town-scene"><div className="ps2-town-art"><img src={assetUrl('/art/lesson-0/places.webp')} alt={unit.townScene.alt} loading="lazy" style={{left:`${-(unit.townScene.index%2)*100}%`,top:`${-Math.floor(unit.townScene.index/2)*100}%`}}/></div><figcaption>Время открытия: <strong>{unit.townScene.opens}</strong></figcaption></figure>}
 {teacher && unit.teacherHints && <details className="ps2-source"><summary>Подсказки для учителя</summary><ul>{unit.teacherHints.map(hint=><li key={hint}>{hint}</li>)}</ul></details>}
 <div className="ps2-tasks">{unit.id==='journey-frequency'?page.tasks.filter(task=>task.pair?.part==='question').map(question=><article className="ps2-task ps2-journey-pair" key={question.pair!.id}><h3 lang="ru">{question.pair!.question}</h3>{page.tasks.filter(task=>task.pair?.id===question.pair!.id).map(task=><label key={task.id}><span>{task.pair!.part==='question'?'Перевод вопроса':'Твой ответ'}</span><textarea aria-label={task.prompt} rows={3} spellCheck={false} autoCorrect="off" autoCapitalize="off" value={course.responses[task.id]||''} onChange={event=>save(task.id,event.target.value)}/></label>)}</article>):page.tasks.map(task=><article className="ps2-task" key={task.id}>{task.art && <WordArt name={task.art} label={transport.find(word=>word.art===task.art)?.ru||'Транспорт'}/>}<label><span id={`ps2-label-${task.id}`}>{task.prompt}</span>{task.options?<select aria-label={task.prompt} value={course.responses[task.id]||''} onChange={event=>save(task.id,event.target.value)}><option value="">Выбери соответствие</option>{task.options.map(option=><option value={option} key={option}>{option}</option>)}</select>:<textarea aria-labelledby={`ps2-label-${task.id}`} rows={task.long?8:3} spellCheck={false} autoCorrect="off" value={course.responses[task.id]||''} onChange={event=>save(task.id,event.target.value)} />}</label></article>)}</div>
 {page.topicId==='final' && page.unit.id==='final-story' && lesson1Summary(state).status==='completed' && <p className="ps2-finish">Lesson 1 Complete! ✦</p>}
 </section>
 <footer className="ps2-paging"><button className="ps2-button" disabled={index===0} onClick={()=>navigate(pages[index-1].id)}>← Back</button><span>Экран {index+1} / {pages.length}</span><button className="ps2-button" disabled={index===pages.length-1} onClick={()=>navigate(pages[index+1].id)}>Next →</button></footer>
 {old.length>0 && <details className="ps2-legacy"><summary>Ответы предыдущей версии урока</summary><p>Они сохранены отдельно от новых заданий и доступны только для чтения.</p>{old.map(([key,value],i)=><label key={key}><span>{key==='grammarNotes'?'Заметки по грамматике':key.endsWith(':busy-days')?'Занятые дни':`Сохранённый ответ ${i+1}`}</span>{teacher && <small>{key}</small>}<textarea readOnly value={value} rows={3}/></label>)}</details>}
 </main></div>
 <dialog className="ps2-dictionary" ref={dialog} aria-labelledby="ps2-dictionary-title" onCancel={event=>{event.preventDefault();closeDictionary();}} onClose={()=>setDictionary(false)}><header><h2 id="ps2-dictionary-title">My Vocabulary</h2><button className="ps2-button" aria-label="Закрыть словарь" onClick={closeDictionary}><X aria-hidden="true"/></button></header>{notice && <p role="status">{notice}</p>}{vocabulary()}</dialog>
 </div>;
}
