import type { LessonState } from '../../data';
import { describeFrames, describeScenes, falseScenes, oralKeys, sceneIndex, townPlaces, townTransport, whoScenes } from './speaking';
import type { Scene } from './speaking';
import './speaking.css';
// Original generated atlases, with independent illustrations displayed as equal cells.
const assets={pairs:{src:'/art/lesson-0/pairs.webp',cols:2,rows:2,ratio:1.5},places:{src:'/art/lesson-0/places.webp',cols:2,rows:5,ratio:5/3},transport:{src:'/art/lesson-0/transport.webp',cols:2,rows:5,ratio:5/3}};
type Atlas=keyof typeof assets;
export function SpeakingPicture({atlas,index,alt}:{atlas:Atlas;index:number;alt:string}){
 const art=assets[atlas];
 return <div className="tb-speaking-picture" style={{aspectRatio:art.ratio}}><img src={art.src} alt={alt} loading="lazy" decoding="async" style={{width:`${art.cols*100}%`,height:`${art.rows*100}%`,left:`${-(index%art.cols)*100}%`,top:`${-Math.floor(index/art.cols)*100}%`}}/></div>;
}
function TeacherQuestions({questions}:{questions:string[]}){
 return <details className="tb-speaking-teacher" open><summary>Teacher’s questions</summary><ol>{questions.map(question=><li key={question}>{question}</li>)}</ol></details>;
}
type Props={state:LessonState;teacher:boolean;save:(key:string,value:string|boolean)=>void};
function SceneCards({scenes,atlas,state,teacher,save,answerKey}:{scenes:Scene[];atlas:'pairs'|'false';answerKey:string}&Props){
 const index=sceneIndex(scenes,state.answers[answerKey]);
 const scene=scenes[index];
 return <div className="tb-speaking-scenes"><div className="tb-scene-picker" role="group" aria-label="Выбери картинку">{scenes.map((entry,i)=><button className="btn" key={entry.id} aria-pressed={i===index} onClick={()=>save(answerKey,entry.id)}>Картинка {i+1}</button>)}</div><figure>{scene.picture?<SpeakingPicture atlas={scene.picture.atlas} index={scene.picture.index} alt={scene.alt}/>:atlas==='false' && index===2?<img className="tb-scene-full" src="/art/lesson-0/library.webp" alt={scene.alt} loading="lazy" decoding="async"/>:<SpeakingPicture atlas="pairs" index={atlas==='false'?1:index} alt={scene.alt}/> }<figcaption>Picture {index+1} / {scenes.length}</figcaption></figure>
 {scene.facts && <ol className="tb-false-facts">{scene.facts.map(fact=><li key={fact}>{fact}</li>)}</ol>}
 {teacher && scene.questions && <TeacherQuestions questions={scene.questions}/>}
 {teacher && scene.answers && <details className="tb-speaking-teacher"><summary>Варианты исправлений для учителя</summary><ol>{scene.answers.map(answer=><li key={answer}>{answer}</li>)}</ol></details>}
 </div>;
}
export function WhoIsThis(props:Props){return <><h2>Who is this?</h2><p>Рассмотри героев и ответь на вопросы учителя устно.</p><SceneCards {...props} scenes={whoScenes} atlas="pairs" answerKey={oralKeys.who}/></>;}
export function DescribeTown({state,teacher,save}:Props){
 const index=sceneIndex(describeScenes,state.answers[oralKeys.describe]),scene=describeScenes[index];
 return <><h2>Hogwarts Magic Town — Look and Describe</h2><p>Рассмотри картинку и назови место или транспорт. Расскажи учителю, что на ней изображено, используя am, is и are.</p>
 <div className="tb-scene-picker" role="group" aria-label="Выбери картинку для описания">{describeScenes.map((entry,i)=><button className="btn" key={entry.id} aria-pressed={i===index} onClick={()=>save(oralKeys.describe,entry.id)}>Картинка {i+1}</button>)}</div>
 <SpeakingPicture atlas={scene.picture!.atlas} index={scene.picture!.index} alt={scene.alt}/>
 {teacher && <><TeacherQuestions questions={scene.questions!}/><details className="tb-speaking-teacher" open><summary>Текстовые подсказки для учителя</summary><p>Попросите назвать место или транспорт, затем дать полный ответ с to be. Готовые варианты ниже — подсказки для устного ответа.</p><ul>{scene.answers!.map(answer=><li key={answer}>{answer}</li>)}</ul><p>Опоры: {describeFrames.join(' / ')}</p><p>Для am: предложите представить себя на картинке и сказать «I am here». Здесь here — «здесь». Для транспорта: on the bus / train — в автобусе / поезде; in the car / boat — в машине / лодке.</p><p>Помогите развернуть краткий ответ: «Yes, it is. This is a …» или «No, it isn’t. This is a …».</p></details></>}
 </>;
}
export function FalseFacts(props:Props){return <><h2>Find the False Facts</h2><p>Все три утверждения неверны. Посмотри на картинку и исправь их устно.</p><SceneCards {...props} scenes={falseScenes} atlas="false" answerKey={oralKeys.falseFacts}/></>;}
export function MagicTown({state,teacher,save}:Props){
 const group=state.answers[oralKeys.townGroup]==='transport'?'transport':'places';
 const words=group==='places'?townPlaces:townTransport;
 return <><h2>Hogwarts Magic Town — Look and Say</h2><p>Назови предмет или место и ответь учителю. Названия и переводы — под картинками.</p><div className="tb-town-tabs" role="group" aria-label="Раздел словаря"><button className="btn" aria-pressed={group==='places'} onClick={()=>save(oralKeys.townGroup,'places')}>Places</button><button className="btn" aria-pressed={group==='transport'} onClick={()=>save(oralKeys.townGroup,'transport')}>Transport</button></div>
 <div className="tb-town-grid">{words.map((word,i)=><article className="tb-town-word" key={word.id}><SpeakingPicture atlas={group} index={i} alt={word.alt}/><div><h3>{word.en}</h3><p lang="ru">{word.ru}</p></div>{teacher && <TeacherQuestions questions={word.questions}/>}</article>)}</div></>;
}
