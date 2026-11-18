import { answerKeys, explanations } from './answerKey';

export default function TeacherAnswers({ task }: { task: number }) {
  const answers = answerKeys[task - 1];

  return <aside className="hw2-teacher" aria-label="Teacher’s Mode">
    <h3>Teacher’s Mode</h3>
    {task === 6 ? <div lang="en">{answers.map(line => <p key={line}>{line}</p>)}</div>
      : task === 1 || task === 4 ? <ul className="hw2-answer-pairs" lang="en">
        {answers.map(answer => <li key={answer}>{answer}</li>)}
      </ul> : <ol lang="en">{answers.map((answer, index) => <li key={index}>{answer}</li>)}</ol>}
    <p lang="ru">{explanations[task - 1]}</p>
  </aside>;
}
