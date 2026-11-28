import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { assetUrl } from '../../assetUrl';
import type { TrackId } from './audio';
import type { BlockId } from './data';
export type BookContextValue={read:(id:string)=>unknown;write:(patch:Record<string,string|number|boolean>)=>void;go:(block:BlockId)=>void;teacher:boolean};
export const BookContext=createContext<BookContextValue|null>(null);
export const useBook=()=>{const value=useContext(BookContext);if(!value)throw new Error('Missing Lesson 4 context');return value;};
export function StrongText({text}:{text:string}){return <>{text.split(/(\*\*[^*]+\*\*)/).map((part,i)=>part.startsWith('**')?<strong key={i}>{part.slice(2,-2)}</strong>:part)}</>;}
export function Exercise({id,number,instruction,children}:{id:string;number:string;instruction:string;children:ReactNode}){
 return <section className="ct-exercise" id={id} data-exercise={id} aria-labelledby={id+'-title'}><h2 id={id+'-title'}><span>{number}</span>{instruction}</h2>{children}</section>;
}
export function Field({id,label,wide=false}:{id:string;label:string;wide?:boolean}){
 const {read,write}=useBook();return <input className={`ct-gap ${wide?'ct-wide':''}`} type="text" aria-label={label} data-answer-id={id} value={typeof read(id)==='string'?read(id) as string:''} onChange={e=>write({[id]:e.target.value})} autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false}/>;
}
export function Written({id,label,rows=3}:{id:string;label:string;rows?:number}){
 const {read,write}=useBook();return <label className="ct-written"><span>{label}</span><textarea rows={rows} aria-label={label} data-answer-id={id} value={typeof read(id)==='string'?read(id) as string:''} onChange={e=>write({[id]:e.target.value})} autoCapitalize="off" autoCorrect="off" spellCheck={false}/></label>;
}
export function Select({id,label,options}:{id:string;label:string;options:readonly string[]}){
 const {read,write}=useBook();return <select aria-label={label} data-answer-id={id} value={typeof read(id)==='string'?read(id) as string:''} onChange={e=>write({[id]:e.target.value})}><option value="">—</option>{options.map(option=><option key={option} value={option}>{option}</option>)}</select>;
}
export function Choice({id,label,options}:{id:string;label:string;options:readonly string[]}){
 const {read,write}=useBook();return <span role="group" aria-label={label} className="ct-choice">{options.map((option,i)=><span key={option}>{i>0&&<span aria-hidden="true" className="ct-slash">/</span>}<button type="button" aria-pressed={read(id)===option} onClick={()=>write({[id]:read(id)===option?'':option})}>{option}</button></span>)}</span>;
}
export function Done({id,label='Done'}:{id:string;label?:string}){
 const {read,write}=useBook();return <label className="ct-done"><input type="checkbox" aria-label={label} checked={read(id)===true} onChange={e=>write({[id]:e.target.checked})}/>{label}</label>;
}
export function GapLines({id,lines,label}:{id:string;lines:readonly string[];label:string}){
 return <div className="ct-lines">{lines.map((line,i)=><p key={i}>{line.split(/(\{\{\d+(?::=[^}]+)?\}\})/g).map((part,j)=>{
 const match=part.match(/^\{\{(\d+)(?::=([^}]+))?\}\}$/);return match?<span key={j} className="ct-numbered-gap"><sup>{match[1]}</sup>{match[2]!==undefined?<span className="ct-given">{match[2]}</span>:<Field id={`${id}/${match[1]}`} label={`${label}, gap ${match[1]}`}/>}</span>:<StrongText key={j} text={part}/>;
 })}</p>)}</div>;
}
// User requested recording labels only; never render a player or synthesize audio.
export function Audio({track}:{track:TrackId}){return <p className="ct-audio" aria-label={`Required recording ${track}`}>Audio: <strong>{track}</strong></p>;}

export function BookLink({block,children}:{block:BlockId;children:ReactNode}){const {go}=useBook();return <button type="button" className="ct-book-link" onClick={()=>go(block)}>{children}</button>;}
export function OriginalReference({page}:{page:92|96}){
 const [open,setOpen]=useState(false);return <div className="ct-original-reference"><button type="button" aria-expanded={open} onClick={()=>setOpen(value=>!value)}>{open?'Close':'View'} original reference — page {page}</button>{open&&<figure><img src={assetUrl(`/art/lesson-4/textbook/p${page}-reference.webp`)} alt={`Original Grammar Bank reference, page ${page}`} loading="lazy"/><figcaption>Speakout Third Edition A1 Student’s Book · page {page}</figcaption><a href={assetUrl(`/art/lesson-4/textbook/p${page}-reference.webp`)} target="_blank" rel="noreferrer">Open full-size reference</a></figure>}</div>;
}
