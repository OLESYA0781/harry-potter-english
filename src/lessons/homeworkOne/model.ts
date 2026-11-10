import type {LessonState} from '../../data';
import {agencyJobs,agencyDescriptions,agencyKey,answerKey,notebookKey,interviewQuestions,negativeSentences,detectiveSentences} from './data';
export type AgencyState={version:1;placements:Record<string,string>};
export function readAgency(value:unknown):AgencyState{
 if(value===undefined||value===null)return {version:1,placements:{}};
 const saved=value as Partial<AgencyState>;
 if(saved.version!==1||!saved.placements||typeof saved.placements!=='object'||Array.isArray(saved.placements))throw new Error('Не удалось открыть сохранение Task 1. Данные сохранены без изменений.');
 const entries=Object.entries(saved.placements);
 if(entries.some(([slot,job])=>!agencyDescriptions.some(item=>item.id===slot)||!agencyJobs.some(item=>item.id===job))||new Set(entries.map(([,job])=>job)).size!==entries.length)throw new Error('Не удалось открыть сохранённые карточки Task 1. Данные сохранены без изменений.');
 return saved as AgencyState;
}
/** One atomic assignment record prevents duplicate job placement across devices. */
export function placeJob(saved:AgencyState,jobId:string,slotId:string|null):AgencyState{
 if(!agencyJobs.some(job=>job.id===jobId)||slotId!==null&&!agencyDescriptions.some(slot=>slot.id===slotId))return saved;
 const placements=Object.fromEntries(Object.entries(saved.placements).filter(([slot,job])=>job!==jobId&&slot!==slotId));
 if(slotId!==null)placements[slotId]=jobId;
 return {version:1,placements};
}
export function shuffleJobs(random= Math.random){const result=[...agencyJobs];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
export function homeworkOneSummary(state:LessonState){
 const filled=(task:'interview'|'negatives'|'detective',ids:readonly {id:string}[])=>ids.every(item=>typeof state.answers[answerKey(task,item.id)]==='string'&&(state.answers[answerKey(task,item.id)] as string).trim().length>0);
 let agencyDone=false;try{agencyDone=Object.keys(readAgency(state.answers[agencyKey]).placements).length===agencyDescriptions.length;}catch{/* Invalid saved agencies stay non-editable and are shown as an error by the view. */}
 const tasks=[agencyDone,state.answers[notebookKey('town')]===true,state.answers[notebookKey('transport')]===true,filled('interview',interviewQuestions),state.answers[notebookKey('routine')]===true,filled('negatives',negativeSentences),filled('detective',detectiveSentences)];
 return {tasks,completed:tasks.filter(Boolean).length};
}
