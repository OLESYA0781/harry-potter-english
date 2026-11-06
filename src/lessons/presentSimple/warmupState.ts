export const warmupKey='lesson1-warmup-differences:v1';
export const warmupDifferenceIds=['cat','room','cup','ron','books','picture','hermione'] as const;
export type WarmupDifferenceId=typeof warmupDifferenceIds[number];
export type WarmupRound={version:1;found:WarmupDifferenceId[];completedOnce:boolean};
export function readWarmup(value:string|undefined):WarmupRound{
 try{const data=JSON.parse(value||'null');if(data?.version===1&&Array.isArray(data.found))return {version:1,found:[...new Set<WarmupDifferenceId>((data.found as unknown[]).filter((id:unknown):id is WarmupDifferenceId=>warmupDifferenceIds.includes(id as WarmupDifferenceId)))],completedOnce:data.completedOnce===true};}catch{/* An absent/corrupt round does not erase any stored response. */}
 return {version:1,found:[],completedOnce:false};
}
export function discoverDifference(value:string|undefined,index:number):string{
 const round=readWarmup(value),id=warmupDifferenceIds[index];
 if(!id||round.found.includes(id))return value||JSON.stringify(round);
 const found=[...round.found,id];return JSON.stringify({...round,found,completedOnce:round.completedOnce||found.length===warmupDifferenceIds.length});
}
export function restartWarmup(value:string|undefined):string{
 const round=readWarmup(value);return JSON.stringify({...round,found:[],completedOnce:round.completedOnce||round.found.length===warmupDifferenceIds.length});
}
