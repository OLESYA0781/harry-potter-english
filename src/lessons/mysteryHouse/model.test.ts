import {it,expect} from 'vitest';
import {initial} from '../../data';
import {rooms,roundKey} from './data';
import {readDraft,completeDraft,roomDone,mysterySummary,moveToken} from './model';
import {mysteryLesson,lessons,trialLesson,toBeLesson,presentSimpleLesson} from '../registry';
import {readLesson,updateLesson} from '../progress';
it('registers only the new warm-up before existing lessons and keeps all twelve requested rounds',()=>{
 expect(lessons.map(x=>x.id)).toEqual(['lesson-2','lesson-1','lesson-0','trial']);expect(rooms).toHaveLength(6);expect(rooms.flatMap(x=>x.rounds)).toHaveLength(12);
 expect(new Set(rooms.flatMap(room=>room.rounds.map(r=>roundKey(room.id,r.id)))).size).toBe(12);
 for(const room of rooms)for(const round of room.rounds){expect(round.read).toBeTruthy();expect(round.answer).toBeTruthy();expect(round.guide).toBeTruthy();}
});
it('restores incomplete drafts, counts submitted rounds without auto-grading and reopens edited work',()=>{
 let state=structuredClone(initial);expect(mysterySummary(state).percent).toBe(0);
 rooms.forEach((room,i)=>room.rounds.forEach((round,r)=>{const tokens=round.options.slice(0,round.kind==='sentence'?round.options.length:1).map((_,n)=>`t${n}`);const draft={tokens,submitted:false};expect(completeDraft(round,draft)).toBe(true);state={...state,answers:{...state.answers,[roundKey(room.id,round.id)]:draft}};expect(roomDone(state,i)).toBe(false);state.answers[roundKey(room.id,round.id)]={...draft,submitted:true};if(r===1)expect(roomDone(state,i)).toBe(true);}));
 expect(mysterySummary(state)).toMatchObject({percent:100,status:'completed'});state.answers[roundKey('who','library')]={tokens:['t0'],submitted:false};expect(mysterySummary(state).percent).toBe(92);
});
it('moves, removes and reorders cards immutably and rejects unknown or duplicated tokens',()=>{
 const before=['t0','t1','t2'];expect(moveToken(before,'t0',2)).toEqual(['t1','t2','t0']);expect(moveToken(before,'t1',null)).toEqual(['t0','t2']);expect(before).toEqual(['t0','t1','t2']);
 expect(()=>readDraft({tokens:['t0','t0'],submitted:true},rooms[4].rounds[0])).toThrow();expect(()=>readDraft({tokens:['t99'],submitted:true},rooms[0].rounds[0])).toThrow();expect(()=>readDraft({tokens:['t0','t1'],submitted:false},rooms[1].rounds[0])).toThrow();
});
it('uses the existing lesson namespace and retains all older lesson/homework records',()=>{
 let root=structuredClone(initial);root.answers['@vika/lesson/lesson-1-homework/v1/written/interview/job']='Keep homework';root.answers.oldTrial='Keep trial';
 root=updateLesson(root,toBeLesson,{...structuredClone(initial),answers:{old:'Keep lesson0'}});root=updateLesson(root,presentSimpleLesson,{...structuredClone(initial),answers:{old:'Keep lesson1'}});
 const before=structuredClone(root);root=updateLesson(root,mysteryLesson,{...structuredClone(initial),step:5,answers:{[roundKey('who','library')]:{tokens:['t1'],submitted:true}}});
 for(const lesson of [trialLesson,toBeLesson,presentSimpleLesson])expect(readLesson(root,lesson)).toEqual(readLesson(before,lesson));expect(readLesson(root,mysteryLesson).step).toBe(5);expect(root.answers['@vika/lesson/lesson-1-homework/v1/written/interview/job']).toBe('Keep homework');
});
