import { useBook } from './Controls';
import { activities } from './model';
import type { BlockId } from './data';
const keys:Record<string,readonly string[]>={
 countries:[
  '1A: 1 Australian; 2 Brazilian; 3 Colombian; 4 Indian; 5 Italian; 6 Mexican; 7 American; 8 South African; 9 South Korean / Korean; 10 Spanish; 11 Turkish; 12 British; 13 Vietnamese; 14 Japanese.',
  '1B: Stressed syllables must be checked against the original VB1.01 recording. The recording is unavailable, so an audio-specific key has not been invented.',
  '1C–1D: Listen/repeat and pair practice. Accept the country and nationality pairs in the table.',
 ],
 hello:[
  '1A: The original 1.01 recording is unavailable. The conversation-to-photo key is not verified.',
  '1B: James → Canada → Vancouver is already supplied by the blue lines in the textbook. Sonia and Jack require the original 1.01 recording; their answers have not been guessed.',
  '2A: 1 Are; 2 am; 3 ’m.',
  'Grammar Bank 92, Exercise 1: 1 ’m (given); 2 I; 3 Are; 4 not; 5 are; 6 you; 7 am; 8 I.',
  'Grammar Bank 92, Exercise 2, conversation 1: B: Hey Leah. I’m well, thanks. Where are you? A: I’m in South Africa. B: Really! You’re in South Africa! Where in South Africa? A: I’m in Cape Town today and in Johannesburg tomorrow. Are you well? B: Yes, I am. And you? A: I’m very well, thank you. Keep the unchanged opening question.',
  'Grammar Bank 92, Exercise 2, conversation 2: A: Hello. Are you a teacher? B: No, I’m not. A: OK, you’re a student. B: Yes, I am. I’m Elif Buruk. A: Where are you from, Elif? B: I’m from Turkey. A: OK. You’re in class A1.',
  '3A: 1 ’m (given); 2 I; 3 are; 4 I; 5 Are; 6 am; 7 you; 8 not; 9 ’m.',
  '3C: Open response. Example only: I’m Lena. I’m from Warsaw in Poland. Accept the learner’s real first name, city and country.',
  '3D: Open pair practice using the supplied Shanaya and Ben conversation as the model.',
 ],
 reading:[
  '5A: A England (UK); B England (UK); C Wales (UK). The captions and blog identify these places.',
  '5C: 1 True (given); 2 False; 3 False; 4 True; 5 True; 6 False.',
  '5D: 1 old; 2 cold; 3 tired; 4 friendly; 5 small.',
 ],
 adjectives:[
  '1A: 1 E; 2 J; 3 K; 4 G; 5 C; 6 F; 7 I; 8 B; 9 D; 10 H; 11 A.',
  '1C: Use the supplied pictures and adjective pairs. Accept both members of the requested pair.',
  '1D: Open response. The textbook example is a coffee → a hot coffee. Further possible combinations: a beautiful city, a friendly person, a new phone. These are teacher examples, not additional textbook exercises.',
 ],
 grammar:[
  '6A: 1 ’re; 2 we; 3 ’re; 4 Are; 5 aren’t.',
  'Grammar Bank 96, Exercise 1: 1 you (given); 2 we’re; 3 they; 4 they are; 5 Are they; 6 they aren’t; 7 are they; 8 They’re.',
  'Grammar Bank 96, Exercise 2: 1 They’re singers. (given); 2 We’re shop assistants.; 3 Are they from Scotland?; 4 They’re Mr Vega and Ms Fox.; 5 Where are you?; 6 They aren’t here.; 7 We’re at university.; 8 Are they here? Accept grammatically equivalent full forms.',
  'Grammar Bank 96, Exercise 3: 1 ’s (given); 2 What; 3 I; 4 ’m; 5 Where; 6 We’re; 7 you; 8 ’re; 9 Are; 10 n’t; 11 We; 12 it’s; 13 are.',
 ],
 speaking:['The last two leaves of the supplied PDF are blank apart from a footer. Printed pages 140 and 143, Student A/B data, photographs and answers cannot be verified. No replacement cards or keys have been invented.'],
};
export default function TeacherAnswers({block}:{block:BlockId}){
 const {read}=useBook();return <aside className="ct-teacher" aria-label="Teacher’s Mode"><h2>Teacher’s Mode</h2>{(keys[block]||[]).map(line=><p key={line}>{line}</p>)}<p>Review manually. Accept grammatically correct alternatives in open responses. No automatic answer checking is applied.</p><h3>Written and selected responses</h3><dl>{activities.filter(activity=>activity.fields?.length).flatMap(activity=>activity.fields!.map(id=>({id,value:read(id)}))).filter(entry=>typeof entry.value==='string'&&entry.value.trim()).map(entry=><div key={entry.id}><dt>{entry.id}</dt><dd>{String(entry.value)}</dd></div>)}</dl></aside>;
}
