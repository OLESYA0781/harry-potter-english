import { useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { cellId, key, placeWord } from './model';
import { people, tableRows, wordBank } from './data';

function Word({ word, selected, used, onClick }: { word: string; selected: boolean; used: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: word });
  return <button type="button" ref={setNodeRef} {...attributes} {...listeners} className="hw3-word"
    aria-label={`Choose ${word}`} aria-pressed={selected} data-used={used}
    style={{ transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined, zIndex: isDragging ? 5 : undefined }} onClick={onClick}>{word}</button>;
}
function Cell({ id, label, value, onPlace, onClear }: { id: string; label: string; value: string; onPlace: () => void; onClear: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return <div ref={setNodeRef} className={`hw3-cell ${isOver ? 'hw3-over' : ''}`}>
    <button type="button" aria-label={`${label}: ${value || 'empty'}`} onClick={onPlace}>{value || '___'}</button>
    {value && <button type="button" className="hw3-clear" aria-label={`Clear ${label}`} onClick={onClear}>×</button>}
  </div>;
}
export default function WordTable({ answers, save }: { answers: Record<string, unknown>; save: (patch: Record<string, string>) => void }) {
  const [selected, setSelected] = useState('');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }), useSensor(KeyboardSensor, { keyboardCodes: { start: ['Space'], end: ['Space'], cancel: ['Escape'] } }));
  function place(word: string, id: string) { save(placeWord(answers, word, id)); setSelected(''); }
  return <DndContext sensors={sensors} onDragEnd={({ active, over }) => {
    if (over && wordBank.includes(String(active.id) as typeof wordBank[number])) place(String(active.id), String(over.id));
  }}>
    <div className="hw3-word-bank" aria-label="Word bank">{wordBank.map(word => <Word key={word} word={word} selected={selected === word}
      used={Object.entries(answers).some(([id, value]) => id.startsWith(key('listening/table/')) && value === word)} onClick={() => setSelected(previous => previous === word ? '' : word)} />)}</div>
    <p className="hw3-control-note">Перетащи слово в ячейку или нажми на слово, затем на ячейку. × удаляет выбранный ответ.</p>
    <table className="hw3-table"><caption className="vocab-sr-only">My Top Three Things — Ralph and Yolanda</caption>
      <thead><tr><th scope="col"><span className="vocab-sr-only">Information</span></th>{people.map(person => <th scope="col" key={person}>{person}</th>)}</tr></thead>
      <tbody>{tableRows.map((row, r) => <tr key={row}><th scope="row">{row}</th>{people.map((person, p) => {
        const id = cellId(r, p), value = typeof answers[key(id)] === 'string' ? answers[key(id)] as string : '';
        return <td key={person}><Cell id={id} label={`${person}, ${row}`} value={value} onPlace={() => { if (selected) place(selected, id); }} onClear={() => save({ [id]: '' })} /></td>;
      })}</tr>)}</tbody>
    </table>
  </DndContext>;
}
