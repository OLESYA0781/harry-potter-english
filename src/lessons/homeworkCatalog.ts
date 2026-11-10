export type HomeworkEntry={id:string;title:string;subtitle:string;href:string;createdAt:string;sequence:number};
/** Publication date, never lesson name, controls newest-first homework menus. */
export function sortHomeworks(entries:readonly HomeworkEntry[]):HomeworkEntry[]{
 const ids=new Set<string>();for(const item of entries){if(ids.has(item.id)||!Number.isFinite(Date.parse(item.createdAt))||!Number.isInteger(item.sequence)||item.sequence<0)throw new Error(`Invalid homework entry: ${item.id}`);ids.add(item.id);}
 return [...entries].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)||b.sequence-a.sequence);
}
export const homeworks=sortHomeworks([
 {id:'homework-0',title:'Homework 0',subtitle:'The Magic of To Be',href:'#/homework/0',createdAt:'2026-11-02T00:00:00Z',sequence:0},
 {id:'homework-1',title:'Homework 1',subtitle:'Lesson 1 — Present Simple Homework',href:'#/homework/1',createdAt:'2026-11-10T00:00:00Z',sequence:1},
]);
