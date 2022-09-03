import { Player } from "@types";
import { joinRoom } from "@utils";
import { Server, Socket } from "socket.io";
import { Go } from ".";

function getSocketById(io: Server, id: string) {
  return io.sockets.sockets.get(id);
}

export class Room {
  /**
   * room 的 id
   */
  roomId: string;
  /**
   * 管理棋盘和历史，负责下棋和提子
   */
  go: Go = new Go();
  /**
   * 玩家
   */
  players: Player[];
  sockets: Socket[];

  constructor(io: Server, players: Player[]) {
    this.players = players;
    this.sockets = players.map((p) => getSocketById(io, p.id));
    this.roomId = joinRoom(...this.sockets);
    this.on();
  }
  private on() {
    this.sockets.forEach((socket) =>
      socket.on("action", (i: number, j: number) => {
        const color = this.players.filter((p) => p.id === socket.id)[0].color;
        this.go.action(socket.id, i, j, color);
        // 接着应该同步一次双方的棋盘
        this.sync(socket.id);
      })
    );
  }
  /**
   * 同步棋盘和历史
   */
  private sync(causeId: string) {
    this.sockets.map((s) => {
      s.emit("sync", {
        board: this.go.board,
        isCauseByMe: causeId === s.id,
      });
    });
  }
}
