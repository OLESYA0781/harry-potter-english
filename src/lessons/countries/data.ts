/** Transcribed against the user's lesson-4-textbook-pages.pdf, printed page numbers. */
export const blocks = [
 {id:'warmup',title:'Warm-up — The Mystery of the Lost Bag'},
 {id:'countries',title:'Vocabulary — Countries and Nationalities'},
 {id:'hello',title:'Listening and Speaking — Hello'},
 {id:'reading',title:'Reading — Where are they?'},
 {id:'adjectives',title:'Vocabulary — Common Adjectives'},
 {id:'grammar',title:'Grammar — To be: We, You, They'},
 {id:'speaking',title:'Speaking — Giving Information'},
] as const;
export type BlockId = typeof blocks[number]['id'];
export type CountryRow = {id:string;country:string;given?:string;gap?:number};
export const countryGroups: readonly {ending:string;rows:readonly CountryRow[]}[] = [
 {ending:'-an/-ian',rows:[
  {id:'argentina',country:'Argentina',given:'Argentinian'},
  {id:'australia',country:'Australia',gap:1},{id:'brazil',country:'Brazil',gap:2},
  {id:'colombia',country:'Colombia',gap:3},{id:'india',country:'India',gap:4},
  {id:'italy',country:'Italy',gap:5},{id:'mexico',country:'Mexico',gap:6},
  {id:'usa',country:'the US/the USA',gap:7},{id:'south-africa',country:'South Africa',gap:8},
  {id:'south-korea',country:'South Korea',gap:9},
 ]},
 {ending:'-ish',rows:[{id:'poland',country:'Poland',given:'Polish'},{id:'spain',country:'Spain',gap:10},{id:'turkey',country:'Turkey',gap:11},{id:'uk',country:'the UK',gap:12}]},
 {ending:'-ese',rows:[{id:'china',country:'China',given:'Chinese'},{id:'vietnam',country:'Vietnam',gap:13},{id:'japan',country:'Japan',gap:14}]},
 {ending:'other',rows:[{id:'france',country:'France',given:'French'},{id:'germany',country:'Germany',given:'German'},{id:'switzerland',country:'Switzerland',given:'Swiss'}]},
];
export const countryRows=countryGroups.flatMap(group=>group.rows);
export const countryOptions=['the UK','Canada','China'] as const;
export const cityOptions=['Beijing','Toronto','Manchester','Shanghai','Vancouver','London'] as const;
export const hello2a=[
 'James: Are you a student?', 'Sonia: Yes, I am. {{1}} you?',
 'James: Yes, I {{2}}. What’s your name?', 'Sonia: I’m Sonia.', 'James: I {{3}} James.',
] as const;
export const hello3a=[
 'A: Hello, I {{1:=’m}} Shanaya.', 'B: Hi, Shanaya, {{2}}’m Ben. Nice to meet you.',
 'A: You too. Where {{3}} you from, Ben?', 'B: {{4}}’m from Germany.', 'A: Oh, where in Germany?',
 'B: From Berlin.', 'A: {{5}} you a student here?', 'B: Yes, I {{6}}. Are {{7}} from the UK, Shanaya?',
 'A: No, I’m {{8}}. I {{9}} from India.',
] as const;
export const bank92a=[
 'A: Hello, I {{1:=’m}} Sue.', 'B: Hi, {{2}}’m Tony.', 'A: {{3}} you from the USA?',
 'B: No, I’m {{4}}.', 'A: Where {{5}} you from?', 'B: I’m from Canada. And you? Are {{6}} from Australia?',
 'A: Yes, I {{7}}.', 'B: Where in Australia?', 'A: {{8}}’m from Brisbane.', 'B: Nice to meet you.', 'A: And you.',
] as const;
export const bank92b=[[
 'A: Hi Gavin, how are you?', 'B: Hey Leah. I am well, thanks. Where are you?',
 'A: I am in South Africa.', 'B: Really! You are in South Africa! Where in South Africa?',
 'A: I am in Cape Town today and in Johannesburg tomorrow. Are you well?', 'B: Yes, I am. And you?', 'A: I am very well, thank you.',
],[
 'A: Hello. Are you a teacher?', 'B: No, I am not.', 'A: OK, you are a student.',
 'B: Yes, I am. I am Elif Buruk.', 'A: Where are you from, Elif?', 'B: I am from Turkey.', 'A: OK. You are in class A1.',
]] as const;
export const blogIntro=[
 'Hi, I’m Francisca. I’m Brazilian, but my home now is in London. I’m 28 and I’m an office worker. My **big** love is … cycling!',
 'Hello, I’m Finn. I’m from a **small** town (only 180 people!) in Germany and I live in London, too. I’m 32 and I’m a digital designer.',
 'We’re married and we’re 2OnABikeUK. This is our bike! It’s new and it’s very good! In the photo, I’m at the front and Francisca is at the back.',
 'Welcome to our blog about bike rides in the UK. One bike ride each month!',
] as const;
export const blogMonths=[
 ['MAY','We’re in London, by Regent’s Canal. The canal is very **old**, about 200 years old. It’s nice here, just bikes and people with children or dogs.'],
 ['JUNE','This month we are in the north of England, in the mountains. They’re beautiful. People ask, ‘Are you **cold**?’ ‘No, we aren’t, but we’re **tired**.’'],
 ['JULY','This month, hello Wales! We’re by the sea. Welsh people are very **friendly**. They ask a lot of questions: ‘Where are you from?’ ‘What’s the name of your blog?’'],
] as const;
export const blogPictures=[['A','Here we are in the north of England!'],['B','Regent’s Canal in London'],['C','By the sea in Wales']] as const;
export const readingStatements=[
 'Francisca is married to Finn.', 'Francisca is from the UK.', 'Finn is from a big city.',
 'Finn and Francisca have a bike for two people.', 'The blog is about bike rides around the UK.', 'They’re in a different country every week.',
] as const;
export const readingAdjectives=[
 'Tom is ninety-eight. He’s very {{1}}.', 'I’m {{2}}. It’s only 16 degrees in the classroom.',
 'It’s 3 a.m. I’m {{3}}.', 'Gina says ‘hello’ to everyone! She’s very {{4}}.', 'The café only has three tables. It’s very {{5}}.',
] as const;
export const adjectives=['beautiful','big and small','easy and difficult','favourite','friendly','good and bad','happy and sad','hot and cold','new and old','tired','young and old'] as const;
export const pictureLetters=['A','B','C','D','E','F','G','H','I','J','K'] as const;
export const grammar6a=[
 'We {{1}} in London, by Regent’s Canal.',
 'This month {{2}} are in the north of England, in the mountains. They {{3}} beautiful.',
 'People ask, ‘{{4}} you cold?’', 'No, we {{5}}.',
] as const;
export const bank96choices=[
 {id:1,before:'B: Are ',options:['you','we'],after:' friends?',given:'you'},
 {id:2,before:'A: Yes, ',options:['we','we’re'],after:' friends from university.'},
 {id:3,before:'B: Are ',options:['you','they'],after:' married?'},
 {id:4,before:'A: Yes, ',options:['they are','they’re'],after:'.'},
 {id:5,before:'B: ',options:['Are they','Are'],after:' British?'},
 {id:6,before:'A: No, ',options:['aren’t','they aren’t'],after:'.'},
 {id:7,before:'B: Where ',options:['they are','are they'],after:' from?'},
 {id:8,before:'A: ',options:['They','They’re'],after:' from Australia.'},
] as const;
export const bank96pronouns=[
 '**Harry and Tony** are singers.', '**Julie and I** are shop assistants.', 'Are **Camille and Sara** from Scotland?',
 '**My teachers** are Mr Vega and Ms Fox.', 'Where are **you and Paola**?', '**The nurses** aren’t here.',
 '**Len and I** are at university.', 'Are **your phone numbers** here?',
] as const;
export const bank96conversation=[
 'A: Hi. My name {{1:=’s}} Alex.', 'B: {{2}}’s your name?', 'C: {{3}}’m Bridget. I {{4}} married to Alex.',
 'B: {{5}} are you from?', 'A: {{6}} from Switzerland.', 'B: Where are {{7}} today?',
 'C: Today we {{8}} in Argentina.', 'B: {{9}} you in Buenos Aires?', 'A: No, we are{{10}}. {{11}}’re in Puerto Iguazú.',
 'C: Yes, {{12}} beautiful here.', 'A: And the people {{13}} really friendly.', 'B: Have a good day!', 'A/C: Thanks.',
] as const;
export const speakingInstruction='Work in pairs. Practise giving information. Student A: Go to page 140. Student B: Go to page 143.';
