import React, { useState, useEffect, useCallback } from "react";

const ROWS = 20;
const COLUMNS = 10;
const SHAPES = [
  { shape: [[1, 1, 1, 1]], color: "cyan" }, // I
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "yellow",
  }, // O
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "purple",
  }, // T
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "red",
  }, // Z
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "green",
  }, // S
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "orange",
  }, // L
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "blue",
  }, // J
];

const randomShape = () => SHAPES[Math.floor(Math.random() * SHAPES.length)];

const App = () => {
  const [grid, setGrid] = useState(
    Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0))
  );
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [currentPiece, setCurrentPiece] = useState(randomShape());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const checkCollision = (x, y, shape) => {
    return shape.some((row, rIdx) =>
      row.some((cell, cIdx) => {
        if (cell) {
          const newX = x + cIdx;
          const newY = y + rIdx;
          if (
            newY >= ROWS ||
            newX < 0 ||
            newX >= COLUMNS ||
            (grid[newY] && grid[newY][newX])
          ) {
            return true;
          }
        }
        return false;
      })
    );
  };

  const clearLines = (newGrid) => {
    const filteredGrid = newGrid.filter((row) =>
      row.some((cell) => cell === 0)
    );
    const clearedLines = ROWS - filteredGrid.length;
    if (clearedLines > 0) {
      setScore((prev) => prev + clearedLines * 100);
      while (filteredGrid.length < ROWS) {
        filteredGrid.unshift(Array(COLUMNS).fill(0));
      }
    }
    return filteredGrid;
  };

  const placeShape = () => {
    const newGrid = grid.map((row) => [...row]);
    currentPiece.shape.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        if (cell) {
          newGrid[position.y + rIdx][position.x + cIdx] = currentPiece.color;
        }
      });
    });
    setGrid(clearLines(newGrid));
    setPosition({ x: 3, y: 0 });
    setCurrentPiece(randomShape());

    if (checkCollision(3, 0, currentPiece.shape)) {
      setGameOver(true);
      alert(`Game Over! Final Score: ${score}\n¿Quieres volver a jugar?`);
      resetGame();
    }
  };

  const moveDown = useCallback(() => {
    if (!checkCollision(position.x, position.y + 1, currentPiece.shape)) {
      setPosition((prev) => ({ ...prev, y: prev.y + 1 }));
    } else {
      placeShape();
    }
  }, [position, currentPiece, grid]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(moveDown, 500);
    return () => clearInterval(interval);
  }, [moveDown, gameOver]);

  const moveLeft = () => {
    if (!checkCollision(position.x - 1, position.y, currentPiece.shape)) {
      setPosition((prev) => ({ ...prev, x: Math.max(prev.x - 1, 0) }));
    }
  };

  const moveRight = () => {
    if (!checkCollision(position.x + 1, position.y, currentPiece.shape)) {
      setPosition((prev) => ({
        ...prev,
        x: Math.min(prev.x + 1, COLUMNS - currentPiece.shape[0].length),
      }));
    }
  };

  const rotate = () => {
    const rotated = currentPiece.shape[0]
      .map((_, index) => currentPiece.shape.map((row) => row[index]))
      .reverse();
    if (!checkCollision(position.x, position.y, rotated)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  };

  const resetGame = () => {
    setGrid(Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0)));
    setPosition({ x: 3, y: 0 });
    setCurrentPiece(randomShape());
    setGameOver(false);
    setScore(0);
  };

  return (
    <div
      style={{
        textAlign: "center",
        backgroundColor: "black",
        color: "white",
        height: "100vh",
      }}
    >
      <h1>Tetris</h1>
      <h2>Score: {score}</h2>
      {gameOver && <h2 style={{ color: "red" }}>Game Over</h2>}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLUMNS}, 20px)`,
          gap: "1px",
          justifyContent: "center",
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isBlock = currentPiece.shape.some((r, rIdx) =>
              r.some(
                (c, cIdx) =>
                  c &&
                  rowIndex === position.y + rIdx &&
                  colIndex === position.x + cIdx
              )
            );
            const color = isBlock ? currentPiece.color : cell || "white";
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: color,
                  border: "1px solid gray",
                }}
              />
            );
          })
        )}
      </div>
      <div style={{ marginTop: "20px" }}>
        <button onClick={moveLeft}>⬅</button>
        <button onClick={rotate}>🔄</button>
        <button onClick={moveRight}>➡</button>
        <button onClick={moveDown}>⬇</button>
      </div>
    </div>
  );
};

export default App;
