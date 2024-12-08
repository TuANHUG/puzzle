import TinyQueue from 'tinyqueue';


const HEURISTIC_FACTOR = 2;
// Hoán đổi vị trí hai ô trên bảng
export function swapTiles(board, row1, col1, row2, col2) {
  const temp = board[row1][col1];
  board[row1][col1] = board[row2][col2];
  board[row2][col2] = temp;
}
//Tìm vị trí ô trống trên bảng
function findBlank(board) {
  const dimension = board.length;
  for (let row = 0; row < dimension; row++) {
    for (let col = 0; col < dimension; col++) {
      if (board[row][col] === 0) return { row, col };
    }
  }
}
//Chuyển đổi chỉ số của một mảng phẳng thành tọa độ trên ma trận 2 chiều
function indexToCoords(index, dimension) {
  return {
    row: Math.floor(index / dimension),
    col: index % dimension
  };
}
// Trộn các ô của bảng theo thứ tự ngẫu nhiên và đảm bảo bảng có thể giải được

function shuffleBoard(tiles) {
  const dimension = tiles.length;
  const size = dimension * dimension - 1;
  // Thuật toán Fisher-Yates để trộn ngẫu nhiên các ô

  for (let i = size; i > 0; i--) {
    const j = Math.floor(Math.random() * i); 
    const iCoords = indexToCoords(i, dimension);
    const jCoords = indexToCoords(j, dimension);
    swapTiles(tiles, iCoords.row, iCoords.col, jCoords.row, jCoords.col);
  }

  const blankPos = findBlank(tiles);
  if (!isSolvable(tiles, blankPos.row)) {
    // Nếu bảng không thể giải, tạo một nghịch đảo để đảm bảo solvable
    if (blankPos.row === 0) swapTiles(tiles, 1, 0, 1, 1);
    else swapTiles(tiles, 0, 0, 0, 1);
  }

  return { tiles: tiles, blankRow: blankPos.row, blankCol: blankPos.col };
}

// Hợp nhất hai mảng con và đếm số nghịch đảo
function merge(array, tempArray, left, mid, right) {
  let inversions = 0;
  let i = left;
  let j = mid + 1;
  let k = left; 
  // So sánh và hợp nhất

  while (i <= mid && j <= right) {
    if (array[i] <= array[j]) {
      tempArray[k] = array[i];
      k++;
      i++;
    } else {
      tempArray[k] = array[j];
      // Không tính ô trống
      if (array[j] !== 0) inversions += mid - i + 1;
      k++;
      j++;
    }
  }

  while (i <= mid) {
    tempArray[k] = array[i];
    k++;
    i++;
  }
  while (j <= right) {
    tempArray[k] = array[j];
    k++;
    j++;
  }

  for (let x = left; x <= right; x++) array[x] = tempArray[x];

  return inversions;
}

// Hàm MergeSort để đếm số nghịch đảo trong mảng
function mergeSort(array, tempArray, left, right) {
  let inversions = 0;

  if (left < right) {
    const mid = Math.floor((left + right) / 2);
    inversions += mergeSort(array, tempArray, left, mid);
    inversions += mergeSort(array, tempArray, mid + 1, right);
    inversions += merge(array, tempArray, left, mid, right);
  }

  return inversions;
}
// Đếm số nghịch đảo trong mảng
export function countInversions(array) {
  return mergeSort(array, [], 0, array.length - 1);
}
// Kiểm tra bảng có thể giải được hay không
export function isSolvable(tiles, blankRow) {
  const dimension = tiles.length;
  const flattenedBoard = [].concat(...tiles);
  const inversions = countInversions(flattenedBoard);
  if (dimension % 2 === 1) return inversions % 2 === 0;
  else if (blankRow % 2 === 0) return inversions % 2 === 1;
  return inversions % 2 === 0;
}
// Tạo bảng đã giải 
export function generateSolved(dimension) {
  let tiles = [];
  for (let row = 0; row < dimension; row++) {
    tiles[row] = [];
    for (let col = 0; col < dimension; col++) {
      tiles[row][col] = row * dimension + col + 1;
    }
  }
  tiles[dimension - 1][dimension - 1] = 0;
  return { tiles: tiles, blankRow: dimension - 1, blankCol: dimension - 1 };
}
//Kiểm tra bảng hiện tại có đạt trạng thái mục tiêu
export function isGoal(tiles) {
  return manhattan(tiles) === 0;
}
//Lấy vị trí mục tiêu của một ô trong bảng đã giải
export function getGoalPosition(tile, dimension) {
  return indexToCoords(tile - 1, dimension);
}

