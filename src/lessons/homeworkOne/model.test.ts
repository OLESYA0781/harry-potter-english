import {it,expect} from 'vitest';
import {initial} from '../../data';
import {agencyDescriptions,agencyJobs,agencyKey,answerKey,detectiveSentences,interviewQuestions,negativeSentences,notebookKey,taskTitles,townSentences,transportSentences} from './data';
import {homeworkOneSummary,placeJob,readAgency,shuffleJobs} from './model';
import {homeworks,sortHomeworks} from '../homeworkCatalog';
import {lessons} from '../registry';
it('sorts new homework above old by publication metadata without reordering lessons or mutating inputs',()=>{
 expect(homeworks.map(item=>item.id)).toEqual(['homework-1','homework-0']);
 const input=[...homeworks,{id:'newest',title:'A title',subtitle:'',href:'#/homework/2',createdAt:'2026-11-10T00:00:00Z',sequence:2}];
 const before=structuredClone(input);expect(sortHomeworks(input).map(item=>item.id)).toEqual(['newest','homework-1','homework-0']);expect(input).toEqual(before);
 expect(lessons.map(item=>item.id)).toEqual(['lesson-1','lesson-0','trial']);
});
it('moves and returns jobs without duplicates, displacing a previous occupant back to the bank',()=>{
 const first=placeJob(readAgency(undefined),'artist','paint');const next=placeJob(first,'chef','houses');
 const moved=placeJob(next,'artist','houses');expect(moved.placements).toEqual({houses:'artist'});expect(next.placements).toEqual({paint:'artist',houses:'chef'});
 expect(placeJob(moved,'artist',null).placements).toEqual({});expect(placeJob(moved,'unknown','paint')).toBe(moved);
 expect(()=>readAgency({version:2,placements:{paint:'artist'}})).toThrow();expect(()=>readAgency({version:1,placements:{paint:'artist',houses:'artist'}})).toThrow();
});
it('keeps all 15 jobs in a shuffled unique bank and the specified seven tasks without using lesson blocks 11/12',()=>{
 expect(agencyJobs).toHaveLength(15);expect(agencyDescriptions).toHaveLength(15);
 const shuffled=shuffleJobs(()=>0);expect(new Set(shuffled.map(job=>job.id)).size).toBe(15);expect(shuffled).not.toEqual(agencyJobs);
 expect(taskTitles).toHaveLength(7);expect(interviewQuestions).toHaveLength(8);expect(negativeSentences).toHaveLength(5);expect(detectiveSentences).toHaveLength(6);expect(townSentences).toHaveLength(10);expect(transportSentences).toHaveLength(10);
 expect(negativeSentences.map(item=>item.text)).toEqual(['I usually drink tea in the morning.','A singer often goes to the theatre by taxi.','They sometimes travel by plane.','My brother always plays football at the stadium.','Emma usually goes to school by bike.']);
});
it('counts completion without judging answers and keeps notebook marks separate from written work and older data',()=>{
 const old=structuredClone(initial);old.answers={'@vika/lesson/lesson-0':{version:1,data:initial},'@vika/lesson/trial-homework/day':'Keep old work','@vika/lesson/lesson-0-homework/written/profile/hogwarts':'Keep HW0'};
 const before=structuredClone(old),answers={...old.answers};
 let agency=readAgency(undefined);for(let i=0;i<15;i++)agency=placeJob(agency,agencyJobs[14-i].id,agencyDescriptions[i].id);answers[agencyKey]=agency;
 for(const [task,items] of [['interview',interviewQuestions],['negatives',negativeSentences],['detective',detectiveSentences]] as const)for(const item of items)answers[answerKey(task,item.id)]='  My own incorrect answer!\n ';
 let state={...old,answers};expect(homeworkOneSummary(state).tasks).toEqual([true,false,false,true,false,true,true]);
 state={...state,answers:{...state.answers,[notebookKey('town')]:true,[notebookKey('transport')]:true,[notebookKey('routine')]:true}};expect(homeworkOneSummary(state).completed).toBe(7);
 const missing={...state,answers:{...state.answers,[answerKey('detective',detectiveSentences[0].id)]:' \n '}};expect(homeworkOneSummary(missing).completed).toBe(6);
 for(const [key,value] of Object.entries(before.answers))expect(state.answers[key]).toEqual(value);expect(old).toEqual(before);
});
