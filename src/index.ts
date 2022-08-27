import { Server } from "socket.io";
import { Action } from "./types";
const io = new Server(3000, {
  cors: {
    origin: "http://localhost:5174",
  },
});
io.on("connection", (socket) => {
  // 连接之后，客户端需要自我介绍，发一些基础信息过来
  socket.on("init", (data: any) => {
    //...
    socket.send("initCb", {});
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
