import {createContext,useContext} from 'react';
import type {LessonProps} from './types';
import {topics} from './presentSimple/course';
import {readCourse} from './presentSimple/model';
import {responseComplete} from './presentSimple/jobActivities';
import type {LessonState} from '../data';
import PresentSimpleLesson from './presentSimple/PresentSimpleLesson';
export const transferredIds=['question-words','question-machine','journeys'];
export const TransferredContext=createContext<LessonProps|null>(null);
export function TransferredTopic({topic}:{topic:string}){const props=useContext(TransferredContext);return props?<PresentSimpleLesson {...props} onlyTopic={topic}/>:<p role="alert">Не удалось открыть сохранения перенесённого раздела.</p>;}

export function transferredProgress(state:LessonState){const course=readCourse(state),selected=topics.filter(t=>transferredIds.includes(t.id));const tasks=selected.flatMap(t=>t.units.flatMap(u=>(u.tasks||[]).filter(t=>!t.optional)));return {done:tasks.filter(t=>responseComplete(t,course.responses[t.id])).length+selected.filter(t=>course.seen.includes(t.id)).length,total:tasks.length+selected.length};}
