/** Transcribed and visually checked against the supplied Go Getter 3 SB, pp. 4–5.
 * Handwritten/filled PDF answers are not part of the exercise. No synthetic media. */
export type BookItem = { id: string; prompt: string; choices?: string[]; example?: boolean };
export type BookExercise = { instruction: string; items: BookItem[]; words?: string[]; example?: string; calendar?: boolean; image?: string; imageAlt?: string; dialogue?: boolean };
const item=(id:string,prompt:string,example=false):BookItem=>({id,prompt,example});
export const places=['bank','café','cinema','hospital','hotel','museum','park','restaurant','stadium','theatre'];
export const transport=['bike','boat','bus','car','motorbike','plane','taxi','train','tram','underground'];
export const weekDays=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
export const introductionDialogue=`George: Hi, I’m George Nichols. Nice to meet you. This is my brother, Harry.
Harry: Unfortunately. Hi, everyone. I’m thirteen years old and George is fourteen.
George: We live in London with our parents. That’s our mum.
Mum: Hi, I’m Angela.
Harry: And this is our dad, Peter. Dad and I love sports.
Dad: That’s right. We often play tennis together. He usually wins!
George: Harry is a tennis genius.
Harry: Thank you.
George: And I’m just … a genius!
Harry: He thinks he’s funny!
George: At least you’re never bored with me! We often hang out with Emma. Emma is our cousin. She lives with our gran.
Emma: Oh, hello there! I’m Emma.
Poppy: And I’m Poppy. Emma and I are best friends.
Emma: We’re thirteen years old and we go to school together.
Poppy: We usually go by bike.
Emma: And sometimes we go by car, Gran drives us when we’re really late!
Gran: Emma, your helmet!
Emma: Thanks, Gran. This is my gran, Bertie.
Gran: Hello.
Emma: She’s the best granny in the world! She always makes pancakes for breakfast!
Poppy: Emma! Let’s go!
Emma: OK. See you later!`;
export const lesson1Materials: {
 introVideo:string|null; audio12:string|null; audio13:string|null; audio14:string|null;
 introduction:{dialogue:string;comprehension:BookExercise}; exercises:Record<number,BookExercise>;
}={
 introVideo:null,audio12:null,audio13:null,audio14:null,
 introduction:{dialogue:introductionDialogue,comprehension:{instruction:'Watch or listen and read.',items:[
  item('p4-1-harry','Is Harry good at tennis?'),item('p4-1-george','Does George like making jokes?'),item('p4-1-cousins','Are Emma and Poppy cousins?'),item('p4-1-breakfast','What does Emma have for breakfast?'),
 ]}},
 exercises:{
  3:{instruction:'Complete the sentences with the correct form of the Present Simple. Cross out the days when the people are busy. When are they all free?',calendar:true,items:[
   item('p5-3-1','1. Mr Nichols and Harry play (play) tennis on Thursdays.',true),
   item('p5-3-2','2. Emma has dance classes twice a week. She _____ (not have) them on Mondays, Wednesdays, Thursdays or at the weekend.'),
   item('p5-3-3','3. George _____ (do) karate on Tuesdays.'),
   item('p5-3-4','4. Mrs Nichols and Gran _____ (not go) to the gym on Tuesdays, Wednesdays, Fridays or Sundays.'),
   item('p5-3-5','5. Harry _____ (have) tennis practice on Tuesdays, Thursdays, Saturdays and Sundays.'),
   item('p5-3-6','6. Poppy doesn’t go (not go) to art class on Tuesdays, Wednesdays, Thursdays, Fridays or at the weekend.',true),
   item('p5-3-free','When are they all free?'),
  ]},
  4:{instruction:'Listen and repeat. Which places do you visit for fun?',words:places,items:[item('p5-4-places','Which places do you visit for fun?')]},
  5:{instruction:'Complete the sentences with the places in the Vocabulary box.',words:places,items:[
   item('p5-5-1','1. George and his dad go to the stadium to watch the football.',true),
   item('p5-5-2','2. Emma and Poppy ride their bikes in the _____.',false),
   item('p5-5-3','3. Mr Nichols is a doctor. He works at a _____.',false),
   item('p5-5-4','4. After the gym, Gran and Mrs Nichols have coffee at a _____.',false),
   item('p5-5-5','5. At the weekend, Harry goes to the _____ to see a film.',false),
  ]},
  6:{instruction:'Listen and repeat. Which means of transport can you see in the photo on page 4?',words:transport,image:'/lessons/lesson-1/page4-photo.webp',imageAlt:'Emma, Poppy and Gran in the photograph from page 4.',items:[item('p5-6-transport','Which means of transport can you see in the photo?')]},
  7:{instruction:'How do the people travel? In your notebook, write questions and answers. Then act out the dialogues in pairs.',image:'/lessons/lesson-1/page5-transport.webp',imageAlt:'Transport pictures: 1 bus, 2 train, 3 motorbike, 4 plane, 5 tram.',example:'1. Emma / go to her dance class / bike?\nA: Does Emma go to her dance class by bike?\nB: No, she doesn’t. She goes by bus.',items:[
   item('p5-7-2','2. Harry and George / go to school / car?'),
   item('p5-7-3','3. Mr Nichols / go to the hospital / underground?'),
   item('p5-7-4','4. Emma and Gran / travel to France / train?'),
   item('p5-7-5','5. Mrs Nichols / go to work / taxi?'),
  ]},
  8:{instruction:'Find all the sentences with adverbs of frequency in the dialogue on page 4.',dialogue:true,items:Array.from({length:7},(_,i)=>item(`p5-8-${i+1}`,`Sentence ${i+1}`))},
  9:{instruction:'Write five true sentences about yourself. Use adverbs of frequency and words from the Vocabulary boxes.',words:[...places,...transport],example:'I always go to the park with my friends on Saturdays.',items:Array.from({length:5},(_,i)=>item(`p5-9-${i+1}`,`My sentence ${i+1}`))},
 },
};
