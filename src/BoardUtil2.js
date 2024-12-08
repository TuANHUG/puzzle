// Import TinyQueue, một cấu trúc dữ liệu hàng đợi ưu tiên, dùng để tối ưu thuật toán tìm kiếm
import TinyQueue from 'tinyqueue';

// Hằng số để tăng trọng số của hàm heuristic so với số bước đã đi
const HEURISTIC_FACTOR = 2;

/**
 * Hoán đổi vị trí hai ô trên bảng
 * @param {Array} board - Ma trận 2D biểu diễn bảng
 * @param {number} row1 - Hàng của ô thứ nhất
 * @param {number} col1 - Cột của ô thứ nhất
 * @param {number} row2 - Hàng của ô thứ hai
 * @param {number} col2 - Cột của ô thứ hai
 */
export function swapTiles(board, row1, col1, row2, col2) {
  const temp = board[row1][col1];
  board[row1][col1] = board[row2][col2];
  board[row2][col2] = temp;
}

/**
 * Tìm vị trí ô trống (giá trị = 0) trên bảng
 * @param {Array} board - Ma trận biểu diễn bảng
 * @returns {Object} - Vị trí { row, col } của ô trống
 */
function findBlank(board) {
  const dimension = board.length; // Kích thước bảng
  for (let row = 0; row < dimension; row++) {
    for (let col = 0; col < dimension; col++) {
      if (board[row][col] === 0) return { row, col }; // Trả về tọa độ ô trống
    }
  }
}

/**
 * Chuyển đổi chỉ số của một mảng phẳng thành tọa độ trên ma trận 2 chiều
 * @param {number} index - Vị trí trong mảng phẳng
 * @param {number} dimension - Kích thước bảng
 * @returns {Object} - Tọa độ { row, col }
 */
function indexToCoords(index, dimension) {
  return {
    row: Math.floor(index / dimension), // Hàng tương ứng
    col: index % dimension // Cột tương ứng
  };
}

/**
 * Trộn các ô của bảng theo thứ tự ngẫu nhiên và đảm bảo bảng có thể giải được
 * @param {Array} tiles - Bảng hiện tại
 * @returns {Object} - Bảng đã trộn cùng vị trí của ô trống
 */
function shuffleBoard(tiles) {
  const dimension = tiles.length;
  const size = dimension * dimension - 1; // Tổng số ô, trừ ô trống

  // Thuật toán Fisher-Yates để trộn ngẫu nhiên các ô
  for (let i = size; i > 0; i--) {
    const j = Math.floor(Math.random() * i); // Lựa chọn ngẫu nhiên
    const iCoords = indexToCoords(i, dimension);
    const jCoords = indexToCoords(j, dimension);
    swapTiles(tiles, iCoords.row, iCoords.col, jCoords.row, jCoords.col); // Hoán đổi ô
  }

  const blankPos = findBlank(tiles); // Tìm vị trí ô trống
  if (!isSolvable(tiles, blankPos.row)) {
    // Nếu bảng không thể giải, tạo một nghịch đảo để đảm bảo solvable
    if (blankPos.row === 0) swapTiles(tiles, 1, 0, 1, 1);
    else swapTiles(tiles, 0, 0, 0, 1);
  }

  return { tiles: tiles, blankRow: blankPos.row, blankCol: blankPos.col };
}

/**
 * Hợp nhất hai mảng con và đếm số nghịch đảo
 * @param {Array} array - Mảng chính
 * @param {Array} tempArray - Mảng tạm để lưu trữ
 * @param {number} left - Chỉ số trái
 * @param {number} mid - Chỉ số giữa
 * @param {number} right - Chỉ số phải
 * @returns {number} - Số nghịch đảo
 */
function merge(array, tempArray, left, mid, right) {
  let inversions = 0;
  let i = left;
  let j = mid + 1;
  let k = left; // Vị trí trong mảng tạm

  // So sánh và hợp nhất
  while (i <= mid && j <= right) {
    if (array[i] <= array[j]) {
      tempArray[k++] = array[i++];
    } else {
      tempArray[k++] = array[j++];
      if (array[j - 1] !== 0) inversions += mid - i + 1; // Không tính ô trống
    }
  }

  while (i <= mid) tempArray[k++] = array[i++];
  while (j <= right) tempArray[k++] = array[j++];

  for (let x = left; x <= right; x++) array[x] = tempArray[x]; // Sao chép lại mảng

  return inversions;
}

/**
 * Hàm MergeSort để đếm số nghịch đảo trong mảng
 * @param {Array} array - Mảng cần sắp xếp
 * @param {Array} tempArray - Mảng tạm
 * @param {number} left - Vị trí trái
 * @param {number} right - Vị trí phải
 * @returns {number} - Số nghịch đảo
 */
