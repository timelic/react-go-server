import { Board, History, PieceState, Player } from "@types";
import { updateTable } from "@utils";
import { cloneDeep } from "lodash";
const ROW_AMOUNT = 19;
export const initialBoard = new Array(ROW_AMOUNT)
  .fill(null)
  .map((_) => new Array(ROW_AMOUNT).fill(PieceState.None));

interface GoInitParams {
  players: {
    [PieceState.Black]: Player;
    [PieceState.White]: Player;
  };
  room: string;
}

interface Pos {
  i: number;
  j: number;
}

export class Go {
  board: Board = cloneDeep(initialBoard);
  history: History = [
    {
      playerId: "null",
      board: cloneDeep(initialBoard),
    },
  ];

  constructor() {}

  action(playerId: Player["id"], i: number, j: number, color: PieceState) {
    updateTable(this.board, i, j, color);
    this.pushHistory(playerId, cloneDeep(this.board));
  }

  /**
   * 新增一个历史
   */
  private pushHistory(playerId: Player["id"], board: Board) {
    this.history.push({
      board,
      playerId,
    });
  }
}
