import { describe, expect, it } from 'vitest';
import { objects } from '../lessons/bags/data';
import { dictionary, findWords, groups, vocabulary, vocabularyLessons } from './model';

describe('My Vocabulary content', () => {
  it('keeps existing entries and uses unique IDs and lesson memberships', () => {
    expect(vocabulary).toHaveLength(73);
    expect(new Set(dictionary.map(word => word.english.toLowerCase())).size).toBe(dictionary.length);
    expect(new Set(dictionary.map(word => word.id)).size).toBe(dictionary.length);
    expect(new Set(dictionary.map(word => word.group))).toEqual(new Set(groups.map(group => group.id)));
    for (const word of dictionary) {
      expect(word.russian.trim()).not.toBe('');
      expect(word.lessons.length).toBeGreaterThan(0);
      expect(word).not.toHaveProperty('example');
    }
    for (const { id } of vocabularyLessons) expect(findWords('', 'all', id).length).toBeGreaterThan(0);
  });

  it('includes every Common Objects word and practical language from Lesson 3', () => {
    const lesson = findWords('', 'all', 'lesson-3').map(word => word.english);
    expect(lesson).toEqual(expect.arrayContaining([
      ...objects.map(([english]) => english),
      'PM', 'please PM me', 'UK', 'UK passport', 'lost and found', 'found', 'key ring', 'bus stop',
    ]));
    expect(findWords('private message', 'all', 'lesson-3')).toEqual([
      expect.objectContaining({ english: 'PM', expansion: 'private message', russian: 'личное сообщение' }),
    ]);
    expect(findWords('banana', 'all', 'lesson-1')).toEqual([]);
    for (const id of ['lesson-0', 'lesson-1', 'lesson-3'] as const) {
      expect(findWords('hospital', 'all', id).map(word => word.english)).toContain('hospital');
    }
  });

  it('searches English and Russian with case, whitespace and accent normalization', () => {
    expect(findWords('  CAFE  ').map(word => word.english)).toEqual(['café']);
    expect(findWords('БОЛЬНИЦА').map(word => word.english)).toEqual(['hospital']);
    expect(findWords('train', 'places')).toEqual([]);
    expect(findWords('train', 'transport').map(word => word.english)).toEqual(['train']);
    expect(findWords('библиотека', 'places').map(word => word.english)).toEqual(['library']);
    expect(findWords("I don't know").map(word => word.english)).toContain('I don’t know the name in English');
    expect(findWords('несуществующее')).toEqual([]);
  });
});

it('preserves the fifteen jobs in the existing Lesson 1 dictionary', () => {
  expect(vocabulary.filter(word => word.group === 'jobs').map(word => word.english)).toEqual([
    'artist','builder','bus driver','chef','doctor','farmer','footballer','nurse','office worker','pilot',
    'police officer','shop assistant','singer','teacher','vet',
  ]);
});
