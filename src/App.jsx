import React, { useState, useRef } from "react";
import GameBoard from "./GameBoard";
import Controls from "./Controls";
import { generateRandom, solve, isGoal } from "./BoardUtil";
import "./App.css";

const App = () => {
  const dimension = 4; // Kích thước bảng 
  const [tiles, setTiles] = useState(generateRandom(dimension).tiles);
  const [blankRow, setBlankRow] = useState(dimension - 1);
  const [blankCol, setBlankCol] = useState(dimension - 1);
  const [isSolving, setIsSolving] = useState(false); // Trạng thái đang giải
  const animationTimeouts = useRef([]); // Lưu trữ các timeout để dừng giải

  // Kiểm tra xem ô có kề với ô trống không
  const isAdjacentToBlank = (row, col) => {
    return (
      (row === blankRow && Math.abs(col - blankCol) === 1) || // Cùng hàng, cột kề
      (col === blankCol && Math.abs(row - blankRow) === 1)    // Cùng cột, hàng kề
    );
  };

  // Xử lý di chuyển nút khi người dùng nhấn
  const handleTileClick = (row, col) => {
    if (isAdjacentToBlank(row, col)) {
      const newTiles = JSON.parse(JSON.stringify(tiles));
      [newTiles[blankRow][blankCol], newTiles[row][col]] = [newTiles[row][col], newTiles[blankRow][blankCol]];
      setTiles(newTiles);
      setBlankRow(row);
      setBlankCol(col);
    }
  };

  // Xử lý giải bài toán
  const handleSolve = () => {
    if (isSolving) {
      stopSolution();
      return;
    }

    const solution = solve(tiles, blankRow, blankCol);
    if (!solution.length) {
      alert("Không thể giải được bảng hiện tại!");
      return;
    }

    setIsSolving(true);
    const boardStates = createBoardStates(solution);
    animateSolution(boardStates);
  };

  // Xử lý trộn bảng
  const handleShuffle = () => {
    stopSolution(); // Dừng giải nếu đang chạy
    const { tiles: shuffledTiles, blankRow, blankCol } = generateRandom(dimension);
    setTiles(shuffledTiles);
    setBlankRow(blankRow);
    setBlankCol(blankCol);
  };

  // Tạo danh sách các trạng thái bảng từ bước giải
  const createBoardStates = (solutionSteps) => {
    const boardStates = [];
    let currentTiles = JSON.parse(JSON.stringify(tiles));
    let currentBlankRow = blankRow;
    let currentBlankCol = blankCol;

    for (const step of solutionSteps) {
      const { blankRow: nextRow, blankCol: nextCol } = step;
      [currentTiles[currentBlankRow][currentBlankCol], currentTiles[nextRow][nextCol]] =
        [currentTiles[nextRow][nextCol], currentTiles[currentBlankRow][currentBlankCol]];

      boardStates.push({
        tiles: JSON.parse(JSON.stringify(currentTiles)),
        blankRow: nextRow,
        blankCol: nextCol,
      });

      currentBlankRow = nextRow;
      currentBlankCol = nextCol;
    }

    return boardStates;
  };

  // Hoạt ảnh giải thuật toán
  const animateSolution = (boardStates) => {
    boardStates.forEach((state, index) => {
      const timeout = setTimeout(() => {
        setTiles(state.tiles);
        setBlankRow(state.blankRow);
        setBlankCol(state.blankCol);

        if (index === boardStates.length - 1) {
          // Toàn bộ bước giải đã xong, kiểm tra trạng thái goal
          setTimeout(() => {
            if (isGoal(state.tiles)) {
              alert("Giải xong!");
            }
            setIsSolving(false);
          }, 500); // Đảm bảo trạng thái cuối được cập nhật trước khi alert
        }
      }, index * 200);

      animationTimeouts.current.push(timeout); // Lưu timeout
    });
  };

  // Dừng hoạt ảnh và xóa timeout
  const stopSolution = () => {
    animationTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    animationTimeouts.current = [];
    setIsSolving(false);
  };

  return (
    <div className="app">
      <h1>Sliding Puzzle</h1>
      <GameBoard tiles={tiles} onTileClick={handleTileClick} />
      <Controls
        onSolve={handleSolve}
        onShuffle={handleShuffle}
        isSolving={isSolving}
      />
    </div>
  );
};

export default App;
