import React from "react";

const Controls = ({ onSolve, onShuffle, isSolving }) => {
  return (
    <div className="controls">
      <button onClick={onShuffle}>Trộn</button>
      <button onClick={onSolve}>
        {isSolving ? "Dừng" : "Giải"}
      </button>
    </div>
  );
};

export default Controls;
