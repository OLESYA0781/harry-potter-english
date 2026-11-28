// The user requested recording identifiers only: no audio assets, players,
// network loads or synthetic speech are added to Lesson 4.
export const recordings=['VB1.01','1.01','1.02','VB2.01'] as const;
export type TrackId=typeof recordings[number];
