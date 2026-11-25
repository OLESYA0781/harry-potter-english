import type { HouseNumber, ResidentName } from './data';

type Profile = {
  job: string;
  article: 'a' | 'an';
  workplace: string;
  transport: string;
  time: string;
  house: HouseNumber;
};

export const profiles: Record<ResidentName, Profile> = {
  Emma: { job: 'artist', article: 'an', workplace: 'a museum', transport: 'bike', time: 'nine', house: 4 },
  Jane: { job: 'nurse', article: 'a', workplace: 'a hospital', transport: 'bus', time: 'eight', house: 5 },
  Anna: { job: 'teacher', article: 'a', workplace: 'a school', transport: 'tram', time: 'eight', house: 2 },
  Ron: { job: 'chef', article: 'a', workplace: 'a restaurant', transport: 'car', time: 'ten', house: 1 },
  Tom: { job: 'farmer', article: 'a', workplace: 'a farm', transport: 'bike', time: 'six', house: 3 },
  Lily: { job: 'office worker', article: 'an', workplace: 'a bank', transport: 'underground', time: 'nine', house: 7 },
  Jack: { job: 'pilot', article: 'a', workplace: 'an airport', transport: 'car', time: 'seven', house: 8 },
  Sophie: { job: 'singer', article: 'a', workplace: 'a theatre', transport: 'bus', time: 'eleven', house: 6 },
};

export const houseClues: Record<HouseNumber, string> = {
  1: 'My house has a red roof and a bike by the door.',
  2: 'My house has a blue roof and books in the window.',
  3: 'My house has a green roof and a vegetable garden.',
  4: 'My house has a yellow roof and an easel.',
  5: 'My house has a brown roof and a bus stop nearby.',
  6: 'My house has a purple roof and a clock above the door.',
  7: 'My house is made of stone. It has flowers by the window.',
  8: 'My house is tall and has a little tower.',
};
