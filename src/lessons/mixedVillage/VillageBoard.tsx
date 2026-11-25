import { useRef, useState } from 'react';
import {
  DndContext, DragOverlay, MouseSensor, pointerWithin, useDraggable, useDroppable, useSensor, useSensors,
} from '@dnd-kit/core';
import { assetUrl } from '../../assetUrl';
import { Character } from '../../Art';
import { houseNumbers, residents } from './data';
import type { HouseNumber, Resident, ResidentName } from './data';
import type { Investigation, VillageAction } from './model';

export function ResidentPortrait({ resident }: { resident: Resident }) {
  const { portrait } = resident;
  if (portrait === 'ron') return <div className="village-portrait village-ron" aria-hidden="true"><Character name="Ron" /></div>;
  if (typeof portrait === 'number') return <div className="village-portrait" aria-hidden="true" style={{
    backgroundImage: `url(${assetUrl('/art/lesson-2/mystery-jobs.webp')})`,
    backgroundSize: '400% 200%',
    backgroundPosition: `${(portrait % 4) / 3 * 100}% ${Math.floor(portrait / 4) * 100}%`,
  }} />;
  return <img className="village-portrait" alt="" width={384} height={384}
    src={assetUrl(portrait === 'office' ? '/art/lesson-2/quest/office-worker.webp' : '/art/lesson-3/jane.webp')} />;
}

function ResidentCard({ resident, active, movable, choose }: {
  resident: Resident;
  active: boolean;
  movable: boolean;
  choose: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: resident.name,
    disabled: !movable,
  });
  return <button type="button" ref={setNodeRef} {...(movable ? attributes : {})} {...listeners}
    className={`village-resident ${movable ? 'village-movable' : ''}`}
    aria-label={resident.name} aria-pressed={active} data-dragging={isDragging} onClick={choose}>
    <ResidentPortrait resident={resident} />
    <strong>{resident.name}</strong>
  </button>;
}

// Coordinates are percentages on the single village illustration.
const locations = [
  [18.7, 39, 9.8, 27], [42.9, 39, 34.6, 28], [55.8, 39, 65.1, 27], [80.9, 39, 88.6, 27],
  [21.2, 84, 12.2, 72], [38.8, 84, 32.6, 73], [61.6, 84, 55, 73], [85.3, 84, 79.9, 74],
];

function House({ number, occupant, ready, complete, place }: {
  number: HouseNumber;
  occupant?: ResidentName;
  ready: boolean;
  complete: boolean;
  place: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: number, disabled: !!occupant });
  const [left, top, windowX, windowY] = locations[number - 1];
  return <>
    {complete && <span className="village-window" style={{ left: `${windowX}%`, top: `${windowY}%` }} />}
    <div ref={setNodeRef} className="village-house-target" style={{ left: `calc(${left}% - 6%)`, top: `calc(${top}% - 13%)` }}>
      <button type="button" className="village-house" data-over={isOver} data-ready={ready}
        aria-disabled={!ready} aria-label={`House ${number}${occupant ? `, ${occupant}` : ''}`}
        onClick={() => { if (ready) place(); }}>
        <span className="village-number">{number}</span>
        <span className="village-plaque">{occupant || '—'}</span>
      </button>
    </div>
  </>;
}

export default function VillageBoard({ progress, complete, dispatch }: {
  progress: Investigation;
  complete: boolean;
  dispatch: (action: VillageAction) => void;
}) {
  const [dragging, setDragging] = useState<ResidentName>();
  const [announcement, setAnnouncement] = useState('');
  const map = useRef<HTMLDivElement>(null);
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 7 } }));
  const { active, interviewed } = progress;
  const movable = (name: ResidentName) => !!interviewed[name] && !interviewed[name]?.placed;
  const dragResident = residents.find(resident => resident.name === dragging);
  const armed = active && movable(active);
  const occupantOf = (house: HouseNumber) => residents.find(({ name }) => interviewed[name]?.house === house)?.name;
  const move = (name: ResidentName, house: HouseNumber) => {
    if (!movable(name) || occupantOf(house)) return;
    dispatch({ type: 'move', name, house });
    setAnnouncement(`${name} · House ${house}`);
  };

  return <DndContext sensors={sensors} collisionDetection={pointerWithin}
    accessibility={{ screenReaderInstructions: { draggable: 'Выберите жителя, затем нажмите на подходящий дом.' } }}
    onDragStart={({ active }) => { setDragging(active.id as ResidentName); setAnnouncement(''); }}
    onDragCancel={() => setDragging(undefined)}
    onDragEnd={({ active, over }) => {
      setDragging(undefined);
      if (over) move(active.id as ResidentName, over.id as HouseNumber);
    }}>
    <div className="village-board">
      <section className="village-map-panel" aria-labelledby="village-map-title">
        <h3 id="village-map-title">Find the House</h3>
        <p>После интервью перетащи карточку к дому или нажми на карточку, затем на дом.</p>
        <div ref={map} className="village-map-scroll" role="region" aria-label="Карта деревни" tabIndex={0}>
          <div className={`village-map ${complete ? 'village-lit' : ''}`}>
            <img className="village-landscape" src={assetUrl('/art/lesson-3/village.webp')} alt="Восемь домов на общей улице волшебной деревни" />
            {houseNumbers.map(number => {
              const occupant = occupantOf(number);
              return <House key={number} number={number} occupant={occupant} complete={complete}
                ready={!!armed && !occupant} place={() => active && move(active, number)} />;
            })}
            {complete && <div className="village-lights" aria-hidden="true" />}
          </div>
        </div>
        <p className="village-map-hint">Прокрути карту вбок, чтобы увидеть все дома.</p>
      </section>
      <section className="village-residents-panel" aria-labelledby="village-residents-title">
        <h3 id="village-residents-title">Choose a Resident</h3>
        <div className="village-residents">
          {residents.map(resident => <ResidentCard key={resident.name} resident={resident}
            active={active === resident.name} movable={movable(resident.name)}
            choose={() => { setAnnouncement(''); dispatch({ type: 'choose', name: resident.name }); }} />)}
        </div>
        {armed && <button className="village-map-jump" onClick={() => {
          map.current?.focus({ preventScroll: true });
          map.current?.scrollIntoView({ block: 'center' });
        }}>К карте · {active}</button>}
      </section>
    </div>
    <span className="village-sr-only" role="status">{announcement}</span>
    <DragOverlay dropAnimation={null}>{dragResident && <div className="village-drag-preview">
      <ResidentPortrait resident={dragResident} /><strong>{dragResident.name}</strong>
    </div>}</DragOverlay>
  </DndContext>;
}
