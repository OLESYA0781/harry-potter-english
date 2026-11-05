import {useState} from 'react';
import type {Task} from './course';
import {jobs,factfile,jobExamples} from './jobsData';
import JobIllustration from './JobIllustration';
import {readChunks,readSelection} from './jobActivities';

export function JobsGallery({pronounce,teacher}:{pronounce:(word:string)=>React.ReactNode;teacher:boolean}){
 const [start,setStart]=useState(0);
 return <div className="ps2-jobs-gallery"><div className="ps2-jobs-grid">{jobs.slice(start,start+3).map(job=><article className="ps2-job-card" key={job.id}><JobIllustration id={job.id}/><div><h3>{job.name}</h3>{pronounce(job.name)}</div><p lang="ru">{job.ru}</p><p className="ps2-job-example">{jobExamples[job.id]||`${job.name==='artist'?'An':'A'} ${job.name} ${job.action} ${job.place}.`}</p>{teacher && <p className="ps2-source">Repeat: {job.name}. What does {job.name==='artist'?'an':'a'} {job.name} do? Where does {job.name==='artist'?'an':'a'} {job.name} work?</p>}</article>)}</div><div className="ps2-gallery-paging"><button className="ps2-button" disabled={start===0} onClick={()=>setStart(start-3)}>← Previous words</button><span>{start+1}–{Math.min(start+3,jobs.length)} / {jobs.length}</span><button className="ps2-button" disabled={start+3>=jobs.length} onClick={()=>setStart(start+3)}>More words →</button></div></div>;
}
export function PeterFactfile(){return <article className="ps2-factfile" aria-label="Peter Nichols factfile"><JobIllustration id="doctor"/><div><h3>Peter Nichols</h3><dl>{factfile.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div></article>;}
export function JobTask({task,value,save}:{task:Task;value:string|undefined;save:(value:string)=>void}){
 if(task.categories){const selected=readSelection(value,task.categories);return <fieldset className="ps2-job-categories"><legend>{task.prompt}</legend>{task.categories.map(option=><label key={option}><input type="checkbox" checked={selected.includes(option)} onChange={event=>{const next=event.target.checked?[...selected,option]:selected.filter(item=>item!==option);save(next.length?JSON.stringify(next):'');}}/><span>{option}</span></label>)}</fieldset>;}
 if(task.chunks){const chunks=task.chunks,selected=readChunks(value,chunks);const change=(next:number[])=>save(next.length?JSON.stringify(next):'');return <div className="ps2-question-machine"><h3>{task.prompt}</h3><div className="ps2-chunk-answer" role="group" aria-label={`Собранный вопрос: ${task.prompt}`}>{selected.length?selected.map(index=><button className="ps2-chunk" key={index} aria-label={`Убрать ${chunks[index]}`} onClick={()=>change(selected.filter(item=>item!==index))}>{chunks[index]}</button>):<span>Твой вопрос появится здесь</span>}</div><div className="ps2-chunk-bank" role="group" aria-label={`Части вопроса: ${task.prompt}`}>{chunks.map((chunk,index)=><button className="ps2-chunk" key={index} disabled={selected.includes(index)} onClick={()=>change([...selected,index])}>{chunk}</button>)}</div><button className="ps2-button" disabled={!selected.length} onClick={()=>change([])}>Собрать заново</button></div>;}
 return null;
}
export function InterviewChooser({round,value,save}:{round:number;value:string|undefined;save:(value:string)=>void}){
 return <label className="ps2-interview-choice"><span>Раунд {round}: выбери профессию</span><select aria-label={`Interview job, round ${round}`} value={value||''} onChange={event=>save(event.target.value)}><option value="">Choose a job</option>{jobs.map(job=><option key={job.id} value={job.id}>{job.name}</option>)}</select>{value&&<JobIllustration id={value}/>}</label>;
}
