export const neighbours = [
  { id: 'alice', name: 'Alice', flat: 'one', age: 'twenty-four', job: 'a teacher', bag: 'black', umbrella: 'red', glasses: true, keys: 'two', notebook: true, wallet: true },
  { id: 'jack', name: 'Jack', flat: 'two', age: 'thirty', job: 'a bus driver', bag: 'brown', umbrella: 'green', glasses: false, keys: 'three', notebook: true, wallet: true },
  { id: 'sophie', name: 'Sophie', flat: 'three', age: 'nineteen', job: 'a student', bag: 'brown', umbrella: 'blue', glasses: false, keys: 'two', notebook: true, wallet: true },
  { id: 'daniel', name: 'Daniel', flat: 'four', age: 'thirty-five', job: 'a doctor', bag: 'black', umbrella: 'blue', glasses: true, keys: 'four', notebook: false, wallet: true },
  { id: 'emma', name: 'Emma', flat: 'five', age: 'twenty-seven', job: 'an artist', bag: 'brown', umbrella: 'blue', glasses: true, keys: 'two', notebook: true, wallet: true },
  { id: 'oliver', name: 'Oliver', flat: 'six', age: 'twenty-two', job: 'a shop assistant', bag: 'grey', umbrella: 'blue', glasses: true, keys: 'two', notebook: false, wallet: true },
] as const;
export type Neighbour = typeof neighbours[number];
export const prompts = [
  { id: 'name', label: 'name' }, { id: 'age', label: 'age' }, { id: 'live', label: 'live' },
  { id: 'job', label: 'job' }, { id: 'bag', label: 'bag' }, { id: 'bag-colour', label: 'bag colour' },
  { id: 'umbrella', label: 'umbrella' }, { id: 'umbrella-colour', label: 'umbrella colour' },
  { id: 'glasses', label: 'glasses' }, { id: 'keys', label: 'keys' },
  { id: 'notebook', label: 'notebook' }, { id: 'wallet', label: 'wallet' },
] as const;
export type PromptId = typeof prompts[number]['id'];
export const noteColumns = [
  { id: 'bag-colour', title: 'Bag colour' }, { id: 'umbrella-colour', title: 'Umbrella colour' },
  { id: 'glasses', title: 'Glasses' }, { id: 'keys', title: 'Number of keys' },
  { id: 'notebook', title: 'Notebook' }, { id: 'wallet', title: 'Wallet' },
] as const;
export const finalQuestions = [
  { id: 'owner', text: 'Who is the owner of the bag?' },
  { id: 'age', text: 'How old is this person?' },
  { id: 'job', text: 'What does this person do?' },
  { id: 'home', text: 'Where does this person live?' },
  { id: 'bag-colour', text: 'What colour is the bag?' },
  { id: 'contents', text: 'What does this person have in the bag?' },
  { id: 'reason', text: 'Why do you think this is the owner?' },
] as const;
export function reply(person: Neighbour, prompt: PromptId): string {
  switch (prompt) {
    case 'name': return `My name is ${person.name}.`;
    case 'age': return `I'm ${person.age} years old.`;
    case 'live': return `I live in flat number ${person.flat}.`;
    case 'job': return `I'm ${person.job}.`;
    case 'bag': return 'Yes, I have a bag.';
    case 'bag-colour': return `My bag is ${person.bag}.`;
    case 'umbrella': return 'Yes, I have an umbrella.';
    case 'umbrella-colour': return `My umbrella is ${person.umbrella}.`;
    case 'glasses': return person.glasses ? 'Yes, I have glasses.' : "I don't have glasses.";
    case 'keys': return `I have ${person.keys} keys.`;
    case 'notebook': return person.notebook ? 'Yes, I have a notebook.' : "I don't have a notebook.";
    case 'wallet': return person.wallet ? 'Yes, I have a wallet.' : "I don't have a wallet.";
  }
}
