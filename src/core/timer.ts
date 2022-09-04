// import { CountDown } from "count-time-down";
import CountDown from "./count-down";
const TOTAL_TIME = 30 * 60 * 1000;
export class Timer {
  cd: Record<string, any> = {};
  constructor(socketId1: string, socketId2: string) {
    this.cd[socketId1] = new CountDown(TOTAL_TIME, { cdType: "s" }, (cb) => {
      console.log(cb.mmss);
    });
    this.cd[socketId2] = new CountDown(TOTAL_TIME, { cdType: "s" }, () => {});
  }
  use(socketId: string) {
    // 这一个启用
    this.cd[socketId].start();
    // 暂停另一个
    this.cd[Object.keys(this.cd).filter((id) => id !== socketId)[0]].stop();
  }
  getValue(socketId: string) {
    console.log(this.cd[socketId].mmss);
    return this.cd[socketId].mmss;
  }
}
