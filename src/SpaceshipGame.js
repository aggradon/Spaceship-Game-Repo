import React, { useRef, useState, useEffect, useCallback } from 'react';
import './SpaceshipGame.css'; // We'll create this file for styles

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 400;
const LANE_WIDTH = CANVAS_WIDTH / 3;
const SHIP_SIZE = 40; // Adjust size for emoji
const OBSTACLE_SIZE = 30; // Adjust size for emoji
const GAME_SPEED = 2;
const OBSTACLE_SPACING = 100; // Minimum vertical space between obstacles

const SpaceshipGame = () => {
  const canvasRef = useRef(null);
  const [shipLane, setShipLane] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const obstaclesRef = useRef([]);
  const gameLoopRef = useRef(null);

  const gameLoop = useRef(() => {}).current;

  const restartGame = () => {
    setGameOver(false);
    setShipLane(1);
    obstaclesRef.current = [];
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop.current);
  };

  const handleKeyDown = useCallback((e) => {
    if (gameOver) return;
    if (e.key === 'ArrowLeft' && shipLane > 0) {
      setShipLane(prev => prev - 1);
    } else if (e.key === 'ArrowRight' && shipLane < 2) {
      setShipLane(prev => prev + 1);
    }
  }, [gameOver, shipLane]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    gameLoop.current = () => {
      if (gameOver) return;

      // Clear canvas and draw lanes
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw lanes
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * LANE_WIDTH, 0);
        ctx.lineTo(i * LANE_WIDTH, CANVAS_HEIGHT);
        ctx.stroke();
      }

      // Draw ship (spaceship emoji)
      ctx.font = `${SHIP_SIZE}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚀', 
        shipLane * LANE_WIDTH + LANE_WIDTH / 2,
        CANVAS_HEIGHT - SHIP_SIZE / 2 - 10
      );

      // Update obstacles
      obstaclesRef.current = obstaclesRef.current
        .map(obs => ({ ...obs, y: obs.y + GAME_SPEED }))
        .filter(obs => obs.y < CANVAS_HEIGHT);

      // Add new obstacle
      if (Math.random() < 0.02) {
        const currentObstacles = obstaclesRef.current.filter(obs => obs.y < OBSTACLE_SIZE);
        const occupiedLanes = currentObstacles.map(obs => obs.lane);
        const availableLanes = [0, 1, 2].filter(lane => !occupiedLanes.includes(lane));

        if (availableLanes.length > 0) {
          const obstacleLane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
          const newObstacle = {
            x: obstacleLane * LANE_WIDTH + LANE_WIDTH / 2,
            y: 0,
            lane: obstacleLane,
          };
          obstaclesRef.current.push(newObstacle);
        }
      }

      // Draw obstacles (moon emoji)
      ctx.font = `${OBSTACLE_SIZE}px Arial`;
      obstaclesRef.current.forEach(obs => {
        ctx.fillText('🌑', obs.x, obs.y + OBSTACLE_SIZE / 2);
      });

      // Check collision
      const shipY = CANVAS_HEIGHT - SHIP_SIZE - 10;
      const shipX = shipLane * LANE_WIDTH + LANE_WIDTH / 2;
      if (obstaclesRef.current.some(obs => 
        Math.abs(obs.x - shipX) < SHIP_SIZE / 2 &&
        Math.abs(obs.y - shipY) < SHIP_SIZE / 2
      )) {
        setGameOver(true);
        return;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop.current);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop.current);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameOver, shipLane]);

  return (
    <div className="game-container">
      <h1>Spaceship Game</h1>
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT} 
        onClick={() => gameOver && restartGame()}
      />
      {gameOver && (
        <div className="game-over">
          <p>Game Over!</p>
          <button onClick={restartGame}>Restart</button>
        </div>
      )}
    </div>
  );
};

export default SpaceshipGame;

