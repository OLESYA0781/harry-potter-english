import {BookOpen,KeyRound,Moon,Feather,Ear,WandSparkles,Check,Sparkles} from 'lucide-react';
import {assetUrl} from '../../assetUrl';
import {rooms} from './data';
const icons=[BookOpen,WandSparkles,Ear,Feather,Moon,KeyRound];
export default function HouseScene({completed,opening,onOpen}:{completed:boolean[];opening:number|null;onOpen:(index:number)=>void}){
 return <div className="mh-house-scene"><img className="mh-house-art" src={assetUrl('/art/lesson-2/mystery-house.webp')} alt="Тёплый сказочный дом Хогвартса с шестью арочными дверями на двух этажах, золотыми фонарями и изумрудной крышей."/>
 {rooms.map((room,index)=>{const Icon=icons[index],done=completed[index];return <button key={room.id} type="button" className={`mh-door ${done?'mh-door-done':''} ${opening===index?'mh-door-opening':''}`} style={{left:`${[17.2,42.2,67.1][index%3]}%`,top:index<3?'33.5%':'62.5%',height:index<3?'15.8%':'22.2%','--door-color':room.color} as React.CSSProperties} aria-label={`Door ${index+1} — ${room.title}${done?' — пройдена':''}`} aria-busy={opening===index} disabled={opening!==null} onClick={()=>onOpen(index)}><span className="mh-door-interior"><Sparkles/><span>✦</span></span><span className="mh-door-leaf"><span className="mh-door-number">{String(index+1).padStart(2,'0')}</span><Icon className="mh-door-emblem"/><span className="mh-door-knob"/></span><span className="mh-door-status">{done?<Check aria-label="Пройдена"/>:<span>✦</span>}</span></button>;})}
 </div>;
}
