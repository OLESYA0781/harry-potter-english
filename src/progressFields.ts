import type { LessonState } from './data';

const prefix = 'answers:@sync/';
const lessonPrefix = 'answers:@vika/lesson/';
const grammarPrefix = 'answers:@grammar/';
const grammarKeys = ['answers:grammarA2', 'answers:grammarB1'];
const courseKey = 'present-simple:v2';
const scope = (part: string) => part.replaceAll('~', '~0').replaceAll('/', '~1');
const unscope = (part: string) => part.replaceAll('~1', '/').replaceAll('~0', '~');
const groups = ['answers', 'scores', 'ratings'] as const;
type JsonObject = Record<string, unknown>;
const object = (value: unknown): value is JsonObject => !!value && typeof value === 'object' && !Array.isArray(value);

export function splitField(key: string, value: unknown): JsonObject {
  if (grammarKeys.includes(key) && object(value) && Array.isArray(value.entries) && value.entries.length === 10) {
    const { entries, ...metadata } = value;
    const base = grammarPrefix + key.slice('answers:'.length) + '/';
    return Object.fromEntries([[base + 'record', metadata], ...entries.map((entry, index) => [base + index, entry])]);
  }
  const id = key.startsWith(lessonPrefix) ? key.slice(lessonPrefix.length) : '';
  if (!/^[a-z0-9-]+$/.test(id) || !object(value) || value.version !== 1 || !object(value.data) ||
    !groups.every(group => object((value.data as JsonObject)[group]))) return { [key]: value };

  const data = value.data;
  const base = prefix + id + '/';
  const fields: JsonObject = {
    [base + 'record']: { ...value, data: Object.fromEntries(Object.entries(data).filter(([key]) => !groups.some(group => group === key) && key !== 'step' && key !== 'name')) },
    [base + 'name']: data.name,
    [base + 'step']: data.step,
  };
  for (const group of groups) {
    for (const [answer, entry] of Object.entries(data[group] as JsonObject)) {
      const path = base + group + '/' + scope(answer);
      if (group === 'answers' && answer === courseKey && object(entry) && entry.schemaVersion === 2 && object(entry.responses)) {
        fields[path] = { ...entry, responses: {} };
        for (const [task, result] of Object.entries(entry.responses)) fields[base + 'responses/' + scope(task)] = result;
        if (Array.isArray(entry.seen) && entry.seen.every(topic => typeof topic === 'string') && new Set(entry.seen).size === entry.seen.length) {
          fields[path] = { ...entry, responses: {}, seen: [] };
          entry.seen.forEach((topic, index) => { fields[base + 'seen/' + scope(topic)] = index; });
        }
      } else fields[path] = entry;
    }
  }
  return fields;
}

export function joinFields(fields: JsonObject): JsonObject {
  const result: JsonObject = {};
  const lessons = new Map<string, JsonObject>();
  for (const [path, value] of Object.entries(fields)) {
    if (path.startsWith(grammarPrefix)) continue;
    if (!path.startsWith(prefix)) {
      result[path] = value;
      continue;
    }
    const [id, group, key] = path.slice(prefix.length).split('/');
    if (!lessons.has(id)) lessons.set(id, {});
    lessons.get(id)![key === undefined ? group : group + '/' + key] = value;
  }
  for (const [id, entries] of lessons) {
    if (!object(entries.record) || !object(entries.record.data)) continue;
    const data = { ...entries.record.data, name: entries.name, step: entries.step,
      answers: {} as JsonObject, scores: {} as JsonObject, ratings: {} as JsonObject };
    for (const group of groups) {
      data[group] = Object.fromEntries(Object.entries(entries).filter(([key, value]) =>
        key.startsWith(group + '/') && value !== null).map(([key, value]) => [unscope(key.slice(group.length + 1)), value]));
    }
    const course = data.answers[courseKey];
    if (object(course) && course.schemaVersion === 2 && object(course.responses)) {
      const seen = Object.entries(entries).filter(([key, value]) => key.startsWith('seen/') && typeof value === 'number')
        .sort((a, b) => Number(a[1]) - Number(b[1]))
        .map(([key]) => unscope(key.slice('seen/'.length)));
      data.answers[courseKey] = { ...course, seen: seen.length ? seen : course.seen, responses: Object.fromEntries(Object.entries(entries)
        .filter(([key, value]) => key.startsWith('responses/') && value !== null)
        .map(([key, value]) => [unscope(key.slice('responses/'.length)), value])) };
    }
    result[lessonPrefix + id] = { ...entries.record, data };
  }
  for (const key of grammarKeys) {
    const base = grammarPrefix + key.slice('answers:'.length) + '/';
    const metadata = fields[base + 'record'];
    if (object(metadata)) result[key] = { ...metadata, entries: Array.from({ length: 10 }, (_, index) => fields[base + index]) };
  }
  return result;
}

export function answerFields(state: LessonState): JsonObject {
  return Object.fromEntries(Object.entries(state.answers).flatMap(([key, value]) =>
    Object.entries(splitField('answers:' + key, value))));
}