//Tính tổng khoảng cách Manhattan từ các ô đến vị trí mục tiêu của chúng
export function manhattan(tiles) {
  const dim = tiles.length;
  let distance = 0;
  for (let row = 0; row < dim; row++) {
    for (let col = 0; col < dim; col++) {
      const tile = tiles[row][col];
      if (tile === 0) continue;
      const goal = getGoalPosition(tile, dim);
      distance += Math.abs(goal.row - row) + Math.abs(goal.col - col);
    }
  }
  return distance;
}
// Tính số lượng xung đột tuyến tính rong bảng
export function linearConflict(tiles) {
  const dim = tiles.length;

  let linearConflicts = 0;

  for (let row = 0; row < dim; row++) {
    for (let col1 = 0; col1 < dim; col1++) {
      for (let col2 = col1; col2 < dim; col2++) {
        const tile1 = tiles[row][col1];
        const tile2 = tiles[row][col2];
        if (tile1 === 0 || tile2 === 0) continue;
        const goal1 = getGoalPosition(tile1, dim);
        const goal2 = getGoalPosition(tile2, dim);
        if (goal1.row === row && goal2.row === row && goal1.col > goal2.col)
          linearConflicts++;
      }
    }
  }

  for (let col = 0; col < dim; col++) {
    for (let row1 = 0; row1 < dim; row1++) {
      for (let row2 = row1; row2 < dim; row2++) {
        const tile1 = tiles[row1][col];
        const tile2 = tiles[row2][col];
        if (tile1 === 0 || tile2 === 0) continue;
        const goal1 = getGoalPosition(tile1, dim);
        const goal2 = getGoalPosition(tile2, dim);
        if (goal1.col === col && goal2.col === col && goal1.row > goal2.row)
          linearConflicts++;
      }
    }
  }

  return linearConflicts;
}
// Hàm heuristic kết hợp Manhattan và xung đột tuyến tính
export function heuristic(tiles) {
  return manhattan(tiles) + 2 * linearConflict(tiles);
}
// So sánh hai bảng xem chúng có giống nhau hay không
export function deepEqual(tiles1, tiles2) {
  if (tiles1.length !== tiles2.length) return false;
  for (let row = 0; row < tiles1.length; row++) {
    for (let col = 0; col < tiles1.length; col++) {
      if (tiles1[row][col] !== tiles2[row][col]) return false;
    }
  }
  return true;
}
// Tạo một bảng mới là hàng xóm của bảng hiện tại
function createNeighbor(tiles, blankRow, blankCol, neighborRow, neighborCol) {
  swapTiles(tiles, blankRow, blankCol, neighborRow, neighborCol); 
  const neighbor = JSON.parse(JSON.stringify(tiles)); 
  swapTiles(tiles, blankRow, blankCol, neighborRow, neighborCol); 
  return { tiles: neighbor, blankRow: neighborRow, blankCol: neighborCol };
}

//Tìm các bảng hàng xóm có thể đạt được từ bảng hiện tại 
export function neighbors(tiles, blankRow, blankCol) {
  let neighbors = [];

  if (blankRow > 0) {
    neighbors.push(
      createNeighbor(tiles, blankRow, blankCol, blankRow - 1, blankCol)
    );
  }
  if (blankCol > 0) {
    neighbors.push(
      createNeighbor(tiles, blankRow, blankCol, blankRow, blankCol - 1)
    );
  }
  if (blankRow < tiles.length - 1) {
    neighbors.push(
      createNeighbor(tiles, blankRow, blankCol, blankRow + 1, blankCol)
    );
  }
  if (blankCol < tiles.length - 1) {
    neighbors.push(
      createNeighbor(tiles, blankRow, blankCol, blankRow, blankCol + 1)
    );
  }

  return neighbors;
}
//Sinh bảng ngẫu nhiên có thể giải được
export function generateRandom(dimension) {
  return shuffleBoard(generateSolved(dimension).tiles);
}
// Hàm so sánh hai nút trong hàng đợi ưu tiên
function compare(n1, n2) {
  const priority1 = n1.heuristic * HEURISTIC_FACTOR + n1.steps;
  const priority2 = n2.heuristic * HEURISTIC_FACTOR + n2.steps;
  return priority1 - priority2;
}
// Giải bài toán puzzle bằng thuật toán tìm kiếm ưu tiên A*
export function solve(tiles, blankRow, blankCol) {
  const initial = {
    tiles,
    blankRow,
    blankCol,
    heuristic: heuristic(tiles),
    steps: 0,
    previous: null
  };
  const queue = new TinyQueue([initial], compare);
  let searchNode = initial;

  while (!isGoal(searchNode.tiles)) {
    searchNode = queue.pop();
    const neighborList = neighbors(
      searchNode.tiles,
      searchNode.blankRow,
      searchNode.blankCol
    );
    for (let i = 0; i < neighborList.length; i++) {
      const nextNeighbor = neighborList[i];

        // Bỏ qua nếu bảng giống bảng trước đó
        if (
        searchNode.previous !== null &&
        deepEqual(nextNeighbor.tiles, searchNode.previous.tiles)
      ) {
        continue;
      }

      queue.push({
        tiles: nextNeighbor.tiles,
        blankRow: nextNeighbor.blankRow,
        blankCol: nextNeighbor.blankCol,
        heuristic: heuristic(nextNeighbor.tiles),
        steps: searchNode.steps + 1,
        previous: searchNode
      });
    }
  }

  // Lưu chuỗi bước di chuyển
  const solution = [];
  while (searchNode !== null) {
    solution.push({
      blankRow: searchNode.blankRow,
      blankCol: searchNode.blankCol
    });
    searchNode = searchNode.previous;
  }

  solution.reverse();
  solution.shift(); 
  return solution;
}
