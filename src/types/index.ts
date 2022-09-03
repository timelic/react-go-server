export interface Action {
  i: number;
  j: number;
  color: any;
  id: string;
}

export interface Player {
  id: string;
  name: string;
  isInRoom: boolean;
  color: PieceState;
}

export enum PieceState {
  Black = "black",
  White = "white",
  None = "none",
}

export type Board = PieceState[][];

type HistoryItem = {
  playerId: Player["id"];
  board: Board;
};
export type History = HistoryItem[];
