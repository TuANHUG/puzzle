import React from "react";

const GameBoard = ({ tiles, onTileClick }) => {
  const dimension = tiles.length;

  return (
    <div
      className="game-board"
      style={{
        gridTemplateColumns: `repeat(${dimension}, 1fr)`,
        gridTemplateRows: `repeat(${dimension}, 1fr)`,
      }}
    >
      {tiles.flat().map((tile, index) => {
        const row = Math.floor(index / dimension);
        const col = index % dimension;
        return (
          <div
            key={index}
            className={`tile ${tile === 0 ? "blank" : ""}`}
            style={{
              backgroundColor: tile === 0 ? "#ccc" : "#eee",
            }}
            onClick={() => onTileClick(row, col)} // Gọi hàm khi nhấn
          >
            {tile !== 0 ? tile : ""}
          </div>
        );
      })}
    </div>
  );
};

export default GameBoard;
