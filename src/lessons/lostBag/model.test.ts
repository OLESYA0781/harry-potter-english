import { describe, expect, it } from 'vitest';
import { neighbours, prompts, noteColumns, finalQuestions, reply } from './data';
import { key, questionId, replyId, noteId, progress, lostBagSummary } from './model';
import { initial } from '../../data';
import { lostBagLesson, lessons } from '../registry';
import { readLesson, updateLesson } from '../progress';
import { bind, edit, flatten, newJournal, reconcile } from '../../progress';

describe('Lost bag investigation', () => {
  it('uses six distinct neighbours and twelve reply prompts with one matching owner', () => {
    expect(neighbours.map(person => person.name)).toEqual(['Alice','Jack','Sophie','Daniel','Emma','Oliver']);
    expect(prompts).toHaveLength(12); expect(noteColumns).toHaveLength(6); expect(finalQuestions).toHaveLength(7);
    expect(neighbours.filter(person => person.bag === 'brown' && person.umbrella === 'blue' && person.glasses && person.keys === 'two' && person.notebook && person.wallet).map(person => person.name)).toEqual(['Emma']);
    for (const person of neighbours) for (const prompt of prompts) expect(reply(person,prompt.id)).toMatch(/[.!?]$/);
    expect(reply(neighbours[1],'glasses')).toBe("I don't have glasses.");
    expect(reply(neighbours[3],'notebook')).toBe("I don't have a notebook.");
    expect(reply(neighbours[4],'job')).toBe("I'm an artist.");
    expect(lessons[0].id).toBe('lesson-4');
  });
  it('derives persistent progress without judging the question or final answer', () => {
    const answers: Record<string,unknown> = {};
    expect(lostBagSummary({...initial,answers})).toMatchObject({percent:0,status:'not-started'});
    for (const person of neighbours) for (const prompt of prompts) {
      answers[key(questionId(person.id,prompt.id))]='I is wrong?'; answers[key(replyId(person.id,prompt.id))]=true;
    }
    expect(progress(answers).notes).toBe(0); // Replies never fill the notebook.
    for (const person of neighbours) for (const column of noteColumns) answers[key(noteId(person.id,column.id))]='my own ungraded note';
    for (const question of finalQuestions) answers[key('final/'+question.id)]='A different owner.';
    answers[key('final/description')]='My own conclusion.';
    expect(progress(answers)).toEqual({interviews:72,notes:36,final:8,done:116,total:116});
    expect(lostBagSummary({...initial,answers})).toMatchObject({percent:100,status:'completed'});
    answers[key(questionId('alice','age'))]=' ';
    expect(progress(answers).interviews).toBe(71);
  });
  it('uses an independent revision for every changed scalar, preserving previous lessons', () => {
    const old = {...structuredClone(initial),answers:{oldHomework:'Keep', '@vika/lesson/lesson-3':{version:1,data:{...initial,answers:{oldDraft:'Keep this too'}}}}};
    const base = updateLesson(old,lostBagLesson,previous=>({...previous,answers:{[key('dialog/active')]:'alice'}}));
    const fields = Object.fromEntries(Object.entries(flatten(base)).map(([id,value])=>[id,{value,revision:1,mutation:'baseline'}]));
    const journal = reconcile(bind(newJournal(base),'learner'),fields,{});
    const changed = updateLesson(base,lostBagLesson,previous=>({...previous,answers:{...previous.answers,[key(questionId('alice','bag'))]:'My question?',[key(replyId('alice','bag'))]:true,[key(noteId('alice','bag-colour'))]:'purple',[key('final/owner')]:'Alice.'}}));
    const pending = edit(journal,changed).pending;
    expect(Object.keys(pending).sort()).toEqual(['question/alice/bag','reply/alice/bag','note/alice/bag-colour','final/owner'].map(id=>'answers:@vika/lesson/lesson-4/~sync/answers/'+key(id)).sort());
    expect(Object.values(pending).every(change=>typeof change.value==='string'||typeof change.value==='boolean')).toBe(true);
    expect(changed.answers.oldHomework).toBe('Keep'); expect(changed.answers['@vika/lesson/lesson-3']).toEqual(old.answers['@vika/lesson/lesson-3']);
    expect(readLesson(changed,lostBagLesson).answers[key(noteId('alice','bag-colour'))]).toBe('purple');
  });
});
