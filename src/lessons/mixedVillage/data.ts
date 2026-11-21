export const residents = [
  { name: 'Emma', portrait: 4 },
  { name: 'Jane', portrait: 'nurse' },
  { name: 'Anna', portrait: 3 },
  { name: 'Ron', portrait: 'ron' },
  { name: 'Tom', portrait: 2 },
  { name: 'Lily', portrait: 'office' },
  { name: 'Jack', portrait: 0 },
  { name: 'Sophie', portrait: 5 },
] as const;

export type Resident = typeof residents[number];
export type ResidentName = Resident['name'];

export const houseNumbers = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type HouseNumber = typeof houseNumbers[number];
export const numberWords = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'] as const;
