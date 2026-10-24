import { useState } from "react";
import { IllustratedText } from "./Art";
import type { ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
function Tile({
  id,
  children,
  onClick,
}: {
  id: string;
  children: ReactNode;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });
  return (
    <button
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`drag-tile ${isDragging ? "dragging" : ""}`}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px,${transform.y}px,0)`
          : undefined,
      }}
    >
      {children}
    </button>
  );
}
function Target({
  id,
  children,
  onClick,
}: {
  id: string;
  children: ReactNode;
  onClick: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <button
      type="button"
      ref={setNodeRef}
      onClick={onClick}
      className={`drop-target ${isOver ? "over" : ""}`}
    >
      {children}
    </button>
  );
}
export function Order({
  words,
  value,
  onChange,
  onCheck,
}: {
  words: string[];
  value: number[];
  onChange: (v: number[]) => void;
  onCheck: (ok: boolean) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 7 } }),
    useSensor(KeyboardSensor),
  );
  const available = words
    .map((_, i) => i)
    .filter((i) => !value.includes(i))
    .sort(
      (a, b) => ((a * 7 + 3) % words.length) - ((b * 7 + 3) % words.length),
    );
  function drop(e: DragEndEvent) {
    if (e.over) {
      const n = Number(e.active.id);
      const next = value.filter((i) => i !== n);
      if (e.over.id === "answer") next.push(n);
      else if (String(e.over.id).startsWith("pos"))
        next.splice(Number(String(e.over.id).slice(3)), 0, n);
      onChange(next);
    }
  }
  return (
    <DndContext sensors={sensors} onDragEnd={drop}>
      <p className="micro">
        Drag the cards, or tap them to move. Use ← → to change the order.
      </p>
      <div className="word-bank">
        {available.map((i) => (
          <Tile key={i} id={String(i)} onClick={() => onChange([...value, i])}>
            <IllustratedText text={words[i]} />
          </Tile>
        ))}
      </div>
      <div className="answer-slots">
        <Target id="answer" onClick={() => {}}>
          Drop your cards here ↓
        </Target>
        {value.map((i, p) => (
          <div className="ordered" key={i}>
            <Target
              id={`pos${p}`}
              onClick={() => onChange(value.filter((v) => v !== i))}
            >
              <IllustratedText text={words[i]} />{" "}
              <span aria-label="remove">×</span>
            </Target>
            <div className="reorder">
              <button
                aria-label={`Move ${words[i]} left`}
                disabled={p === 0}
                onClick={() => {
                  const a = [...value];
                  [a[p - 1], a[p]] = [a[p], a[p - 1]];
                  onChange(a);
                }}
              >
                ←
              </button>
              <button
                aria-label={`Move ${words[i]} right`}
                disabled={p === value.length - 1}
                onClick={() => {
                  const a = [...value];
                  [a[p + 1], a[p]] = [a[p], a[p + 1]];
                  onChange(a);
                }}
              >
                →
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        className="btn small"
        disabled={value.length !== words.length}
        onClick={() => onCheck(value.every((v, i) => v === i))}
      >
        <IllustratedText text="Check my order ✨" />
      </button>
      <button className="text-btn" onClick={() => onChange([])}>
        Clear cards
      </button>
    </DndContext>
  );
}
export function Match({
  sources,
  targets,
  values,
  onChange,
  onCheck,
  bag = false,
  checkLabel = "Check my answers ✨",
}: {
  sources: { id: string; label: ReactNode }[];
  targets: { id: string; label: ReactNode }[];
  values: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  onCheck: () => void;
  bag?: boolean;
  checkLabel?: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 7 } }),
    useSensor(KeyboardSensor),
  );
  const place = (id: string, target: string) => {
    onChange({ ...values, [id]: target });
    setSelected(null);
  };
  return (
    <DndContext
      sensors={sensors}
      onDragEnd={(e) => {
        if (e.over) place(String(e.active.id), String(e.over.id));
      }}
    >
      <p className="micro">
        Drag a card, or tap a card and then its place.{" "}
        {selected ? "Now choose a place." : ""}
      </p>
      <div className="word-bank">
        {sources
          .filter((s) => !values[s.id])
          .map((s) => (
            <div
              className={selected === s.id ? "selected-source" : ""}
              key={s.id}
            >
              <Tile id={s.id} onClick={() => setSelected(s.id)}>
                {typeof s.label === "string" ? (
                  <IllustratedText text={s.label} />
                ) : (
                  s.label
                )}
              </Tile>
            </div>
          ))}
      </div>
      <div className={bag ? "bag-targets" : "match-targets"}>
        {targets.map((t) => (
          <div key={t.id}>
            <Target id={t.id} onClick={() => selected && place(selected, t.id)}>
              {t.label}
            </Target>
            <div className="placed">
              {sources
                .filter((s) => values[s.id] === t.id)
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      const next = { ...values };
                      delete next[s.id];
                      onChange(next);
                    }}
                  >
                    {typeof s.label === "string" ? (
                      <IllustratedText text={s.label} />
                    ) : (
                      s.label
                    )}{" "}
                    ×
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
      <button className="btn small" onClick={onCheck}>
        <IllustratedText text={checkLabel} />
      </button>
      <button className="text-btn" onClick={() => onChange({})}>
        Try again
      </button>
    </DndContext>
  );
}
export function Choice({
  id,
  q,
  options,
  value,
  correct,
  onSelect,
  teacher = false,
}: {
  id: string;
  q: string;
  options: ReactNode[];
  value: unknown;
  correct: number;
  onSelect: (n: number) => void;
  teacher?: boolean;
}) {
  return (
    <fieldset className="choice">
      <legend>{q}</legend>
      <div className="choices">
        {options.map((o, i) => (
          <button
            type="button"
            key={i}
            className={`${value === i ? "chosen" : ""} ${value === i && i === correct ? "correct" : ""}`}
            onClick={() => onSelect(i)}
          >
            {o}
          </button>
        ))}
      </div>
      {typeof value === "number" && (
        <p
          className={value === correct ? "feedback good" : "feedback"}
          role="status"
        >
          {value === correct
            ? "✦ Well done!"
            : "A little more magic… Try again!"}
        </p>
      )}
      {teacher && (
        <p className="teacher-note">
          Ответ: {options[correct]} · {id}
        </p>
      )}
    </fieldset>
  );
}
