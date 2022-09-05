import { createCountdown } from ".";
const TOTAL_TIME = 30 * 60 * 1000;
export class Timer {
  cd: Record<string, ReturnType<typeof createCountdown>> = {};
  constructor(socketId1: string, socketId2: string) {
    this.cd[socketId1] = createCountdown({ m: 30 }, { autoStart: false });
    this.cd[socketId2] = createCountdown({ m: 30 }, { autoStart: false });
  }
  use(socketId: string) {
    // 这一个启用
    this.cd[socketId].start();
    // 暂停另一个
    this.cd[Object.keys(this.cd).filter((id) => id !== socketId)[0]].stop();
  }
  getValue(socketId: string) {
    console.log(
      Object.keys(this.cd).map((id) => this.cd[id].get().remainingSec)
    );
    return this.cd[socketId].get().remainingSec;
  }
}
