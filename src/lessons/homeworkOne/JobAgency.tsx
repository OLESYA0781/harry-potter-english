import {useState,type ReactNode} from 'react';
import {DndContext,DragOverlay,MouseSensor,TouchSensor,pointerWithin,useDraggable,useDroppable,useSensor,useSensors} from '@dnd-kit/core';
import type {DragEndEvent} from '@dnd-kit/core';
import {X} from 'lucide-react';
import {agencyDescriptions,agencyJobs} from './data';
import {shuffleJobs,type AgencyState} from './model';

function JobCard({id,selected,onSelect}:{id:string;selected:boolean;onSelect:()=>void}){
 const job=agencyJobs.find(item=>item.id===id)!;
 const {setNodeRef,attributes,listeners,isDragging}=useDraggable({id:`job:${id}`});
 return <button type="button" ref={setNodeRef} {...attributes} {...listeners} className={`hw1-job-card ${selected?'selected':''} ${isDragging?'dragging':''}`} aria-label={`Select ${job.label}`} aria-pressed={selected} onClick={onSelect}>{job.label}</button>;
}
function DropSlot({id,index,job,selected,onSelect,onPlace,onReturn}:{id:string;index:number;job?:string;selected:string|null;onSelect:(id:string)=>void;onPlace:()=>void;onReturn:()=>void}){
 const {setNodeRef,isOver}=useDroppable({id:`slot:${id}`});
 return <div className={`hw1-dropzone ${isOver?'over':''}`} ref={setNodeRef} data-slot={id}>
 {job&&<div className="hw1-placed"><JobCard id={job} selected={selected===job} onSelect={()=>onSelect(job)}/><button type="button" className="hw1-return" aria-label={`Return ${agencyJobs.find(item=>item.id===job)!.label} to the bank`} onClick={onReturn}><X size={21} aria-hidden="true"/></button></div>}
 <button type="button" className="hw1-place-button" disabled={!selected} aria-label={`Place selected job in description ${index+1}`} onClick={onPlace}>{selected?'Place selected job here':job?'Choose a card to change':'Drop a job here'}</button>
 </div>;
}
function WordBank({children}:{children:ReactNode}){const {setNodeRef,isOver}=useDroppable({id:'bank'});return <aside className={`hw1-job-bank ${isOver?'over':''}`} ref={setNodeRef} aria-label="Job word bank">{children}</aside>;}
export default function JobAgency({value,onMove}:{value:AgencyState;onMove:(job:string,slot:string|null)=>void}){
 const [order]=useState(shuffleJobs),[selected,setSelected]=useState<string|null>(null),[dragging,setDragging]=useState<string|null>(null);
 const sensors=useSensors(useSensor(MouseSensor,{activationConstraint:{distance:7}}),useSensor(TouchSensor,{activationConstraint:{delay:180,tolerance:8}}));
 const select=(id:string)=>setSelected(current=>current===id?null:id);
 const move=(job:string,slot:string|null)=>{onMove(job,slot);setSelected(null);};
 const drop=(event:DragEndEvent)=>{setDragging(null);if(!event.over)return;const job=String(event.active.id).replace(/^job:/,'');const target=String(event.over.id);if(target==='bank')move(job,null);else if(target.startsWith('slot:'))move(job,target.slice(5));};
 const used=Object.values(value.placements);
 return <DndContext accessibility={{screenReaderInstructions:{draggable:'Press Enter to select a job, then activate a description to place it. Use the return button to put a job back.'}}} sensors={sensors} collisionDetection={pointerWithin} onDragStart={event=>{setSelected(null);setDragging(String(event.active.id).replace(/^job:/,''));}} onDragCancel={()=>setDragging(null)} onDragEnd={drop}>
 <p className="hw1-tap-help" lang="ru">Перетащи карточку или выбери её нажатием, затем нажми на место под описанием. Крестик возвращает профессию в банк слов.</p>
 <div className="hw1-selection" role="status" aria-live="polite">{selected?<><strong>{agencyJobs.find(job=>job.id===selected)!.label}</strong><span> — выбери описание</span><button type="button" aria-label="Cancel selected job" onClick={()=>setSelected(null)}><X size={20} aria-hidden="true"/></button></>:<span>Choose a job card</span>}</div>
 <div className="hw1-agency-grid"><WordBank><h3>Job cards</h3><div>{order.filter(job=>!used.includes(job.id)).map(job=><JobCard key={job.id} id={job.id} selected={selected===job.id} onSelect={()=>select(job.id)}/>)}</div>{!order.some(job=>!used.includes(job.id))&&<p>All cards are placed.</p>}<button type="button" className="hw1-bank-return" disabled={!selected} onClick={()=>selected&&move(selected,null)}>Return selected card</button></WordBank>
 <div className="hw1-descriptions">{agencyDescriptions.map((description,index)=><article className="hw1-description" key={description.id}><p><span className="hw1-sentence-number">{index+1}</span><span>{description.text}</span></p><DropSlot id={description.id} index={index} job={value.placements[description.id]} selected={selected} onSelect={select} onPlace={()=>selected&&move(selected,description.id)} onReturn={()=>move(value.placements[description.id],null)}/></article>)}</div></div>
 <DragOverlay dropAnimation={null}>{dragging?<span className="hw1-job-card hw1-drag-overlay" aria-hidden="true">{agencyJobs.find(job=>job.id===dragging)?.label}</span>:null}</DragOverlay>
 </DndContext>;
}