function mergeSort(array, tempArray, left, right) {
  let inversions = 0;

  if (left < right) {
    const mid = Math.floor((left + right) / 2); // Tìm vị trí giữa
    inversions += mergeSort(array, tempArray, left, mid);
    inversions += mergeSort(array, tempArray, mid + 1, right);
    inversions += merge(array, tempArray, left, mid, right);
  }

  return inversions;
}

/**
 * Đếm số nghịch đảo trong mảng
 * @param {Array} array - Mảng đầu vào
 * @returns {number} - Số nghịch đảo
 */
export function countInversions(array) {
  return mergeSort(array, [], 0, array.length - 1);
}

/**
 * Kiểm tra bảng có thể giải được hay không
 * @param {Array} tiles - Bảng hiện tại
 * @param {number} blankRow - Vị trí hàng của ô trống
 * @returns {boolean} - True nếu bảng có thể giải
 */
export function isSolvable(tiles, blankRow) {
  const dimension = tiles.length;
  const flattenedBoard = [].concat(...tiles); // Dẹt bảng thành mảng
  const inversions = countInversions(flattenedBoard);

  if (dimension % 2 === 1) return inversions % 2 === 0; // Kích thước lẻ
  else if (blankRow % 2 === 0) return inversions % 2 === 1; // Ô trống nằm trên hàng chẵn
  return inversions % 2 === 0; // Ô trống nằm trên hàng lẻ
}

/**
 * Tạo bảng đã giải (goal state)
 * @param {number} dimension - Kích thước bảng
 * @returns {Object} - Bảng đã giải với thông tin vị trí ô trống
 */
export function generateSolved(dimension) {
  let tiles = [];
  for (let row = 0; row < dimension; row++) {
    tiles[row] = [];
    for (let col = 0; col < dimension; col++) {
      tiles[row][col] = row * dimension + col + 1;
    }
  }
  tiles[dimension - 1][dimension - 1] = 0; // Đặt ô trống ở góc dưới bên phải
  return { tiles: tiles, blankRow: dimension - 1, blankCol: dimension - 1 };
}
/**
 * Kiểm tra bảng hiện tại có đạt trạng thái mục tiêu (goal state) hay không
 * @param {Array} tiles - Bảng hiện tại
 * @returns {boolean} - True nếu là trạng thái mục tiêu
 */
