import type {Task} from './course';
export function readSelection(value:string|undefined,options:string[]):string[]{
 try {const parsed=JSON.parse(value||'[]');return Array.isArray(parsed)&&parsed.every(item=>typeof item==='string'&&options.includes(item))?[...new Set(parsed)]:[];}catch{return [];}
}
export function readChunks(value:string|undefined,chunks:string[]):number[]{
 try {const parsed=JSON.parse(value||'[]');return Array.isArray(parsed)&&parsed.every(item=>Number.isInteger(item)&&item>=0&&item<chunks.length)&&new Set(parsed).size===parsed.length?parsed:[];}catch{return [];}
}
export function responseComplete(task:Task,value:string|undefined){
 if(task.categories)return readSelection(value,task.categories).length>0;
 if(task.chunks)return readChunks(value,task.chunks).length===task.chunks.length;
 return !!value?.trim();
}
