import { Server, Socket } from "socket.io";
import { Action, Player } from "./types";
import { closeRoom, getCurrentRoom, getRoomName, joinRoom } from "./utils";
const io = new Server(3000, {
  cors: {
    origin: true,
  },
});
console.log(`🚀 listen on ws://localhost:3000`);
let onlinePlayers: Player[] = [
  {
    name: "Ai",
    id: "ai",
    isInRoom: false,
  },
];
// 每隔一段时间更新一次在线玩家列表
setInterval(() => {
  onlinePlayers = onlinePlayers.filter(
    ({ id }) => id === "ai" || io.sockets.sockets.get(id)?.connected
  );
}, 500);
function getPlayerById(id: string): Player {
  return onlinePlayers.filter((p) => p.id === id)[0] ?? {};
}

io.on("connection", (socket) => {
  console.log("connected");
  /**
   * 添加一个在线玩家
   */
  socket.on("register", (player: Omit<Player, "id">) => {
    socket.emit("online_players", { onlinePlayers });
    onlinePlayers.push(
      Object.assign(player, { id: socket.id, isInRoom: false })
    );
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
    const room = getCurrentRoom(socket);
    socket.to(room).emit("invite_ask", player);
  });
  socket.on("invite_result", (isAccepted: boolean) => {
    console.log({ isAccepted });
    const room = getCurrentRoom(socket);
    if (isAccepted) {
      console.log(socket.rooms);
      console.log(socket.id);
      socket.to(room).emit("invite_result", true);
      // 开始游戏
      socket.emit("start");
      socket.to(room).emit("start");
    } else {
      // 告诉发起人 他被拒绝了
      socket.to(room).emit("invite_result", false);
      // 解散房间
      closeRoom(room, socket);
    }
  });
  // 收到下一步的 action
  socket.on("action", (action: Action) => {
    // 判断这个 action 是不是合法的人发过来的
    // 可能得根据这个连接的 id
    console.log(action);
    // 判断是不是合法的
    // 计算新局面
    // 新局面发送给两方
    // 设置一个本地状态：下一步是 B 下棋了
  });
});
