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
}
