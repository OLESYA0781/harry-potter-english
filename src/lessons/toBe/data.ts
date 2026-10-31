import type {LessonState} from '../../data';
// Transcribed from golicynskij.pdf: PDF 127 table; printed 127–129 exercises 157–160.
// Stable topic IDs are independent of menu order. legacyStep preserves old-client compatibility.
export const toBeBlocks = [
 {id:'forms',title:'TO BE — Am / Is / Are',legacyStep:0,parts:[0,5]},
 {id:'affirmative',title:'Affirmative Sentences',legacyStep:1,parts:[1,13]},
 {id:'negative',title:'Negative Sentences',legacyStep:2,parts:[2,6]},
 {id:'questions',title:'Questions',legacyStep:3,parts:[3,7]},
 {id:'short-answers',title:'Short Answers',legacyStep:4,parts:[4,14]},
 {id:'mixed',title:'Mixed Practice',legacyStep:8,parts:[8,9,10]},
 {id:'profile',title:'My Hogwarts Profile',legacyStep:11,parts:[11]},
 {id:'summary',title:'Grammar Summary',legacyStep:12,parts:[12]},
];
export const toBeStages=toBeBlocks.map(block=>block.title);
export function toBeBlockIndex(state:LessonState) {
 const explicit=toBeBlocks.findIndex(block=>block.id===state.answers.toBeActiveBlock);
 if(explicit>=0 && state.step===toBeBlocks[explicit].legacyStep)return explicit;
 const legacy=toBeBlocks.findIndex(block=>block.parts.includes(state.step));
 return legacy>=0?legacy:0;
}
export const legacyPartTitles=['TO BE','Affirmative','Negative','Questions','Short Answers','Complete the sentences','Make negative sentences','Make questions','Correct the mistakes','Read and complete','Mixed Grammar Challenge','My Hogwarts Profile','To Be Cheat Sheet','Make affirmative sentences','Write short answers'];

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
// New full-sentence practice uses six unchanged affirmative gap prompts from the original selection.
export const affirmativeItems=completeItems.slice(0,6);
// Existing Ex. 157 dialogue questions, with gaps filled; short responses are now practiced separately.
export const shortAnswerItems:SourceItem[]=[
 ['157-7','Упр. 157, № 7 · Да','Is your aunt a doctor?'],
 ['157-8','Упр. 157, № 8 · Нет','Are they at home?'],
 ['157-10','Упр. 157, № 10 · Да','Are you an engineer?'],
 ['157-11','Упр. 157, № 11 · Нет','Is your sister a typist?'],
 ['157-13','Упр. 157, № 13 · Нет','Is your sister at school?'],
 ['157-15','Упр. 157, № 15 · Да','Is this your watch?'],
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
// Author-created correction exercise supplied by the owner, on the book's grammar topic.
// NOT an original exercise 157–160. Expected text is internal reference only, never graded or rendered.
export const mistakeItems = [
 ['I is eleven years old.', 'I am eleven years old.'],
 ['Hermione are very clever.', 'Hermione is very clever.'],
 ['Harry and Ron is best friends.', 'Harry and Ron are best friends.'],
 ["My parents isn't at home.", "My parents aren't at home."],
 ['She not is a teacher.', 'She is not a teacher.'],
 ["We aren't not late.", "We aren't late."],
 ['Is they in the library?', 'Are they in the library?'],
 ['You are ready for the lesson?', 'Are you ready for the lesson?'],
 ['Where you are from?', 'Where are you from?'],
 ['Are Hermione a student? Yes, she are.', 'Is Hermione a student? Yes, she is.'],
 ["Is Harry and Ron in the classroom? No, they isn't.", "Are Harry and Ron in the classroom? No, they aren't."],
 ["Are you tired? Yes, I'm.", 'Are you tired? Yes, I am.'],
].map(([text,expected],i)=>({id:String(i+1).padStart(2,'0'),text,expected}));
export const affirmativeRows=[['I am',"I'm"],['He is',"He's"],['She is',"She's"],['It is',"It's"],['You are',"You're"],['We are',"We're"],['They are',"They're"]];
export const negativeRows=[['I am not',"I'm not"],['He is not',"He isn't / He's not"],['She is not',"She isn't / She's not"],['It is not',"It isn't / It's not"],['You are not',"You aren't / You're not"],['We are not',"We aren't / We're not"],['They are not',"They aren't / They're not"]];
export const questionRows=[['Am I...?','Yes, I am.','No, I am not.'],['Is he...?','Yes, he is.',"No, he isn't."],['Is she...?','Yes, she is.',"No, she isn't."],['Is it...?','Yes, it is.',"No, it isn't."],['Are you...?','Yes, you are.',"No, you aren't."],['Are we...?','Yes, we are.',"No, we aren't."],['Are they...?','Yes, they are.',"No, they aren't."]];
export function toBeSummary(state:LessonState) {
 const text=(key:string)=>typeof state.answers[key]==='string' && !!(state.answers[key] as string).trim();
 const list=(prefix:string,items:{id:string}[])=>items.every(item=>text(`${prefix}:${item.id}`));
 const theory=[0,1,2,3,4,12].filter(i=>state.answers[`seen:${i}`]===true).length;
 const tasks=[list('affirmative',affirmativeItems),list('short',shortAnswerItems),list('mistake',mistakeItems),list('complete',completeItems),list('negative',transformationItems),list('question',transformationItems),Array.from({length:8},(_,i)=>text(`reading:${i}`)).every(Boolean),list('mixed',mixedItems),Array.from({length:7},(_,i)=>text(`profile:${i}`)).every(Boolean)].filter(Boolean).length;
 const done=theory+tasks;
 return {percent:Math.round(done/15*100),status:done===15?'completed' as const:state.step>0||Object.keys(state.answers).length?'in-progress' as const:'not-started' as const,detail:`${done} из 15 частей`};
}
