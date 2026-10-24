import type { CSSProperties } from "react";
const people = ["Harry", "Hermione", "Ron", "Draco", "Hagrid", "Dumbledore"];
const actions = [
  "drinking tea",
  "reading a book",
  "eating a sandwich",
  "playing with a ball",
  "sleeping on a sofa",
  "writing a letter",
];
/** Generated illustration atlases are local, compressed assets. Each cell is
 * displayed without stretching; numeric cells keep saved lesson answers stable. */
export function Character({
  name = "Harry",
  action = false,
}: {
  name?: string;
  action?: boolean;
}) {
  const person = Math.max(0, people.indexOf(name));
  const cell = person + (action ? 6 : 0);
  // The generated action rows have different heights: use their measured bounds.
  const [top, height] = [
    [0, 315],
    [315, 312],
    [627, 273],
    [900, 354],
  ][Math.floor(cell / 3)];
  return (
    <span
      role="img"
      aria-label={`${name}${action ? ` ${actions[person]}` : ""}`}
      className="character-art"
      style={{
        aspectRatio: `418 / ${height}`,
        backgroundSize: `300% ${(1254 / height) * 100}%`,
        backgroundPosition: `${(cell % 3) * 50}% ${(top / (1254 - height)) * 100}%`,
      }}
    />
  );
}
export function Castle() {
  return (
    <span
      role="img"
      aria-label="A warmly lit magical school castle under the moon, in a cinematic 3D storybook style"
      className="castle-art"
    />
  );
}
export const artCells: Record<string, number> = {
  book: 0,
  pen: 1,
  pencil: 2,
  ruler: 3,
  notebook: 4,
  apple: 5,
  sandwich: 6,
  phone: 7,
  ball: 8,
  breakfast: 9,
  pizza: 10,
  pancakes: 11,
  cereal: 12,
  milk: 13,
  juice: 14,
  tea: 15,
  water: 16,
  lunch: 17,
  tv: 18,
  football: 19,
  swimming: 20,
  morning: 21,
  school: 22,
  homework: 23,
  moon: 24,
  trophy: 25,
  bag: 26,
  speaking: 27,
  star: 28,
  wand: 29,
  amazing: 30,
  happy: 31,
  good: 32,
  tired: 33,
  sad: 34,
  books: 35,
};
const emojiArt: Record<string, string> = {
  "📕": "book",
  "📖": "book",
  "🖊": "pen",
  "✏": "pencil",
  "📏": "ruler",
  "📓": "notebook",
  "🍎": "apple",
  "🥪": "sandwich",
  "📱": "phone",
  "⚽": "football",
  "🍳": "breakfast",
  "🍕": "pizza",
  "🥞": "pancakes",
  "🥣": "cereal",
  "🥛": "milk",
  "🍊": "juice",
  "🍵": "tea",
  "☕": "tea",
  "💧": "water",
  "🍗": "lunch",
  "📺": "tv",
  "🏊": "swimming",
  "🌅": "morning",
  "🌤": "morning",
  "🏫": "school",
  "🌳": "school",
  "🌙": "moon",
  "🏆": "trophy",
  "🎒": "bag",
  "💬": "speaking",
  "⭐": "star",
  "✨": "star",
  "🪄": "wand",
  "🤩": "amazing",
  "😍": "amazing",
  "😁": "happy",
  "😊": "happy",
  "🙂": "good",
  "🥱": "tired",
  "😔": "sad",
  "😕": "sad",
  "📚": "books",
  "👋": "happy",
  "🔎": "book",
  "🎧": "speaking",
  "🕯": "wand",
};
export function ArtIcon({
  name,
  label,
  className = "",
}: {
  name: string;
  label?: string;
  className?: string;
}) {
  const key = emojiArt[name.replaceAll("\uFE0F", "")] ?? name;
  const cell = artCells[key] ?? artCells.star;
  const style: CSSProperties = {
    backgroundPosition: `${(cell % 6) * 20}% ${Math.floor(cell / 6) * 20}%`,
  };
  return (
    <span
      className={`art-icon ${className}`}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
/** Keep data and localStorage IDs unchanged, rendering emoji tokens as artwork. */
export function IllustratedText({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\p{Extended_Pictographic}\uFE0F?)/u)
        .filter(Boolean)
        .map((part, i) =>
          /\p{Extended_Pictographic}/u.test(part) ? (
            <ArtIcon key={i} name={part} />
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
    </>
  );
}
export function MoodFace({ index }: { index: number }) {
  return (
    <ArtIcon
      name={["amazing", "happy", "good", "tired", "sad"][index]}
      className="mood-art"
    />
  );
}
