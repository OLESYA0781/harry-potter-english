import { townPlaces, townTransport } from '../toBe/speaking';
export const randomizerKey = 'transport-pictures:v1';
export const pictureSets = { transport: townTransport, places: townPlaces };
export type PictureKind = keyof typeof pictureSets;
export type Deck = { current: string; remaining: string[] };
export type TravelState = { version: 1; transport: Deck; places: Deck };

function shuffled(ids: string[], random = Math.random) {
  const next = [...ids];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}
export function newDeck(kind: PictureKind, previous?: string, random = Math.random): Deck {
  const ids = shuffled(pictureSets[kind].map(word => word.id), random);
  if (ids[0] === previous) [ids[0], ids[1]] = [ids[1], ids[0]];
  return { current: ids[0], remaining: ids.slice(1) };
}
export const freshTravelState = (): TravelState => ({ version: 1, transport: newDeck('transport'), places: newDeck('places') });
export function drawPicture(state: TravelState, kind: PictureKind): TravelState {
  const deck = state[kind];
  const next = deck.remaining.length ? { current: deck.remaining[0], remaining: deck.remaining.slice(1) } : newDeck(kind, deck.current);
  return { ...state, [kind]: next };
}
export function readTravelState(value?: string): TravelState | null {
  try {
    const state = JSON.parse(value || 'null') as TravelState | null;
    if (!state || state.version !== 1) return null;
    for (const kind of ['transport', 'places'] as const) {
      const deck = state[kind], ids = pictureSets[kind].map(word => word.id);
      if (!deck || !ids.includes(deck.current) || !Array.isArray(deck.remaining) ||
          deck.remaining.length >= ids.length || new Set(deck.remaining).size !== deck.remaining.length ||
          deck.remaining.some(id => !ids.includes(id) || id === deck.current)) return null;
    }
    return state;
  } catch { return null; }
}
