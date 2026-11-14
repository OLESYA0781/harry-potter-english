import type {LessonState} from '../../data';
import type {LessonSummary} from '../types';
import {rooms,roundKey,type Round} from './data';
export type Draft={tokens:string[];submitted:boolean};
export function readDraft(value:unknown,round:Round):Draft{
 if(value===undefined||value===null)return {tokens:[],submitted:false};
 const draft=value as Draft;
 if(!Array.isArray(draft.tokens)||typeof draft.submitted!=='boolean'||draft.tokens.some(id=>typeof id!=='string'||!/^t\d+$/.test(id)||!round.options[Number(id.slice(1))])||new Set(draft.tokens).size!==draft.tokens.length||(round.kind!=='sentence'&&draft.tokens.length>1))throw new Error('Не удалось открыть сохранение комнаты. Данные сохранены без изменений.');
 return draft;
}
export const completeDraft=(round:Round,draft:Draft)=>draft.tokens.length===(round.kind==='sentence'?round.options.length:1);
export function roundDone(state:LessonState,roomIndex:number,roundIndex:number){const room=rooms[roomIndex],round=room.rounds[roundIndex];try{const draft=readDraft(state.answers[roundKey(room.id,round.id)],round);return draft.submitted&&completeDraft(round,draft);}catch{return false;}}
export const roomDone=(state:LessonState,index:number)=>rooms[index].rounds.every((_,r)=>roundDone(state,index,r));
export function mysterySummary(state:LessonState):LessonSummary{const count=rooms.reduce((n,room,i)=>n+room.rounds.filter((_,r)=>roundDone(state,i,r)).length,0);return {percent:Math.round(count/12*100),status:count===12?'completed':Object.keys(state.answers).length||state.step?'in-progress':'not-started',detail:`${count} из 12 раундов`};}
/** Stable token IDs allow moving repeated words without losing identity. */
export function moveToken(value:string[],token:string,position:number|null){const next=value.filter(id=>id!==token);if(position!==null)next.splice(Math.max(0,Math.min(position,next.length)),0,token);return next;}
