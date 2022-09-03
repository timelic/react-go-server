import { Server, Socket } from "socket.io";

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

export function closeRoom(io: Server, room: string) {
  getIdsInRoom(io, room).forEach((id) => getSocketById(io, id).leave(room));
}

export function getCurrentRoomId(socket: Socket) {
  const rooms = Array.from(socket.rooms);
  return rooms[getMaxOneIndex(rooms.map((s) => s.length))];
}

function getMaxOneIndex(array: number[]): number {
  let res = 0;
  array.forEach((n, i) => {
    if (n > array[res]) res = i;
  });
  return res;
}

function getIdsInRoom(io: Server, roomId: string) {
  return Array.from(io.sockets.adapter.rooms.get(roomId));
}

export function getSocketById(io: Server, id: string) {
  return io.sockets.sockets.get(id);
}