export function isGoal(tiles) {
    return manhattan(tiles) === 0; // Nếu khoảng cách Manhattan bằng 0, bảng đã giải xong
  }
  
  /**
   * Lấy vị trí mục tiêu (goal position) của một ô trong bảng đã giải
   * @param {number} tile - Giá trị của ô
   * @param {number} dimension - Kích thước bảng
   * @returns {Object} - Tọa độ { row, col } trong bảng đã giải
   */
  export function getGoalPosition(tile, dimension) {
    return indexToCoords(tile - 1, dimension); // Giá trị -1 để tính vị trí chính xác trong ma trận
  }
  
  /**
   * Tính tổng khoảng cách Manhattan từ các ô đến vị trí mục tiêu của chúng
   * @param {Array} tiles - Bảng hiện tại
   * @returns {number} - Tổng khoảng cách Manhattan
   */
  export function manhattan(tiles) {
    const dim = tiles.length; // Kích thước bảng
    let distance = 0;
  
    for (let row = 0; row < dim; row++) {
      for (let col = 0; col < dim; col++) {
        const tile = tiles[row][col];
        if (tile === 0) continue; // Bỏ qua ô trống
        const goal = getGoalPosition(tile, dim); // Lấy vị trí mục tiêu của ô
        distance += Math.abs(goal.row - row) + Math.abs(goal.col - col); // Cộng khoảng cách Manhattan
      }
    }
    return distance;
  }
  
  /**
   * Tính số lượng xung đột tuyến tính (linear conflicts) trong bảng
   * @param {Array} tiles - Bảng hiện tại
   * @returns {number} - Số xung đột tuyến tính
   */
  export function linearConflict(tiles) {
    const dim = tiles.length;
    let linearConflicts = 0;
  
    // Kiểm tra xung đột theo hàng
    for (let row = 0; row < dim; row++) {
      for (let col1 = 0; col1 < dim; col1++) {
        for (let col2 = col1; col2 < dim; col2++) {
          const tile1 = tiles[row][col1];
          const tile2 = tiles[row][col2];
          if (tile1 === 0 || tile2 === 0) continue; // Bỏ qua ô trống
          const goal1 = getGoalPosition(tile1, dim);
          const goal2 = getGoalPosition(tile2, dim);
          if (goal1.row === row && goal2.row === row && goal1.col > goal2.col)
            linearConflicts++; // Tăng nếu có xung đột
        }
      }
    }
  
    // Kiểm tra xung đột theo cột
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
  
  /**
   * Hàm heuristic kết hợp Manhattan và xung đột tuyến tính
   * @param {Array} tiles - Bảng hiện tại
   * @returns {number} - Giá trị heuristic
   */
  export function heuristic(tiles) {
    return manhattan(tiles) + 2 * linearConflict(tiles); // Tổng khoảng cách Manhattan và xung đột tuyến tính
  }
  
  /**
   * So sánh hai bảng xem chúng có giống nhau hay không
   * @param {Array} tiles1 - Bảng thứ nhất
   * @param {Array} tiles2 - Bảng thứ hai
   * @returns {boolean} - True nếu giống nhau
   */
  export function deepEqual(tiles1, tiles2) {
    if (tiles1.length !== tiles2.length) return false;
    for (let row = 0; row < tiles1.length; row++) {
      for (let col = 0; col < tiles1.length; col++) {
        if (tiles1[row][col] !== tiles2[row][col]) return false;
      }
    }
    return true;
  }
  
  /**
   * Tạo một bảng mới là hàng xóm của bảng hiện tại
   * @param {Array} tiles - Bảng hiện tại
   * @param {number} blankRow - Vị trí hàng của ô trống
   * @param {number} blankCol - Vị trí cột của ô trống
   * @param {number} neighborRow - Hàng của ô muốn di chuyển đến
   * @param {number} neighborCol - Cột của ô muốn di chuyển đến
   * @returns {Object} - Bảng hàng xóm và vị trí mới của ô trống
   */
  function createNeighbor(tiles, blankRow, blankCol, neighborRow, neighborCol) {
    swapTiles(tiles, blankRow, blankCol, neighborRow, neighborCol); // Hoán đổi ô
    const neighbor = JSON.parse(JSON.stringify(tiles)); // Tạo bản sao của bảng
    swapTiles(tiles, blankRow, blankCol, neighborRow, neighborCol); // Hoán đổi lại
    return { tiles: neighbor, blankRow: neighborRow, blankCol: neighborCol };
  }
  
  /**
   * Tìm các bảng hàng xóm có thể đạt được từ bảng hiện tại
   * @param {Array} tiles - Bảng hiện tại
   * @param {number} blankRow - Vị trí hàng của ô trống
   * @param {number} blankCol - Vị trí cột của ô trống
   * @returns {Array} - Danh sách các bảng hàng xóm
   */
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
  
  /**
   * Sinh bảng ngẫu nhiên có thể giải được
   * @param {number} dimension - Kích thước bảng
   * @returns {Object} - Bảng ngẫu nhiên
   */
  export function generateRandom(dimension) {
    return shuffleBoard(generateSolved(dimension).tiles);
  }
  
  /**
   * Hàm so sánh hai nút trong hàng đợi ưu tiên
   * @param {Object} n1 - Nút thứ nhất
   * @param {Object} n2 - Nút thứ hai
   * @returns {number} - Kết quả so sánh
   */
  function compare(n1, n2) {
    const priority1 = n1.heuristic * HEURISTIC_FACTOR + n1.steps;
    const priority2 = n2.heuristic * HEURISTIC_FACTOR + n2.steps;
    return priority1 - priority2;
  }
  
  /**
   * Giải bài toán puzzle bằng thuật toán tìm kiếm ưu tiên A*
   * @param {Array} tiles - Bảng ban đầu
   * @param {number} blankRow - Hàng của ô trống
   * @param {number} blankCol - Cột của ô trống
   * @returns {Array} - Chuỗi bước di chuyển để giải bài toán
   */
  export function solve(tiles, blankRow, blankCol) {
    const initial = {
      tiles,
      blankRow,
      blankCol,
      heuristic: heuristic(tiles),
      steps: 0,
      previous: null
    };
    const queue = new TinyQueue([initial], compare); // Khởi tạo hàng đợi ưu tiên
    let searchNode = initial;
  
    while (!isGoal(searchNode.tiles)) {
      searchNode = queue.pop(); // Lấy nút có độ ưu tiên cao nhất
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
  
    const solution = []; // Lưu chuỗi bước di chuyển
    while (searchNode.previous !== null) {
      solution.push(searchNode.tiles);
      searchNode = searchNode.previous;
    }
    return solution.reverse(); // Trả về các bước theo thứ tự
  }
  
