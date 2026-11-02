import { assetUrl } from './assetUrl';
import { useState } from "react";
import { people } from "./data";
const areas = [
  { left: 5, top: 49, width: 26, height: 34 },
  { left: 27, top: 15, width: 25, height: 40 },
  { left: 32, top: 47, width: 23, height: 36 },
  { left: 3, top: 10, width: 22, height: 44 },
  { left: 61, top: 17, width: 37, height: 34 },
  { left: 62, top: 43, width: 29, height: 41 },
];
export default function CommonRoomScene({
  activePerson,
  onSelect,
}: {
  activePerson: number;
  onSelect: (index: number) => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  return (
    <section className="room-illustration">
      <div className="room-illustration-heading">
        <span className="eyebrow">THE COMMON ROOM</span>
        <button
          className="pill"
          aria-pressed={zoomed}
          onClick={() => setZoomed(!zoomed)}
        >
          {zoomed ? "Zoom out" : "Zoom in"}
        </button>
      </div>
      <p className="micro">
        Tap a friend to choose them.{" "}
        {zoomed
          ? "Swipe sideways to look around."
          : "You can zoom in to see more."}
      </p>
      <div
        className="room-panorama"
        tabIndex={zoomed ? 0 : undefined}
        aria-label="Common room picture"
      >
        <div className={`room-scene ${zoomed ? "zoomed" : ""}`}>
          <img
            src={assetUrl('/art/common-room.webp')}
            width="1536"
            height="1024"
            alt="Six friends together in one cosy common room: Harry is drinking tea, Hermione is reading a book, Ron is eating a sandwich, Draco is playing with a ball, Hagrid is sleeping on a sofa and Dumbledore is writing a letter."
            draggable={false}
          />
          {people.map((name, i) => (
            <button
              type="button"
              key={name}
              className={`room-character-hotspot ${activePerson === i ? "selected" : ""}`}
              aria-label={`Choose ${name} in the common room`}
              aria-pressed={activePerson === i}
              style={{
                left: `${areas[i].left}%`,
                top: `${areas[i].top}%`,
                width: `${areas[i].width}%`,
                height: `${areas[i].height}%`,
              }}
              onClick={() => onSelect(i)}
            >
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
