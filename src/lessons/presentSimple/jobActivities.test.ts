import {it,expect} from 'vitest';
import {jobs} from './jobsData';
import {allTasks,topics,pages} from './course';
import {readChunks,readSelection,responseComplete} from './jobActivities';
import {freshCourse,readCourse,updateCourse,lesson1Summary} from './model';
import {initial} from '../../data';
it('covers all fifteen professions in retained question practice',()=>{
 expect(jobs).toHaveLength(15);
 for(const job of jobs)for(const prefix of ['jobs-question'])expect(allTasks.some(task=>task.id===`${prefix}-${job.id}`)).toBe(true);
 for(const id of ['question-machine'])expect(pages.some(page=>page.unit.id===id)).toBe(true);
 expect(topics.find(topic=>topic.id==='question-words')!.units.filter(unit=>unit.id.startsWith('qw-'))).toHaveLength(7);
});
it('can still read historical category selections without mutating them',()=>{
 const task={id:'retired-vet',prompt:'vet',categories:['Work outdoors','Work with animals']};
 const value=JSON.stringify(['Work outdoors','Work with animals']);
 expect(readSelection(value,task.categories!)).toHaveLength(2);expect(responseComplete(task,value)).toBe(true);
 expect(responseComplete(task,'[]')).toBe(false);expect(responseComplete(task,'["unknown"]')).toBe(false);
});
it('restores partial questions but counts them only after every chunk is used, in any order',()=>{
 const task=allTasks.find(task=>task.id==='gg6-machine-who')!;
 expect(readChunks('[2,0]',task.chunks!)).toEqual([2,0]);expect(responseComplete(task,'[2,0]')).toBe(false);
 expect(responseComplete(task,'[2,0,1]')).toBe(true);expect(responseComplete(task,'[0,0,1]')).toBe(false);
 expect(readChunks('{"bad":1}',task.chunks!)).toEqual([]);
});
it('preserves old and new responses in one unchanged course record, and excludes teacher-only interview fields',()=>{
 const before={...initial,answers:{'present-simple:v2':{...freshCourse(),responses:{'affirm-translate-01':'Old draft','gg6-machine-who':'[2,0]'}}}};
 const after=updateCourse(before,course=>({...course,responses:{...course.responses,'gg6-groups-vet':'["Work outdoors","Work with animals"]'}}));
 expect(readCourse(after).responses['affirm-translate-01']).toBe('Old draft');expect(readCourse(after).responses['gg6-machine-who']).toBe('[2,0]');
 expect(allTasks.some(task=>task.id.startsWith('gg6-interview-'))).toBe(false);
 const full=updateCourse(after,course=>({...course,seen:topics.map(topic=>topic.id),responses:{...course.responses,...Object.fromEntries(allTasks.map(task=>[task.id,task.categories?JSON.stringify([task.categories[0]]):task.chunks?JSON.stringify(task.chunks.map((_,i)=>i)):'Any own answer']))}}));
 expect(lesson1Summary(full).status).toBe('completed');
});
