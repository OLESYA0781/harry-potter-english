import { articleKeys, pluralKeys, wordOrderKeys, mistakeKeys, possibleQuestions } from './answerKey';
export default function TeacherAnswers({ part }: { part: string }) {
  const keys = ({ '1a': articleKeys, '1b': pluralKeys, '2': wordOrderKeys, '3': mistakeKeys } as Record<string, readonly string[]>)[part];
  return <aside className="hw3-teacher" aria-label="Teacher’s Mode">
    <h3>Teacher’s Mode</h3>
    {keys && <ol lang="en">{keys.map((answer, i) => <li key={i}>{answer}</li>)}</ol>}
    {part === '5' && <><p>Possible questions — these are examples, not the only acceptable answers.</p>
      <ol lang="en">{possibleQuestions.map((questions, i) => <li key={i}><ul>{questions.map(question => <li key={question}>{question}</li>)}</ul></li>)}</ol></>}
    {part.startsWith('4') && <p lang="ru">Ключи не заполнены: оригинальная запись 1.12 не предоставлена. Проверьте ответы по оригинальной записи; предполагаемые ответы не добавлены.</p>}
  </aside>;
}
