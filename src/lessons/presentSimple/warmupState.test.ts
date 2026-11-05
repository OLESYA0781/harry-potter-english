import {it,expect} from 'vitest';
import {initial} from '../../data';
import {updateCourse,readCourse} from './model';
import {discoverDifference,readWarmup,restartWarmup,warmupDifferenceIds,warmupKey} from './warmupState';
import {responseComplete} from './jobActivities';
import {pages,allTasks} from './course';
import {warmupAreas,warmupPieces} from './WarmupDifferences';
it('requires seven unique discoveries and never counts repeated or invalid regions twice',()=>{
 let value:string|undefined;
 expect(readWarmup('not JSON').found).toEqual([]);
 for(let index=0;index<7;index++){value=discoverDifference(value,index);expect(readWarmup(value).found).toHaveLength(index+1);expect(discoverDifference(value,index)).toBe(value);}
 expect(readWarmup(value).found).toEqual([...warmupDifferenceIds]);expect(readWarmup(value).completedOnce).toBe(true);
 expect(readWarmup(JSON.stringify({version:1,found:['cat','cat','unknown']})).found).toEqual(['cat']);
 expect(discoverDifference(value,99)).toBe(value);
});
it('Play Again resets only the new round, retaining course answers, Trial discoveries and completion',()=>{
 let value:string|undefined;for(let index=0;index<7;index++)value=discoverDifference(value,index);
 const state={...structuredClone(initial),answers:{differencesFound:[0,2],diary:'Old Trial draft'}};
 const before=updateCourse(state,course=>({...course,responses:{'affirm-translate-01':'Saved translation',[warmupKey]:value!}}));
 const after=updateCourse(before,course=>({...course,responses:{...course.responses,[warmupKey]:restartWarmup(course.responses[warmupKey])}}));
 expect(after.answers.differencesFound).toEqual([0,2]);expect(after.answers.diary).toBe('Old Trial draft');
 expect(readCourse(after).responses['affirm-translate-01']).toBe('Saved translation');
 expect(readWarmup(readCourse(after).responses[warmupKey])).toEqual({version:1,found:[],completedOnce:true});
 const task=allTasks.find(task=>task.id===warmupKey)!;expect(responseComplete(task,readCourse(after).responses[warmupKey])).toBe(true);
 expect(responseComplete(task,discoverDifference(undefined,0))).toBe(false);
 expect(pages[0].unit.visual).toBe('differences');
});
it('defines exactly seven scaled hotspots per picture and only the requested changed layers',()=>{
 for(const side of ['A','B'] as const){expect(warmupAreas[side]).toHaveLength(7);for(const area of warmupAreas[side]){expect(area.left).toBeGreaterThanOrEqual(0);expect(area.top).toBeGreaterThanOrEqual(0);expect(area.left+area.width).toBeLessThanOrEqual(100);expect(area.top+area.height).toBeLessThanOrEqual(100);}}
 const a=warmupPieces('A'),b=warmupPieces('B');
 expect(a.filter(piece=>piece.kind==='book')).toHaveLength(2);expect(b.filter(piece=>piece.kind==='book')).toHaveLength(3);
 expect(a.filter(piece=>piece.kind==='hermione')).toHaveLength(1);expect(b.filter(piece=>piece.kind==='hermione')).toHaveLength(0);
 expect(a.filter(piece=>piece.kind==='picture')).toHaveLength(1);expect(b.filter(piece=>piece.kind==='picture')).toHaveLength(0);
 expect(a.filter(piece=>piece.kind==='clutter')).toHaveLength(0);expect(b.filter(piece=>piece.kind==='clutter')).toHaveLength(1);
 expect(a.find(piece=>piece.kind==='ron-body')).toEqual(b.find(piece=>piece.kind==='ron-body'));
 expect(a.find(piece=>piece.kind==='ron-face')?.cell).not.toBe(b.find(piece=>piece.kind==='ron-face')?.cell);
 expect(a.find(piece=>piece.kind==='cat')?.cell).toBe(b.find(piece=>piece.kind==='cat')?.cell);
 expect(a.find(piece=>piece.kind==='cup')?.cell).toBe(b.find(piece=>piece.kind==='cup')?.cell);
});
