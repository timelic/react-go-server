import { PieceState } from "@types";

/**
 * 生成唯一的 key，便于记录是否走过
 */
function genKey(i: number, j: number) {
  return `${i}:${j}`;
}

/**
 * @function 获取这个棋子的气
 * @return [气的数量，dp]
 */
function getLiberties(
  i: number,
  j: number,
  blocks: PieceState[][]
): [number, Record<string, boolean>] {
  const dp: Record<string, boolean> = {};
  const initialState = blocks[i][j];
  function helper(i: number, j: number): number {
    if (i < 0 || i >= blocks.length || j < 0 || j >= blocks[0].length) return 0;
    if (dp[genKey(i, j)]) return 0;
    if (blocks[i][j] === PieceState.None) return 1;
    if (blocks[i][j] !== initialState) return 0;
    // 标记为已走过
    dp[genKey(i, j)] = true;
    // 遍历四个边
    return (
      helper(i - 1, j) + helper(i + 1, j) + helper(i, j - 1) + helper(i, j + 1)
    );
  }
  // 返回气的数量，并且返回已经走过的坐标
  return [helper(i, j), dp];
}

function checkOutOfBounds(i: number, j: number, blocks: PieceState[][]) {
  return i < 0 || i >= blocks.length || j < 0 || j >= blocks[0].length;
}

const di = [-1, 0, 1, 0];
const dj = [0, -1, 0, 1];
/**
 * @function 广度优先搜索判断当前位置及周边位置是否无气
 * @return 是否有气
 */
function bfs(
  i: number,
  j: number,
  blocks: PieceState[][],
  isReplace: boolean
): boolean {
  // 出界返回true
  if (checkOutOfBounds(i, j, blocks)) return true;
  // 当前点类型
  const p: PieceState = blocks[i][j];
  // 要遍历坐标的数组
  const array: [number, number][] = [[i, j]];
  for (let pos of array) {
    // 出界按无气算，继续遍历
    if (checkOutOfBounds(pos[0], pos[1], blocks)) continue;
    // 发现空则必定存在气，返回true
    if (blocks[pos[0]][pos[1]] === PieceState.None) return true;
    // 如果依然是对方的类型则继续遍历
    if (blocks[pos[0]][pos[1]] !== p) continue;
    // 如果是自己的类型则向四周遍历
    for (let i = 0; i < 4; i++) {
      array.push([pos[0] + di[i], pos[1] + dj[i]]);
    }
  }
  // 走到这里说明无气，数组内的所有地址替换为空
  if (isReplace) {
    for (let pos of array) {
      // 出界和是对方类型的跳过
      if (
        checkOutOfBounds(pos[0], pos[1], blocks) ||
        blocks[pos[0]][pos[1]] !== p
      )
        continue;
      blocks[pos[0]][pos[1]] = PieceState.None;
    }
  }
  return false;
}

/**
 * 更新整个棋盘
 */
export function updateTable(
  blocks: PieceState[][],
  i: number,
  j: number,
  p: PieceState
): boolean {
  console.log({ i, j, p });
  // 暂时允许下该步
  blocks[i][j] = p;
  // 四周的区域是否有气
  let hasLiberty: boolean = true;
  // 检查四周
  for (let k = 0; k < 4; k++) {
    // 四周的区域任意一个区域无气了则代表存在吃棋
    hasLiberty = bfs(i + di[k], j + dj[k], blocks, true) && hasLiberty;
  }
  // 周围存在无气则吃棋了，直接返回true；没有吃棋操作则要检查当前区域是否有气，有气则返回true
  if (!hasLiberty || bfs(i, j, blocks, false)) return true;
  // 无气重置该位置，返回false
  blocks[i][j] = PieceState.None;
  return false;
}