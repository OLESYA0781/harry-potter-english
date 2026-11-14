import type {LessonState} from '../../data';
import {questPrefix} from './data';
// One explicitly requested restart. Marker lives outside quest keys so new play
// survives refresh and synchronization. Other lesson responses are untouched.
export const requestedResetKey='golden-key-reset/2026-11-14-request-1';
export const resetArchiveKey='golden-key-archive/2026-11-14-request-1';
export function applyRequestedReset(state:LessonState):LessonState{
 if(state.answers[requestedResetKey]===true)return state;
 const previous=Object.fromEntries(Object.entries(state.answers).filter(([key])=>key.startsWith(questPrefix)));
 const answers=Object.fromEntries(Object.entries(state.answers).filter(([key])=>!key.startsWith(questPrefix)));
 if(Object.keys(previous).length&&!Object.prototype.hasOwnProperty.call(answers,resetArchiveKey))answers[resetArchiveKey]=previous;
 answers[requestedResetKey]=true;
 return {...state,answers};
}
