import { residents, numberWords } from './data';
import type { ResidentName } from './data';
import type { Investigation, VillageAction } from './model';
import { houseClues, profiles } from './teacherData';

function CaseNotes({ name }: { name: ResidentName }) {
  const profile = profiles[name];
  const { job, article, workplace, transport, time, house } = profile;
  const houseWord = numberWords[house - 1];
  const questions = [
    ['What do you do?', `I'm ${article} ${job}.`],
    [`Are you ${article} ${job}?`, 'Yes, I am.'],
    ['Where do you work?', `I work at ${workplace}.`],
    ['How do you go to work?', `I go to work by ${transport}.`],
    ['When do you start work?', `I usually start work at ${time}.`],
    [`Who goes to work by ${transport}?`, 'I do.'],
    [`Does your work start at ${time}?`, 'Yes, it does.'],
    [`Is your house number ${houseWord}?`, `Yes, it is. ${houseClues[house]}`],
  ];
  return <div className="village-case-notes" lang="en">
    <dl>
      <div><dt>Name</dt><dd>{name}</dd></div>
      <div><dt>Job</dt><dd>{job}</dd></div>
      <div><dt>Workplace</dt><dd>{workplace}</dd></div>
      <div><dt>Transport</dt><dd>{transport}</dd></div>
      <div><dt>House</dt><dd>Number {house}</dd></div>
      <div><dt>Routine</dt><dd>{name} usually starts work at {time}.</dd></div>
    </dl>
    <p><strong>House clue.</strong> {houseClues[house]}</p>
    <h4>Interview examples</h4>
    <ul>{questions.map(([question, reply]) => <li key={question}><strong>{question}</strong> {reply}</li>)}</ul>
    <h4>Article Challenge</h4>
    <ol>
      <li>{name} is {article} {job}.</li>
      <li>The {job} lives in house number {houseWord}.</li>
    </ol>
  </div>;
}

export default function TeacherDesk({ progress, dispatch, onReset }: {
  progress: Investigation;
  dispatch: (action: VillageAction) => void;
  onReset: () => void;
}) {
  const { active, interviewed } = progress;
  const resident = active && interviewed[active];
  return <aside className="village-teacher" aria-label="Teacher’s Mode">
    <h3>Teacher’s Mode</h3>
    <p>Попросите Вику задать хотя бы три самостоятельных вопроса. Сыграйте роль жителя и дайте подсказку о доме после вопросов о профессии, работе или транспорте. Вопрос с <em>Which</em> не требуется.</p>
    {active && <div className="village-controls">
      <strong>{active}{resident && resident.house ? ` · House ${resident.house}` : ''}</strong>
      {!resident && <button onClick={() => dispatch({ type: 'interview', name: active })}>Interview completed</button>}
      {resident && resident.house && <>
        {!resident.placed && <button disabled={resident.house !== profiles[active].house}
          onClick={() => dispatch({ type: 'confirmPlacement', name: active })}>Confirm placement</button>}
        {resident.placed && !resident.articles && <button
          onClick={() => dispatch({ type: 'confirmArticles', name: active })}>Confirm article challenge</button>}
        <button onClick={() => dispatch({ type: 'resetPlacement', name: active })}>Reset placement</button>
      </>}
    </div>}
    {active && <div className="village-active-notes"><h4>Case file · {active}</h4><CaseNotes name={active} /></div>}
    <details>
      <summary>Картотека всех жителей и ключ к карте</summary>
      <ul className="village-key" lang="en">{[...residents].sort((a, b) => profiles[a.name].house - profiles[b.name].house).map(({ name }) =>
        <li key={name}>House {profiles[name].house} · {name}</li>)}</ul>
      {residents.map(({ name }) => <details key={name}>
        <summary>{name}</summary>
        <CaseNotes name={name} />
      </details>)}
    </details>
    <p><strong>A / an</strong> ставим перед профессией при первом упоминании. <strong>The</strong> употребляем для уже известного жителя. Перед именем, в <em>house number four</em> и в выражениях вроде <em>by bus</em> артикля нет.</p>
    <button onClick={onReset}>Restart investigation</button>
  </aside>;
}
