import type { LessonState } from './data';

const lessonPrefix = '@vika/lesson/';
const fieldPrefix = 'answers:@sync/';
const courseKey = 'present-simple:v2';
const groups = ['answers', 'scores', 'ratings'] as const;
const escape = (part: string) => part.replaceAll('~', '~0').replaceAll('/', '~1');
const unescape = (part: string) => part.replaceAll('~1', '/').replaceAll('~0', '~');
const keyFor = (...path: string[]) => fieldPrefix + path.map(escape).join('/');
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export function splitField(key: string, value: unknown): [string, unknown][] {
  const lesson = key.slice(('answers:' + lessonPrefix).length);
  if (/^answers:(actionMatch|preference|bag[0-9]+)$/.test(key) && object(value)) {
    return Object.entries(value).map(([id, answer]) => [keyFor('trial-match', key.slice('answers:'.length), id), answer]);
  }
  if (!key.startsWith('answers:' + lessonPrefix) || !/^[a-z0-9][a-z0-9-]*$/.test(lesson) ||
      !object(value) || value.version !== 1 || !object(value.data)) return [[key, value]];
  const { data } = value;
  if (typeof data.name !== 'string' || !Number.isInteger(data.step) || Number(data.step) < 0 ||
      !groups.every(group => object(data[group]))) return [[key, value]];

  const entries: [string, unknown][] = [
    [keyFor(lesson, 'name'), data.name],
    [keyFor(lesson, 'step'), data.step],
  ];
  for (const group of groups) {
    for (const [id, answer] of Object.entries(data[group] as Record<string, unknown>)) {
      const path = [lesson, group, id];
      if (group === 'answers' && id === courseKey && object(answer) && answer.schemaVersion === 2 &&
          typeof answer.activePage === 'string' && Array.isArray(answer.seen) &&
          answer.seen.every(topic => typeof topic === 'string') && object(answer.responses) &&
          Object.values(answer.responses).every(response => typeof response === 'string')) {
        entries.push([keyFor(...path, 'activePage'), answer.activePage]);
        for (const topic of answer.seen) entries.push([keyFor(...path, 'seen', topic), true]);
        for (const [responseId, response] of Object.entries(answer.responses)) {
          entries.push([keyFor(...path, 'responses', responseId), response]);
        }
      } else {
        entries.push([keyFor(...path), answer]);
      }
    }
  }
  return entries;
}

function put(target: object, key: string, value: unknown) {
  Object.defineProperty(target, key, { value, enumerable: true, writable: true, configurable: true });
}

export function restoreFields(state: LessonState, values: Record<string, unknown>) {
  const lessons = new Map<string, LessonState>();
  for (const [key, value] of Object.entries(values)) {
    if (!key.startsWith(fieldPrefix) || value === null) continue;
    const [lesson, group, id, part, item] = key.slice(fieldPrefix.length).split('/').map(unescape);
    if (lesson === 'trial-match') {
      const match = object(state.answers[group]) ? state.answers[group] : {};
      put(match, id, value);
      put(state.answers, group, match);
      continue;
    }
    // An unsupported legacy record must stay visible to the lesson's format guard.
    const lessonKey = lessonPrefix + lesson;
    if (Object.hasOwn(state.answers, lessonKey) && !lessons.has(lesson)) continue;
    const data = lessons.get(lesson) ?? { name: '', step: 0, answers: {}, scores: {}, ratings: {} };
    if (!lessons.has(lesson)) {
      lessons.set(lesson, data);
      put(state.answers, lessonKey, { version: 1, data });
    }
    if (group === 'name' || group === 'step') put(data, group, value);
    else if (groups.includes(group as typeof groups[number])) {
      const target = data[group as typeof groups[number]];
      if (id === courseKey && part) {
        const opaque = values[keyFor(lesson, group, id)];
        if (opaque !== undefined && opaque !== null) continue;
        const course = (Object.hasOwn(target, id) ? data.answers[id] : {
          schemaVersion: 2, activePage: '', seen: [], responses: {},
        }) as { activePage: string; seen: string[]; responses: Record<string, string> };
        if (part === 'activePage') course.activePage = value as string;
        if (part === 'seen' && value === true) course.seen.push(item);
        if (part === 'responses') put(course.responses, item, value);
        put(target, id, course);
      } else put(target, id, value);
    }
  }
}
