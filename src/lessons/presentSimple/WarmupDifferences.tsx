import {assetUrl} from '../../assetUrl';
import DifferencePicture,{type DifferenceArea} from '../../DifferencePicture';
import {discoverDifference,readWarmup,restartWarmup,warmupDifferenceIds} from './warmupState';

// Background and shared cutout atlas make all non-difference pixels identical.
// Coordinates are in percentages of the uncropped square room, never viewport pixels.
export const warmupAreas:Record<'A'|'B',DifferenceArea[]>={
 A:[{left:34,top:79,width:20,height:20},{left:3,top:81,width:29,height:18},{left:34,top:51,width:15,height:15},{left:7,top:48,width:23,height:21},{left:48,top:51,width:33,height:14},{left:52,top:1,width:19,height:23},{left:73,top:63,width:26,height:27}],
 B:[{left:63,top:34,width:21,height:17},{left:3,top:81,width:29,height:18},{left:54,top:84,width:15,height:15},{left:7,top:48,width:23,height:21},{left:48,top:51,width:33,height:14},{left:52,top:1,width:19,height:23},{left:73,top:63,width:26,height:27}],
};
type Piece={cell:number;left:number;top:number;width:number;kind:string;clip?:string};
export const warmupPieces=(variant:'A'|'B'):Piece[]=>[
 {cell:6,left:53,top:2,width:17,kind:'picture'},
 {cell:0,left:2,top:48,width:32,kind:'ron-body',clip:'inset(46% 0 0 0)'},
 {cell:variant==='A'?0:1,left:2,top:48,width:32,kind:'ron-face',clip:'inset(0 0 54% 0)'},
 ...(variant==='A'?[{cell:2,left:73,top:59,width:26,kind:'hermione'}]:[]),
 {cell:5,left:48,top:51,width:12,kind:'book'},
 {cell:5,left:58,top:51,width:12,kind:'book'},
 ...(variant==='B'?[{cell:5,left:68,top:51,width:12,kind:'book'},{cell:7,left:4,top:76,width:28,kind:'clutter'}]:[]),
 {cell:4,left:variant==='A'?35:55,top:variant==='A'?51:84,width:13,kind:'cup'},
 {cell:3,left:variant==='A'?35:64,top:variant==='A'?79:34,width:20,kind:'cat'},
].filter(piece=>piece.kind!=='picture'||variant==='A');
export const warmupSpeaking=[
 ['Where is the cat in Picture A?','The cat is on the floor in Picture A.'],
 ['Where is the cat in Picture B?','The cat is on the sofa in Picture B.'],
 ['Is the room clean in Picture A?','The room is clean in Picture A.'],
 ['Is Ron tired in Picture A?','Ron is tired in Picture A.'],
 ['Where is the cup of tea?','The cup of tea is on the table in Picture A and on the floor in Picture B.'],
 ['Are there two or three books on the table?','There are two books in Picture A and three books in Picture B.'],
 ["Is Hermione in Picture B?","No, Hermione isn't in Picture B."],
];
export default function WarmupDifferences({value,onChange,teacher}:{value:string|undefined;onChange:(update:(previous:string|undefined)=>string)=>void;teacher:boolean}){
 const round=readWarmup(value),found=round.found.map(id=>warmupDifferenceIds.indexOf(id));
 return <div className="ps2-warmup"><p className="ps2-warmup-time">Two Magical Rooms at Hogwarts · 5–7 minutes</p><p>Find 7 differences and describe them using the verb to be.</p><div className="difference-counter" role="status" aria-live="polite">{found.length} / 7 differences found</div><div className="differences-pair">{(['A','B'] as const).map(variant=><DifferencePicture key={variant} variant={variant} count={7} found={found} areas={warmupAreas[variant]} onFind={index=>onChange(previous=>discoverDifference(previous,index))} sceneClassName="ps2-warmup-scene" sceneStyle={{backgroundImage:`url("${assetUrl('/art/lesson-1/warmup-room.webp')}")`}} description={`Picture ${variant}: a cozy Hogwarts room. Find seven differences.`}>{warmupPieces(variant).map((piece,index)=><span key={`${piece.kind}-${index}`} aria-hidden="true" className="ps2-warmup-piece" data-piece={piece.kind} style={{clipPath:piece.clip,left:`${piece.left}%`,top:`${piece.top}%`,width:`${piece.width}%`,backgroundImage:`url("${assetUrl(piece.kind==='clutter'?'/art/lesson-1/warmup-mess.webp':'/art/lesson-1/warmup-pieces.webp')}")`,backgroundSize:piece.kind==='clutter'?'100% 100%':undefined,backgroundPosition:piece.kind==='clutter'?'center':`${piece.cell%3*50}% ${Math.floor(piece.cell/3)*50}%`}}/>)}</DifferencePicture>)}</div>{found.length===7&&<p className="ps2-finish" role="status">Amazing! You found all 7 differences!</p>}<button className="ps2-button" onClick={()=>onChange(restartWarmup)}>Play Again</button>{teacher&&found.length===7&&<section className="ps2-warmup-speaking" aria-label="Teacher speaking practice"><h3>Let’s Talk About the Pictures!</h3><p>Попросите отвечать устно полными предложениями. Повторяем to be, on и in; новые правила Present Simple здесь не нужны.</p><ol>{warmupSpeaking.map(([question,hint])=><li key={question}><strong>{question}</strong><p>{hint}</p></li>)}</ol></section>}</div>;
}
