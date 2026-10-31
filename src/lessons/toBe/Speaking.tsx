import type { LessonState } from '../../data';
import { falseScenes, oralKeys, roomQuestions, townPlaces, townTransport, whoScenes, wordKey } from './speaking';
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
 const index=Math.max(0,scenes.findIndex(scene=>scene.id===state.answers[answerKey]));
 const scene=scenes[index];
 return <div className="tb-speaking-scenes"><div className="tb-scene-picker" role="group" aria-label="Выбери картинку">{scenes.map((entry,i)=><button className="btn" key={entry.id} aria-pressed={i===index} onClick={()=>save(answerKey,entry.id)}>Картинка {i+1}</button>)}</div><figure>{atlas==='false' && index>0?<img className="tb-scene-full" src={index===1?'/art/common-room.webp':'/art/lesson-0/library.webp'} alt={scene.alt} loading="lazy" decoding="async"/>:<SpeakingPicture atlas="pairs" index={atlas==='false'?1:index} alt={scene.alt}/>}<figcaption>Picture {index+1} / {scenes.length}</figcaption></figure>
 {scene.facts && <ol className="tb-false-facts">{scene.facts.map(fact=><li key={fact}>{fact}</li>)}</ol>}
 {teacher && scene.questions && <TeacherQuestions questions={scene.questions}/>}
 {teacher && scene.answers && <details className="tb-speaking-teacher"><summary>Варианты исправлений для учителя</summary><ol>{scene.answers.map(answer=><li key={answer}>{answer}</li>)}</ol></details>}
 </div>;
}
export function WhoIsThis(props:Props){return <><h2>Who is this?</h2><p>Рассмотри героев и ответь на вопросы учителя устно.</p><SceneCards {...props} scenes={whoScenes} atlas="pairs" answerKey={oralKeys.who}/></>;}
export function MysteriousRoom({teacher}:Pick<Props,'teacher'>){return <><h2>The Mysterious Hogwarts Room</h2><p>Рассмотри комнату и расскажи учителю, что ты видишь.</p><img className="tb-room-picture" src="/art/lesson-0/room.webp" alt="A bright Hogwarts room: books and a wand on a table, an owl beside the window, three chairs, an armchair and a cat near the fireplace. A town and transport are visible outside." loading="lazy" decoding="async"/>{teacher && <TeacherQuestions questions={roomQuestions}/>}</>;}
export function FalseFacts(props:Props){return <><h2>Find the False Facts</h2><p>Все три утверждения неверны. Посмотри на картинку и исправь их устно.</p><SceneCards {...props} scenes={falseScenes} atlas="false" answerKey={oralKeys.falseFacts}/></>;}
export function MagicTown({state,teacher,save}:Props){
 const group=state.answers[oralKeys.townGroup]==='transport'?'transport':'places';
 const words=group==='places'?townPlaces:townTransport;
 return <><h2>Hogwarts Magic Town — Look and Say</h2><p>Нажми на картинку, чтобы открыть название и перевод. Назови предмет или место и ответь учителю.</p><div className="tb-town-tabs" role="group" aria-label="Раздел словаря"><button className="btn" aria-pressed={group==='places'} onClick={()=>save(oralKeys.townGroup,'places')}>Places</button><button className="btn" aria-pressed={group==='transport'} onClick={()=>save(oralKeys.townGroup,'transport')}>Transport</button></div>
 <div className="tb-town-grid">{words.map((word,i)=>{const revealed=state.answers[wordKey(word.id)]===true;return <article className="tb-town-word" key={word.id}><button className="tb-town-reveal" aria-label={`${revealed?'Скрыть':'Открыть'} слово ${i+1}`} aria-expanded={revealed} aria-controls={`tb-town-${word.id}`} onClick={()=>save(wordKey(word.id),!revealed)}><SpeakingPicture atlas={group} index={i} alt={word.alt}/><span aria-hidden="true">{revealed?'Скрыть название':'Открыть название'}</span></button><div id={`tb-town-${word.id}`} hidden={!revealed}><h3>{word.en}</h3><p lang="ru">{word.ru}</p></div>{teacher && <TeacherQuestions questions={word.questions}/>}</article>;})}</div></>;
}
