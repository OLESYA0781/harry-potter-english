/** Fill only from supplied original Go Getter 3 SB pages 4–5 and licensed media. */
export type BookItem = { id: string; prompt: string; choices?: string[] };
export type BookExercise = { instruction: string; items: BookItem[] };
export const lesson1Materials: {
  page4: string | null;
  page5: string | null;
  introVideo: string | null;
  audio12: string | null;
  audio13: string | null;
  audio14: string | null;
  introduction: { dialogue: string; comprehension: BookExercise } | null;
  exercises: Record<number, BookExercise | null>;
} = {
  page4: null, page5: null,
  introVideo: null, audio12: null, audio13: null, audio14: null,
  introduction: null,
  exercises: { 3: null, 4: null, 5: null, 6: null, 7: null, 8: null, 9: null },
};
