import type { LessonState } from '../../data';
import { lostBagSummary } from '../lostBag/model';
import { bank92a, bank96conversation, hello2a, hello3a, grammar6a, readingAdjectives, countryRows } from './data';
export const prefix='countries/v1/';
export const key=(id:string)=>prefix+id;
export function gapIds(id:string,lines:readonly string[]){
 return lines.flatMap(line=>[...line.matchAll(/\{\{(\d+)(?::=([^}]+))?\}\}/g)].filter(match=>match[2]===undefined).map(match=>`${id}/${match[1]}`));
}
type Activity={id:string;fields?:readonly string[];done?:string;blocked?:boolean};
export const activities:readonly Activity[]=[
 {id:'p125-1a',fields:countryRows.filter(row=>row.gap).map(row=>'p125/1a/'+row.id)},
 {id:'p125-1b',done:'p125/1b/done'},{id:'p125-1c',done:'p125/1c/done'},{id:'p125-1d',done:'p125/1d/done'},
 {id:'p8-1a',fields:['p8/1a/1','p8/1a/2']},
 {id:'p8-1b',fields:['p8/1b/sonia/country','p8/1b/sonia/city','p8/1b/jack/country','p8/1b/jack/city']},
 {id:'p8-1c',done:'p8/1c/done'},{id:'p8-2a',fields:gapIds('p8/2a',hello2a)},
 {id:'p92-1',fields:gapIds('p92/1',bank92a)},{id:'p92-2',fields:['p92/2/1','p92/2/2']},
 {id:'p8-3a',fields:gapIds('p8/3a',hello3a)},{id:'p8-3b',done:'p8/3b/done'},
 {id:'p8-3c',fields:['p8/3c/name','p8/3c/city','p8/3c/country']},{id:'p8-3d',done:'p8/3d/done'},
 {id:'p19-5a',fields:['p19/5a/a','p19/5a/b','p19/5a/c']},{id:'p19-5b',done:'p19/5b/done'},
 {id:'p19-5c',fields:Array.from({length:5},(_,i)=>'p19/5c/'+(i+2))},{id:'p19-5d',fields:gapIds('p19/5d',readingAdjectives)},
 {id:'p127-1a',fields:Array.from({length:11},(_,i)=>'p127/1a/'+(i+1))},{id:'p127-1b',done:'p127/1b/done'},
 {id:'p127-1c',done:'p127/1c/done'},{id:'p127-1d',done:'p127/1d/done'},
 {id:'p19-6a',fields:gapIds('p19/6a',grammar6a)},
 {id:'p96-1',fields:Array.from({length:7},(_,i)=>'p96/1/'+(i+2))},
 {id:'p96-2',fields:Array.from({length:7},(_,i)=>'p96/2/'+(i+2))},{id:'p96-3',fields:gapIds('p96/3',bank96conversation)},
 {id:'p140-p143-7'},
];
export function activityFraction(activity:Activity,answers:Record<string,unknown>){
 if(activity.id==='p140-p143-7'){
  const role=answers[key('speaking/role')]==='b'?'b':'a';
  const fields=['names','ages','nationality','now'].map(id=>`speaking/${role}/7c/${id}`);
  return (fields.filter(id=>typeof answers[key(id)]==='string'&&String(answers[key(id)]).trim()).length+Number(answers[key(`speaking/${role}/7b/done`)]===true)+Number(answers[key(`speaking/${role}/7d/done`)]===true))/6;
 }
 if(activity.blocked)return 0;
 if(activity.done)return answers[key(activity.done)]===true?1:0;
 const fields=activity.fields||[];
 return fields.length?fields.filter(id=>typeof answers[key(id)]==='string'&&(answers[key(id)] as string).trim()).length/fields.length:0;
}
export function lessonFourSummary(state:LessonState){
 const warmup=lostBagSummary(state),fractions=activities.map(activity=>activityFraction(activity,state.answers));
 const done=fractions.filter(f=>f===1).length+Number(warmup.status==='completed'),total=activities.length+1;
 const percent=Math.round((fractions.reduce((a,b)=>a+b,0)+warmup.percent/100)/total*100);
 const started=warmup.status!=='not-started'||Object.keys(state.answers).some(id=>id.startsWith(prefix));
 return {percent,status:done===total?'completed' as const:started?'in-progress' as const:'not-started' as const,detail:`${done} / ${total} activities complete`};
}
