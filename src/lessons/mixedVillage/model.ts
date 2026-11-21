import type { LessonState } from '../../data';
import type { LessonSummary } from '../types';
import { houseNumbers, residents } from './data';
import type { HouseNumber, ResidentName } from './data';

type ResidentProgress = { house?: HouseNumber; placed?: true; articles?: true };
export type Investigation = {
  active?: ResidentName;
  interviewed: Partial<Record<ResidentName, ResidentProgress>>;
};

export type VillageAction =
  | { type: 'choose' | 'interview' | 'confirmPlacement' | 'confirmArticles' | 'resetPlacement'; name: ResidentName }
  | { type: 'move'; name: ResidentName; house: HouseNumber }
  | { type: 'reset' };

const key = 'mixed-village/v1';
const empty = (): Investigation => ({ interviewed: {} });

export function readVillage(state: LessonState): Investigation {
  return (state.answers[key] as Investigation | undefined) ?? empty();
}

export function advanceVillage(progress: Investigation, action: VillageAction): Investigation {
  if (action.type === 'reset') return empty();
  const { active, interviewed } = progress;
  const { name } = action;
  const current = interviewed[name];
  const update = (next: ResidentProgress): Investigation => ({
    active: name,
    interviewed: { ...interviewed, [name]: next },
  });

  switch (action.type) {
    case 'choose': return active === name ? progress : { ...progress, active: name };
    case 'interview': return current ? progress : update({});
    case 'move': {
      if (!current || current.placed || current.house === action.house || !houseNumbers.includes(action.house)) return progress;
      // Keep each door reserved for at most one resident. A tentative plaque can be moved freely.
      if (Object.values(interviewed).some(resident => resident?.house === action.house)) return progress;
      return update({ house: action.house });
    }
    case 'confirmPlacement':
      return current?.house && !current.placed ? update({ ...current, placed: true }) : progress;
    case 'confirmArticles':
      return current?.placed && !current.articles ? update({ ...current, articles: true }) : progress;
    case 'resetPlacement':
      return current?.house ? update({}) : progress;
  }
}

export function editVillage(state: LessonState, action: VillageAction): LessonState {
  const previous = readVillage(state);
  const next = advanceVillage(previous, action);
  return previous === next ? state : { ...state, answers: { ...state.answers, [key]: next } };
}

export function villageSummary(state: LessonState): LessonSummary {
  const { active, interviewed } = readVillage(state);
  const home = residents.filter(({ name }) => interviewed[name]?.articles).length;
  const milestones = Object.values(interviewed).reduce(
    (total, resident) => total + 1 + Number(!!resident?.placed) + Number(!!resident?.articles), 0,
  );
  return {
    percent: Math.round(milestones / (residents.length * 3) * 100),
    status: home === residents.length ? 'completed' : active || milestones ? 'in-progress' : 'not-started',
    detail: `${home} из ${residents.length} жителей дома`,
  };
}
