import { Server } from "socket.io";
import { PieceState, Player } from "@types";
import {
  closeRoom,
  getCurrentRoomId,
  getRandomColor,
  getSocketById,
  joinRoom,
} from "@utils";
import { Room } from "@core";

console.log(`🚀 listen on ws://localhost:3000\n`);
const io = new Server(3000, {
  cors: {
    origin: true,
  },
});

let onlinePlayers: Player[] = [
  {
    name: "Ai",
    id: "ai",
    isInRoom: false,
    color: PieceState.None,
  },
];
const rooms: Room[] = [];

// 每隔一段时间更新一次在线玩家列表
setInterval(() => {
  const prevLen = onlinePlayers.length;
  onlinePlayers = onlinePlayers.filter(
    ({ id }) => id === "ai" || io.sockets.sockets.get(id)?.connected
  );
  const currLen = onlinePlayers.length;
  // 如果有变化 通知所有人
  if (prevLen !== currLen) asyncOnlinePlayers();
}, 1000);
function getPlayerById(id: string): Player {
  return onlinePlayers.filter((p) => p.id === id)[0] ?? ({} as any);
}
/**
 * 告诉所有人 同步一下信息
 */
function asyncOnlinePlayers() {
  onlinePlayers.forEach((p, _, arr) =>
    getSocketById(io, p.id)?.emit(
      "online_players",
      arr.filter((_p) => _p.id !== p.id)
    )
  );
}
io.on("connection", (socket) => {
  console.log("connected");
  /**
   * 添加一个在线玩家
   */
  socket.on("register", (player: Omit<Player, "id">) => {
    socket.emit("online_players", onlinePlayers);
    onlinePlayers.push(
      Object.assign(player, { id: socket.id, isInRoom: false })
    );
    asyncOnlinePlayers();
  });

  /**
   * 改名
   */
  socket.on("rename", (name: string) => {
    getPlayerById(socket.id).name = name;
  });
  // 连接之后，客户端需要自我介绍，发一些基础信息过来
  socket.on("invite", (id: string) => {
    const player = getPlayerById(id);
    if (!player.id) return;
    // 先拉进一个房间
    const anoSocket = io.sockets.sockets.get(id);
    joinRoom(socket, anoSocket!);
    // 然后问问对面 接不接受
    const roomId = getCurrentRoomId(socket);
    socket.to(roomId).emit("invite_ask", player);
  });

  socket.on("invite_result", (isAccepted: boolean) => {
    console.log({ isAccepted });
    const roomId = getCurrentRoomId(socket);
    if (isAccepted) {
      // 告诉两边开始游戏
      const colors = getRandomColor();
      socket.emit("start", {
        isAccepted,
        colorAssigned: colors[0],
      });
      socket.to(roomId).emit("start", {
        isAccepted,
        colorAssigned: colors[1],
      });

      // 接下来由 Room 接管
      const idsInRoom = Array.from(io.sockets.adapter.rooms.get(roomId));
      // 在此之前，给 player 赋予应有的颜色
      getPlayerById(socket.id).color = colors[0];
      getPlayerById(idsInRoom.filter((id) => id !== socket.id)[0]).color =
        colors[1];

      const room = new Room(
        io,
        onlinePlayers.filter((p) => idsInRoom.includes(p.id))
      );
      rooms.push(room);
    } else {
      // 告诉发起人 他被拒绝了
      socket.to(roomId).emit("start", { isAccepted });
      // 解散房间
      closeRoom(io, roomId);
    }
  });
});
