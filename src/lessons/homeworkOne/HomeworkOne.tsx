import {BookOpen,Check,Pencil,Sparkles} from 'lucide-react';
import type {ReactNode} from 'react';
import type {LessonProps} from '../types';
import {assetUrl} from '../../assetUrl';
import {agencyKey,answerKey,annaFacts,detectiveSentences,frequencyWords,interviewQuestions,negativeSentences,notebookKey,taskTitles,townSentences,transportSentences} from './data';
import {homeworkOneSummary,placeJob,readAgency,type AgencyState} from './model';
import JobAgency from './JobAgency';
import './homeworkOne.css';

export default function HomeworkOne({state,setState}:LessonProps){
 const save=(key:string,value:string|boolean)=>setState(previous=>({...previous,answers:{...previous.answers,[key]:value}}));
 const {tasks:done}=homeworkOneSummary(state);
 let agency:AgencyState|undefined,agencyError='';try{agency=readAgency(state.answers[agencyKey]);}catch(error){agencyError=error instanceof Error?error.message:'Не удалось открыть карточки.';}
 const section=(number:number,children:ReactNode)=><section className="hw1-task" id={`hw1-task-${number}`} aria-labelledby={`hw1-title-${number}`}><h2 id={`hw1-title-${number}`}><span className="hw1-number">{number}</span><span>Task {number}. {taskTitles[number-1]}</span></h2>{children}</section>;
 const instructions=(en:string,ru?:string)=><div className="hw1-instructions"><p lang="en">{en}</p>{ru&&<p lang="ru">{ru}</p>}</div>;
 const notebook=()=><div className="hw1-notebook"><Pencil size={28} aria-hidden="true"/><strong>WRITE IN YOUR NOTEBOOK<span lang="ru">Выполни письменно в тетради.</span></strong></div>;
 const notebookDone=(id:'town'|'transport'|'routine',number:number)=><label className="hw1-notebook-done"><input type="checkbox" aria-label={`Task ${number} completed in notebook`} checked={state.answers[notebookKey(id)]===true} onChange={event=>save(notebookKey(id),event.target.checked)}/><span>Выполнено в тетради</span></label>;
 const numbered=(sentences:string[])=><ol className="hw1-numbered" lang="ru">{sentences.map((sentence,index)=><li key={index}><span className="hw1-sentence-number" aria-hidden="true">{index+1}</span><span>{sentence}</span></li>)}</ol>;
 const fields=(task:'interview'|'negatives'|'detective',number:number,items:readonly {id:string;text:string}[])=><div className="hw1-written-list">{items.map((item,index)=>{const key=answerKey(task,item.id);return <article className="hw1-written-card" key={item.id}><label><span className="hw1-field-prompt"><span className="hw1-sentence-number">{index+1}</span><span>{item.text}</span></span><textarea aria-label={`Task ${number}, sentence ${index+1}: ${item.text}`} rows={3} lang="en" autoCapitalize="off" autoCorrect="off" spellCheck={false} value={typeof state.answers[key]==='string'?state.answers[key] as string:''} onChange={event=>save(key,event.target.value)}/></label></article>;})}</div>;
 return <main className="hw1-homework"><div className="hw1-heading"><Sparkles size={38} aria-hidden="true"/><div><p>Hogwarts Homework · Homework 1</p><h1>Lesson 1 — Present Simple Homework</h1><p className="hw1-subtitle">Jobs, Places, Transport &amp; Everyday Life</p></div></div>
 <div className="hw1-links"><a href="#/lessons/lesson-1">← Lesson 1</a><a href="#/vocabulary"><BookOpen size={23} aria-hidden="true"/>My Vocabulary</a></div>
 <nav className="hw1-task-nav" aria-label="Homework 1 tasks">{taskTitles.map((title,index)=><button type="button" key={title} aria-label={`Go to Task ${index+1}: ${title}`} onClick={()=>document.getElementById(`hw1-task-${index+1}`)?.scrollIntoView({block:'start'})}><span>{String(index+1).padStart(2,'0')}</span><span>{title}</span>{done[index]&&<Check size={22} aria-label="Completed"/>}</button>)}</nav>
 {section(1,<>{instructions('Drag the jobs to the correct descriptions.','Перетащи название профессии к подходящему описанию.')}{agencyError?<p role="alert">{agencyError}</p>:<JobAgency value={agency!} onMove={(job,slot)=>setState(previous=>({...previous,answers:{...previous.answers,[agencyKey]:placeJob(readAgency(previous.answers[agencyKey]),job,slot)}}))}/>}</>)}
 {section(2,<>{instructions('Translate the sentences into English in your notebook.')}{notebook()}{numbered(townSentences)}{notebookDone('town',2)}</>)}
 {section(3,<>{instructions('Translate the sentences into English in your notebook.')}{notebook()}{numbered(transportSentences)}{notebookDone('transport',3)}</>)}
 {section(4,<>{instructions("Read Anna's factfile and answer the questions in English.",'Прочитай анкету Анны и ответь на вопросы по-английски. Пиши полные предложения; для двух последних вопросов уместен краткий ответ Yes/No.')}<article className="hw1-anna" aria-label="Anna factfile"><img src={assetUrl('/art/lesson-1/homework-anna.webp')} alt="Anna, a veterinarian in a green coat, with a cat and a dog in a bright animal hospital." loading="lazy"/><div><h3>Meet Anna</h3><dl>{annaFacts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div></article>{fields('interview',4,interviewQuestions)}</>)}
 {section(5,<>{instructions('Write five sentences about your weekly routine.')}{notebook()}<p lang="ru">Представь, что ты учишься в Хогвартсе. Напиши пять предложений о своих привычках и обычных занятиях. Используй каждое наречие один раз и не менее пяти слов из новой лексики Lesson 1.</p><ol className="hw1-frequency">{frequencyWords.map(word=><li key={word}>{word}</li>)}</ol>{notebookDone('routine',5)}</>)}
 {section(6,<>{instructions("Rewrite the sentences in the negative form. Use don't or doesn't.",'Перепиши предложения в отрицательной форме. Сохрани наречие частотности и используй don’t / doesn’t с подходящей формой основного глагола. Не убирай наречие и не заменяй его другим.')}{fields('negatives',6,negativeSentences)}</>)}
 {section(7,<>{instructions('Find the mistake and rewrite the sentence correctly.','Найди грамматическую ошибку и перепиши предложение полностью, исправив её.')}{fields('detective',7,detectiveSentences)}</>)}
 </main>;
}
