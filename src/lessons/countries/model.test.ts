import { describe, expect, it } from 'vitest';
import { initial } from '../../data';
import { blocks, countryGroups, countryRows, hello3a, bank96conversation, adjectives, readingStatements, blogIntro, blogMonths } from './data';
import { activities, activityFraction, key, lessonFourSummary } from './model';
import { lostBagLesson } from '../registry';
import { readLesson, updateLesson } from '../progress';
import { bind, edit, flatten, newJournal, reconcile } from '../../progress';

describe('Lesson 4 original textbook work',()=>{
 it('keeps page-specific ordering, fourteen nationality gaps, original examples and original characters',()=>{
  expect(blocks.map(block=>block.id)).toEqual(['warmup','countries','hello','reading','adjectives','grammar','speaking']);
  expect(countryGroups.map(group=>group.ending)).toEqual(['-an/-ian','-ish','-ese','other']);
  expect(countryRows).toHaveLength(20);expect(countryRows.filter(row=>row.gap).map(row=>row.gap)).toEqual(Array.from({length:14},(_,i)=>i+1));
  expect(countryRows.filter(row=>row.gap).every(row=>row.given===undefined)).toBe(true);
  expect(hello3a.join(' ')).toContain('Shanaya');expect(hello3a.join(' ')).toContain('Ben');
  expect(bank96conversation.join(' ')).toContain('Bridget');expect(bank96conversation.join(' ')).toContain('Puerto Iguazú');
  expect(adjectives).toHaveLength(11);expect(readingStatements).toHaveLength(6);
  expect(blogIntro.join(' ')).toContain('only 180 people!');expect(blogIntro.join(' ')).toContain('Francisca');expect(blogIntro.join(' ')).toContain('Finn');
  expect(blogMonths.map(([month])=>month)).toEqual(['MAY','JUNE','JULY']);
  expect(blogMonths[2][1]).toContain('Welsh people are very **friendly**.');
 });
 it('never completes missing Student A/B material and counts written answers without grading',()=>{
  const answers:Record<string,unknown>={};
  for(const activity of activities){if(activity.done)answers[key(activity.done)]=true;for(const id of activity.fields||[])answers[key(id)]='any ungraded response';}
  expect(activities.filter(activity=>activity.blocked).map(activity=>activity.id)).toEqual(['p140-p143-7']);
  expect(activityFraction(activities[0],answers)).toBe(1);expect(activityFraction(activities.at(-1)!,answers)).toBe(0);
  expect(lessonFourSummary({...initial,answers}).status).toBe('in-progress');
  expect(lessonFourSummary({...initial,answers}).percent).toBeLessThan(100);
 });
 it('preserves warm-up and other lessons while producing independent answer revisions',()=>{
  const warmup={'lost-bag/v1/question/alice/name':'My saved question?','lost-bag/v1/reply/alice/name':true,'lost-bag/v1/note/emma/bag-colour':'brown'};
  const before=updateLesson({...initial,answers:{'old-homework':'keep'}},lostBagLesson,previous=>({...previous,answers:warmup}));
  const fields=Object.fromEntries(Object.entries(flatten(before)).map(([id,value])=>[id,{value,revision:1,mutation:'confirmed'}]));
  const journal=reconcile(bind(newJournal(before),'existing-learner'),fields,{});
  const after=updateLesson(before,lostBagLesson,previous=>({...previous,answers:{...previous.answers,[key('p125/1a/australia')]:'my own word',[key('p19/5c/2')]:'True'}}));
  expect(readLesson(after,lostBagLesson).answers).toMatchObject(warmup);expect(after.answers['old-homework']).toBe('keep');
  expect(Object.keys(edit(journal,after).pending).sort()).toEqual(['p125/1a/australia','p19/5c/2'].map(id=>'answers:@vika/lesson/lesson-4/~sync/answers/'+key(id)).sort());
 });
});
