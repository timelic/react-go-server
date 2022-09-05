import { Player } from "@types";
import { joinRoom } from "@utils";
import { Server, Socket } from "socket.io";
import { Go, Timer } from ".";

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
  timer: Timer;

  constructor(io: Server, players: Player[]) {
    this.players = players;
    this.sockets = players.map((p) => getSocketById(io, p.id));
    this.roomId = joinRoom(...this.sockets);
    this.on();
    this.timer = new Timer(players[0].id, players[1].id);
  }
  private on() {
    this.sockets.forEach((socket) => {
      // 一方下棋
      socket.on("action", (i: number, j: number) => {
        const color = this.players.filter((p) => p.id === socket.id)[0].color;
        this.go.action(socket.id, i, j, color);
        // 接着应该同步一次双方的棋盘
        this.sync(socket.id, i, j, this.go.history.length - 1);
        // 另一方使用计时器
        this.timer.use(this.players.filter((p) => p.id !== socket.id)[0].id);
      });
      socket.on("skip", () => {
        this.go.skip(socket.id);
        // 接着应该同步一次双方的棋盘
        this.sync(socket.id);
      });
    });
  }
  /**
   * 同步棋盘和时间
   */
  private sync(causeId: string, i?: number, j?: number, order?: number) {
    this.sockets.map((s) => {
      s.emit("sync", {
        board: this.go.board,
        isCauseByMe: causeId === s.id,
        countdown: {
          me: this.timer.getValue(s.id),
          opponent: this.timer.getValue(
            this.sockets.filter(({ id }) => id !== s.id)[0].id
          ),
        },
        lastAction: { pos: { i, j }, order },
      });
    });
  }
}
