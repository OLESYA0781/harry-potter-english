import type {LessonState} from '../../data';
// Transcribed from golicynskij.pdf: PDF 127 table; printed 127–129 exercises 157–160.
export const toBeStages=['TO BE','Affirmative','Negative','Questions','Short Answers','Complete the sentences','Make negative sentences','Make questions','Correct the mistakes','Read and complete','Mixed Grammar Challenge','My Hogwarts Profile','To Be Cheat Sheet'];
export type SourceItem={id:string; source:string; text:string};
export const completeItems:SourceItem[]=[
 ['157-5','Упр. 157, № 5','I ... a pupil.'],
 ['157-9a','Упр. 157, № 9 (первое предложение)','My brother ... a worker.'],
 ['157-14','Упр. 157, № 14','My sister ... at home.'],
 ['157-16','Упр. 157, № 16','She ... an actress.'],
 ['157-17','Упр. 157, № 17','This ... my bag.'],
 ['157-18','Упр. 157, № 18','My uncle ... an office worker.'],
 ['157-19','Упр. 157, № 19','He ... at work.'],
 ['160-7','Упр. 160, № 7','We ... interested in classical music.'],
 ['160-8','Упр. 160, № 8','Vera ... afraid of snakes.'],
].map(([id,source,text])=>({id,source,text}));
// Affirmatives obtained by filling the original gaps. Adapted task, never an original transformation exercise.
export const transformationItems:SourceItem[]=[
 ['157-5','Упр. 157, № 5','I am a pupil.'],
 ['157-9a','Упр. 157, № 9 (первое предложение)','My brother is a worker.'],
 ['157-14','Упр. 157, № 14','My sister is at home.'],
 ['157-16','Упр. 157, № 16','She is an actress.'],
 ['157-17','Упр. 157, № 17','This is my bag.'],
 ['157-18','Упр. 157, № 18','My uncle is an office worker.'],
].map(([id,source,text])=>({id,source,text}));
export const readingText='Helen ... a painter. She has some fine pictures. They ... on the walls. She has much paper. It ... on the shelf. The shelf ... brown. It ... on the wall. Helen has a brother. He ... a student. He has a family. His family ... not in St. Petersburg, it ... in Moscow.';
export const mixedItems:SourceItem[]=[
 ['157-7','Упр. 157, № 7','... your aunt a doctor? — Yes, she ... .'],
 ['157-8','Упр. 157, № 8','... they at home? — No, they ... not at home, they ... at work.'],
 ['157-10','Упр. 157, № 10','... you an engineer? — Yes, I ... .'],
 ['157-11','Упр. 157, № 11','... your sister a typist? — No, she ... not a typist, she ... a student.'],
 ['157-13','Упр. 157, № 13','... your sister at school? — No, she ... not at school.'],
 ['157-15','Упр. 157, № 15','... this your watch? — Yes, it ... .'],
].map(([id,source,text])=>({id,source,text}));
export const affirmativeRows=[['I am',"I'm"],['He is',"He's"],['She is',"She's"],['It is',"It's"],['You are',"You're"],['We are',"We're"],['They are',"They're"]];
export const negativeRows=[['I am not',"I'm not"],['He is not',"He isn't / He's not"],['She is not',"She isn't / She's not"],['It is not',"It isn't / It's not"],['You are not',"You aren't / You're not"],['We are not',"We aren't / We're not"],['They are not',"They aren't / They're not"]];
export const questionRows=[['Am I...?','Yes, I am.','No, I am not.'],['Is he...?','Yes, he is.',"No, he isn't."],['Is she...?','Yes, she is.',"No, she isn't."],['Is it...?','Yes, it is.',"No, it isn't."],['Are you...?','Yes, you are.',"No, you aren't."],['Are we...?','Yes, we are.',"No, we aren't."],['Are they...?','Yes, they are.',"No, they aren't."]];
export function toBeSummary(state:LessonState) {
 const text=(key:string)=>typeof state.answers[key]==='string' && !!(state.answers[key] as string).trim();
 const list=(prefix:string,items:SourceItem[])=>items.every(item=>text(`${prefix}:${item.id}`));
 const theory=[0,1,2,3,4,12].filter(i=>state.answers[`seen:${i}`]===true).length;
 const tasks=[list('complete',completeItems),list('negative',transformationItems),list('question',transformationItems),Array.from({length:8},(_,i)=>text(`reading:${i}`)).every(Boolean),list('mixed',mixedItems),Array.from({length:7},(_,i)=>text(`profile:${i}`)).every(Boolean)].filter(Boolean).length;
 const done=theory+tasks;
 return {percent:Math.round(done/12*100),status:done===12?'completed' as const:state.step>0||Object.keys(state.answers).length?'in-progress' as const:'not-started' as const,detail:`${done} из 12 доступных частей · задание на ошибки в источнике не найдено`};
}
