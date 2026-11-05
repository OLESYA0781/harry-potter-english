import { useRef } from 'react';
import { SpeakingPicture } from '../toBe/Speaking';
import { drawPicture, freshTravelState, pictureSets, readTravelState } from './travelRandomizer';
import type { PictureKind, TravelState } from './travelRandomizer';

export default function TravelRandomizer({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  const current = useRef<TravelState | null>(null);
  current.current = readTravelState(value) || current.current || freshTravelState();
  const roll = (kind: PictureKind) => {
    current.current = drawPicture(current.current!, kind);
    onChange(JSON.stringify(current.current));
  };
  return <div className="ps2-randomizers" role="group" aria-label="Transport and place picture randomizers">
    {(['transport', 'places'] as const).map(kind => {
      const index = pictureSets[kind].findIndex(word => word.id === current.current![kind].current);
      return <button type="button" className="ps2-picture-randomizer" key={kind} aria-label={kind === 'transport' ? 'Next transport picture' : 'Next place picture'} onClick={() => roll(kind)}><SpeakingPicture atlas={kind} index={index} alt={pictureSets[kind][index].alt} /></button>;
    })}
  </div>;
}
