import type {LessonState} from '../../data';
import {questProgress} from '../goldenKey/data';
import {mysterySummary} from '../mysteryHouse/model';
export const prefix='articles/v1/';
export const words=['teacher','artist','doctor','office worker','museum','hospital','singer','farmer','pilot','vet'];
export const pairs=['doctor','artist','teacher','museum','hospital'];
export const choices=['a','an','the','none'];
export const missing=[['She is ___ teacher.','a'],['He is ___ artist.','an'],['My dad is ___ doctor.','a'],['She is ___ office worker.','an'],['I see a vet. ___ vet helps animals.','the'],['This is a museum. ___ museum is big.','the'],['Hermione is ___ pupil.','a'],['Harry plays ___ football.','none'],['I go to school by ___ bus.','none'],['___ Hermione reads books.','none'],['He works at ___ hospital.','a'],['My brother is ___ footballer.','a']];
export const detective=[['She is ___ teacher.','an','a'],['He is ___ artist.','a','an'],['My mother is ___ doctor.','an','a'],['She is ___ office worker.','a','an'],['I see a vet. ___ vet helps animals.','A','the'],['This is a museum. ___ museum is big.','A','the']];
export const indefinite=(word:string)=>['artist','office worker'].includes(word)?'an':'a';
export function articleSummary(state:LessonState){const a=state.answers;let done=0;for(let i=0;i<3;i++)if(a[prefix+'theory/'+i]===true)done++;for(const word of words)if(['a','an'].includes(a[prefix+'sort/'+word] as string))done++;for(let i=0;i<5;i++)for(let r=0;r<2;r++)if(choices.includes(a[prefix+`reveal/${i}/${r}`] as string))done++;for(const [type,items] of [['missing',missing],['detective',detective]] as const)items.forEach((_,i)=>{if(choices.includes(a[prefix+type+'/'+i] as string))done++;});const quest=questProgress(state);done+=quest.done;const warm=Math.round(mysterySummary(state).percent*12/100);return {percent:Math.round((warm+done)/86*100),status:(warm+done===86?'completed':warm+done||Object.keys(a).length||state.step?'in-progress':'not-started') as 'completed'|'in-progress'|'not-started',detail:`${warm+done} из 86 этапов`};}
