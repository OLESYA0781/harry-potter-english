import { describe, expect, it } from 'vitest';
import { homeworkCompletion, homeworkPrefix as p, words, sentenceCount } from './homeworkData';
import { readLesson, updateLesson } from './progress';
import { trialLesson } from './registry';
import { initial } from '../data';
describe('homework completion without grading', () => {
  it('needs studied vocabulary, written answers and explicit writing marks', () => {
    const answers: Record<string, unknown> = {};
    expect(homeworkCompletion(answers)).toEqual([false,false,false,false,false]);
    words.forEach((_, i) => answers[p + `learned${i}`] = true);
    for (const [key, n] of [['remember',5],['grammar',5],['letter',4]] as const) for(let i=0;i<n;i++) answers[p+key+i]='  my mistakess!?\n ';
    answers[p+'day']='I is happy'; answers[p+'room']='There are a owl';
    expect(homeworkCompletion(answers)).toEqual([true,true,true,false,false]);
    answers[p+'dayDone']=true;answers[p+'roomDone']=true;
    expect(homeworkCompletion(answers).every(Boolean)).toBe(true);
    answers[p+'day']=' \n ';
    expect(homeworkCompletion(answers)[3]).toBe(false);
  });
  it('keeps homework separate and protects it from trial reset', () => {
    const root = {...initial, answers:{[p+'day']:'  I is Vika.\n', diary:'old'}};
    expect(readLesson(root,trialLesson).answers).toEqual({diary:'old'});
    expect(updateLesson(root,trialLesson,initial).answers).toEqual({[p+'day']:'  I is Vika.\n'});
    expect(root.answers.diary).toBe('old');
  });
  it('counts approximate sentences without judging their grammar', () => { expect(sentenceCount('I is Vika.\nMy cat sleep!')).toBe(2); expect(sentenceCount('')).toBe(0); });
});
