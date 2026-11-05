import { expect, test } from 'vitest';
import { drawPicture, freshTravelState, readTravelState } from './travelRandomizer';
test('each category exhausts ten distinct pictures and avoids a repeat at cycle boundaries', () => {
  for (const kind of ['transport', 'places'] as const) {
    let state = freshTravelState();
    const seen: string[] = [];
    for (let i = 0; i < 20; i++) { seen.push(state[kind].current); state = drawPicture(state, kind); }
    expect(new Set(seen.slice(0, 10)).size).toBe(10);
    expect(new Set(seen.slice(10)).size).toBe(10);
    expect(seen[9]).not.toBe(seen[10]);
  }
});
test('decks advance independently and resume from validated saved state', () => {
  const before = freshTravelState();
  const after = drawPicture(before, 'transport');
  expect(after.places).toEqual(before.places);
  expect(readTravelState(JSON.stringify(after))).toEqual(after);
  expect(readTravelState(JSON.stringify({ ...after, transport: {current:'bus',remaining:['bus','bus']} }))).toBeNull();
  expect(readTravelState('broken')).toBeNull();
});
