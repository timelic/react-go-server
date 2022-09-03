import { PieceState } from "@types";
import { random } from "lodash";

export function getRandomColor(): PieceState[] {
  const randomNum = random(0, 2);
  const res = [PieceState.Black, PieceState.White];
  return randomNum > 1 ? res : res.reverse();
}
