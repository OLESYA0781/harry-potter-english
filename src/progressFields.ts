import { initial } from './data';
import type { LessonState } from './data';

const lessonRecord = /^answers:@vika\/lesson\/[a-z0-9][a-z0-9-]*$/;
export const isLessonRecordKey = (key: string) => lessonRecord.test(key);
const fieldPath = /^(answers:@vika\/lesson\/[a-z0-9][a-z0-9-]*)\/~sync\/(.+)$/;
const groups = ['answers', 'scores', 'ratings'] as const;
const courseKey = 'present-simple:v2';

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Stable task IDs stay intact, including IDs containing slashes or colons.
// Composite responses (e.g. word order or a round's draft and submit flag) are atomic.
export function splitField(key: string, value: unknown): Record<string, unknown> {
  if (!isLessonRecordKey(key) || !object(value) || value.version !== 1 || !object(value.data)) return { [key]: value };
  const data = value.data;
  if (typeof data.name !== 'string' || !Number.isInteger(data.step) || Number(data.step) < 0 ||
      !object(data.answers) || !object(data.scores) || !object(data.ratings)) return { [key]: value };
  const { data: _data, ...recordMetadata } = value;
  const { name, step, answers, scores, ratings, ...dataMetadata } = data;
  const parts: Record<string, unknown> = { record: { ...recordMetadata, data: dataMetadata }, name, step };
  for (const [group, entries] of Object.entries({ answers, scores, ratings })) {
    for (const [id, answer] of Object.entries(entries as Record<string, unknown>)) {
      if (group === 'answers' && id === courseKey && object(answer) && answer.schemaVersion === 2 &&
          typeof answer.activePage === 'string' && Array.isArray(answer.seen) && answer.seen.every(id => typeof id === 'string') &&
          object(answer.responses) && Object.values(answer.responses).every(response => typeof response === 'string')) {
        const { activePage, seen, responses, ...metadata } = answer;
        parts['course/record'] = metadata;
        parts['course/page'] = activePage;
        for (const page of seen) parts['course/seen/' + page] = true;
        for (const [responseId, response] of Object.entries(responses)) parts['course/response/' + responseId] = response;
      } else {
        parts[group + '/' + id] = answer;
      }
    }
  }
  return Object.fromEntries(Object.entries(parts).map(([path, item]) => [key + '/~sync/' + path, item]));
}

export function splitFields(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(values).flatMap(([key, value]) => Object.entries(splitField(key, value))));
}

export function joinFields(values: Record<string, unknown>): Record<string, unknown> {
  const result = new Map<string, unknown>();
  const lessons = new Map<string, Map<string, unknown>>();
  for (const [key, value] of Object.entries(values)) {
    if (value === null) continue;
    const path = key.match(fieldPath);
    if (!path) { result.set(key, value); continue; }
    const fields = lessons.get(path[1]) ?? new Map<string, unknown>();
    fields.set(path[2], value);
    lessons.set(path[1], fields);
  }
  for (const [key, fields] of lessons) {
    const marker = fields.get('record');
    if (!object(marker)) continue;
    const { data: extra, ...metadata } = marker;
    const entries = (prefix: string) => [...fields].filter(([path]) => path.startsWith(prefix + '/'))
      .map(([path, value]) => [path.slice(prefix.length + 1), value] as const);
    const data = {
      ...(object(extra) ? extra : {}),
      name: fields.get('name') ?? initial.name,
      step: fields.get('step') ?? initial.step,
      ...Object.fromEntries(groups.map(group => [group, Object.fromEntries(entries(group))])),
    } as LessonState;
    const course = fields.get('course/record');
    if (object(course)) {
      data.answers[courseKey] = {
        ...course, activePage: fields.get('course/page'),
        seen: entries('course/seen').map(([id]) => id),
        responses: Object.fromEntries(entries('course/response')),
      };
    }
    result.set(key, { ...metadata, data });
  }
  return Object.fromEntries(result);
}
