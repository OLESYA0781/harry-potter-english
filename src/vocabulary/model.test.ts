import { describe, expect, it } from 'vitest';
import { findWords, groups, vocabulary } from './model';

describe('My Vocabulary content', () => {
  it('contains 57 unique complete entries in five valid groups', () => {
    expect(vocabulary).toHaveLength(57);
    expect(new Set(vocabulary.map(word => word.english.toLowerCase())).size).toBe(57);
    expect(new Set(vocabulary.map(word => word.id)).size).toBe(57);
    expect(new Set(vocabulary.map(word => word.group))).toEqual(new Set(groups.map(group => group.id)));
    for (const word of vocabulary) {
      expect(word.russian.trim()).not.toBe('');
      expect(word.example).toMatch(/^[A-Z].+[.!?]$/);
      expect(word.example.split(/\s+/).length).toBeGreaterThanOrEqual(5);
      expect(word.example).not.toMatch(/\b(?:this is|these are)\b/i);
    }
  });
  it('keeps infinitives for all eight verb entries', () => {
    expect(vocabulary.filter(word => word.english.startsWith('to ')).map(word => word.english)).toEqual([
      'to paint', 'to sleep', 'to write a letter', 'to rest',
      'to spend time with my family', 'to clean my room', 'to drink', 'to sit',
    ]);
    expect(findWords('to sit')[0].example).toBe('Ron sits on the sofa.');
  });
  it('searches English/Russian with case, whitespace and accent normalization', () => {
    expect(findWords('  CAFE  ').map(word => word.english)).toEqual(['café']);
    expect(findWords('БОЛЬНИЦА').map(word => word.english)).toEqual(['hospital']);
    expect(findWords('train', 'places')).toEqual([]);
    expect(findWords('train', 'transport').map(word => word.english)).toEqual(['train']);
    expect(findWords('')).toHaveLength(57);
    expect(findWords('несуществующее')).toEqual([]);
  });
});

it('includes all fifteen Jobs words from the verified Go Getter page six',()=>{
 expect(vocabulary.filter(word=>word.group==='jobs').map(word=>word.english)).toEqual(['artist','builder','bus driver','chef','doctor','farmer','footballer','nurse','office worker','pilot','police officer','shop assistant','singer','teacher','vet']);
});
