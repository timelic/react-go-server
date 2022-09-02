import { Socket } from "socket.io";

/**
 * 通过多个 id 获取唯一的房间名
 */
export function getRoomName(...args: string[]): string {
  return args.sort().join(":");
}

export function joinRoom(...sockets: Socket[]): string {
  const room = getRoomName(...sockets.map((s) => s.id));
  sockets.forEach((s) => s.join(room));
  return room;
}

export function closeRoom(room: string, ...sockets: Socket[]) {
  sockets.forEach((s) => s.leave(room));
}

export function getCurrentRoom(socket: Socket) {
  const rooms = Array.from(socket.rooms);
  return rooms[1];
}
