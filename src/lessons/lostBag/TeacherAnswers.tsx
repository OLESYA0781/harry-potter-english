import type { LessonState } from '../../data';
import { finalQuestions, neighbours, prompts, reply } from './data';
import { key, questionId } from './model';
const expectedQuestions = ["What's your name?", 'How old are you?', 'Where do you live?', 'What do you do?', 'Do you have a bag?', 'What colour is your bag?', 'Do you have an umbrella?', 'What colour is your umbrella?', 'Do you have glasses?', 'How many keys do you have?', 'Do you have a notebook?', 'Do you have a wallet?'];
const finalAnswers = ['The owner of the bag is Emma.', 'She is twenty-seven years old.', 'She is an artist.', 'She lives in flat number five.', 'The bag is brown.', 'She has a blue umbrella, glasses, a notebook, a wallet and two keys in the bag.', 'I think Emma is the owner because all the clues match her answers.'];
const example = 'I think the bag belongs to Emma. She is twenty-seven years old. She is an artist. She lives in flat number five. Her bag is brown. She has a blue umbrella, glasses, a notebook, a wallet and two keys.';
export default function TeacherAnswers({ state }: { state: LessonState }) {
  const text = (id: string) => typeof state.answers[key(id)] === 'string' ? state.answers[key(id)] as string : '';
  return <aside className="lb-teacher" aria-label="Teacher’s Mode">
    <h2>Teacher’s Mode — Answer key</h2><p>Emma is the only person whose information matches every clue. Accept grammatically correct alternative questions and answers. Review manually; no automatic grading.</p>
    <h3>Expected questions</h3><ol>{expectedQuestions.map(question => <li key={question}>{question}</li>)}</ol>
    <h3>Neighbours and saved questions</h3>{neighbours.map(person => <section key={person.id}><h4>Flat {neighbours.indexOf(person) + 1} — {person.name}</h4><ol>{prompts.map(prompt => <li key={prompt.id}>
      <strong>{prompt.label}</strong><p>Reference reply: {reply(person, prompt.id)}</p><p>Saved question: <span className="lb-saved-text">{text(questionId(person.id, prompt.id)) || 'Not written yet'}</span></p>
    </li>)}</ol></section>)}
    <h3>Final Investigation</h3><ol>{finalQuestions.map((question, i) => <li key={question.id}><strong>{question.text}</strong><p>Reference: {finalAnswers[i]}</p><p>Saved answer: <span className="lb-saved-text">{text('final/' + question.id) || 'Not written yet'}</span></p></li>)}</ol>
    <h3>Possible final description</h3><p>{example}</p><p>Saved description: <span className="lb-saved-text">{text('final/description') || 'Not written yet'}</span></p>
  </aside>;
}
