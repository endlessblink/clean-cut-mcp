import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

const PacmanMazeRunner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Classic Pacman maze layout
  const maze = [
    "############################",
    "#............##............#",
    "#.####.#####.##.#####.####.#",
    "#o####.#####.##.#####.####o#",
    "#..........................#",
    "#.####.##.########.##.####.#",
    "#......##....##....##......#",
    "######.#####.##.#####.######",
    "     #.#####.##.#####.#     ",
    "     #.##..........##.#     ",
    "     #.##.###--###.##.#     ",
    "######.##.#      #.##.######",
    "      ....#      #....      ",
    "######.##.#      #.##.######",
    "     #.##.########.##.#     ",
    "     #.##..........##.#     ",
    "     #.##.########.##.#     ",
    "######.##.########.##.######",
    "#............##............#",
    "#.####.#####.##.#####.####.#",
    "#o..##................##..o#",
    "###.##.##.########.##.##.###",
    "#......##....##....##......#",
    "#.##########.##.##########.#",
    "#..........................#",
    "############################"
  ];

  // Function to check if a cell is walkable (not a wall)
  const isWalkable = (x: number, y: number) => {
    if (x < 0 || x >= 28 || y < 0 || y >= 26) return false;
    const cell = maze[y]?.[x];
    return cell === '.' || cell === 'o' || cell === ' ';
  };

  // Pacman follows actual maze pathways - comprehensive route through corridors
  const pacmanPath = [
    // Start at bottom left
    { x: 1, y: 24, dir: 'right' },
    // Move right along bottom corridor
    { x: 5, y: 24, dir: 'right' },
    { x: 10, y: 24, dir: 'right' },
    { x: 13, y: 24, dir: 'up' },
    // Go up through center
    { x: 13, y: 22, dir: 'right' },
    { x: 18, y: 22, dir: 'right' },
    { x: 21, y: 22, dir: 'up' },
    { x: 21, y: 20, dir: 'right' },
    { x: 26, y: 20, dir: 'up' },
    // Move up right side
    { x: 26, y: 18, dir: 'up' },
    { x: 26, y: 15, dir: 'up' },
    { x: 26, y: 12, dir: 'up' },
    { x: 26, y: 9, dir: 'up' },
    { x: 26, y: 6, dir: 'up' },
    { x: 26, y: 4, dir: 'left' },
    // Move left across top
    { x: 21, y: 4, dir: 'left' },
    { x: 18, y: 4, dir: 'left' },
    { x: 15, y: 4, dir: 'left' },
    { x: 12, y: 4, dir: 'left' },
    { x: 9, y: 4, dir: 'left' },
    { x: 6, y: 4, dir: 'left' },
    { x: 3, y: 4, dir: 'left' },
    { x: 1, y: 4, dir: 'down' },
    // Move down left side
    { x: 1, y: 6, dir: 'down' },
    { x: 1, y: 9, dir: 'down' },
    { x: 1, y: 12, dir: 'down' },
    { x: 1, y: 15, dir: 'down' },
    { x: 1, y: 18, dir: 'down' },
    { x: 1, y: 20, dir: 'right' },
    { x: 6, y: 20, dir: 'up' },
    { x: 6, y: 18, dir: 'right' },
    // Navigate through inner corridors
    { x: 9, y: 18, dir: 'down' },
    { x: 9, y: 20, dir: 'right' },
    { x: 12, y: 20, dir: 'down' },
    { x: 12, y: 22, dir: 'left' },
    { x: 9, y: 22, dir: 'down' },
    { x: 9, y: 24, dir: 'left' },
    { x: 6, y: 24, dir: 'up' },
    { x: 6, y: 22, dir: 'left' },
    { x: 1, y: 22, dir: 'up' },
    { x: 1, y: 20, dir: 'right' },
    // Continue around inner maze
    { x: 3, y: 20, dir: 'up' },
    { x: 3, y: 18, dir: 'right' },
    { x: 6, y: 18, dir: 'up' },
    { x: 6, y: 15, dir: 'right' },
    { x: 9, y: 15, dir: 'up' },
    { x: 9, y: 12, dir: 'right' },
    { x: 12, y: 12, dir: 'right' },
    { x: 15, y: 12, dir: 'right' },
    { x: 18, y: 12, dir: 'up' },
    { x: 18, y: 9, dir: 'right' },
    { x: 21, y: 9, dir: 'down' },
    { x: 21, y: 12, dir: 'right' },
    { x: 24, y: 12, dir: 'down' },
    { x: 24, y: 15, dir: 'left' },
    { x: 21, y: 15, dir: 'down' },
    { x: 21, y: 18, dir: 'left' },
    { x: 18, y: 18, dir: 'down' },
    { x: 18, y: 20, dir: 'left' },
    { x: 15, y: 20, dir: 'down' },
    { x: 15, y: 22, dir: 'right' },
    { x: 18, y: 22, dir: 'down' },
    { x: 18, y: 24, dir: 'right' },
    { x: 21, y: 24, dir: 'right' },
    { x: 24, y: 24, dir: 'right' },
    { x: 26, y: 24, dir: 'up' },
    { x: 26, y: 22, dir: 'left' },
    { x: 24, y: 22, dir: 'up' },
    { x: 24, y: 20, dir: 'left' },
    { x: 21, y: 20, dir: 'down' },
    { x: 21, y: 22, dir: 'left' },
    { x: 18, y: 22, dir: 'left' },
    { x: 15, y: 22, dir: 'left' },
    { x: 12, y: 22, dir: 'up' },
    { x: 12, y: 20, dir: 'left' },
    { x: 9, y: 20, dir: 'up' },
    { x: 9, y: 18, dir: 'left' },
    { x: 6, y: 18, dir: 'down' },
    { x: 6, y: 20, dir: 'left' },
    { x: 3, y: 20, dir: 'down' },
    { x: 3, y: 22, dir: 'left' },
    { x: 1, y: 22, dir: 'down' },
    { x: 1, y: 24, dir: 'right' }
  ];

  const pathProgress = (frame / fps) * 0.3; // Moderate speed
  const pathIndex = Math.floor(pathProgress * pacmanPath.length) % pacmanPath.length;
  const currentPos = pacmanPath[pathIndex];
  const nextPos = pacmanPath[(pathIndex + 1) % pacmanPath.length];
  const segmentProgress = (pathProgress * pacmanPath.length) % 1;

  // Smooth interpolate between current and next position
  const smoothProgress = segmentProgress * segmentProgress * (3 - 2 * segmentProgress);
  const pacmanX = interpolate(smoothProgress, [0, 1], [currentPos.x, nextPos.x]);
  const pacmanY = interpolate(smoothProgress, [0, 1], [currentPos.y, nextPos.y]);

  // Ghost positions with realistic maze-aware movement
  const ghosts = [
    { x: 13.5, y: 11, color: '#FF0000', name: 'blinky', baseX: 13.5, baseY: 11 }, // Red
    { x: 14.5, y: 11, color: '#FFB8FF', name: 'pinky', baseX: 14.5, baseY: 11 }, // Pink
    { x: 13.5, y: 12, color: '#00FFFF', name: 'inky', baseX: 13.5, baseY: 12 },  // Cyan
    { x: 14.5, y: 12, color: '#FFB852', name: 'clyde', baseX: 14.5, baseY: 12 }  // Orange
  ];

  // Ghost movement - they move in the ghost house initially, then venture out
  const getGhostPosition = (ghost: typeof ghosts[0], index: number) => {
    const time = frame * 0.03;
    
    if (frame > fps * 2) { // Start moving after 2 seconds
      switch (index) {
        case 0: // Blinky - exits first, patrols top area
          if (frame > fps * 3) {
            return {
              x: 14 + Math.sin(time * 0.5) * 8,
              y: 6 + Math.cos(time * 0.3) * 4
            };
          }
          break;
        case 1: // Pinky - exits second, patrols corners
          if (frame > fps * 4) {
            return {
              x: 21 + Math.cos(time * 0.7) * 5,
              y: 18 + Math.sin(time * 0.4) * 3
            };
          }
          break;
        case 2: // Inky - exits third, patrols bottom
          if (frame > fps * 5) {
            return {
              x: 7 + Math.sin(time * 0.9) * 6,
              y: 22 + Math.cos(time * 0.6) * 2
            };
          }
          break;
        case 3: // Clyde - exits last, stays near center
          if (frame > fps * 6) {
            return {
              x: ghost.baseX + Math.cos(time * 0.4) * 3,
              y: ghost.baseY + Math.sin(time * 0.8) * 4
            };
          }
          break;
      }
    }
    
    // Default ghost house movement
    return {
      x: ghost.baseX + Math.sin(time + index) * 0.5,
      y: ghost.baseY + Math.cos(time * 1.5 + index) * 0.3
    };
  };

  // Pacman mouth animation
  const mouthAngle = Math.abs(Math.sin(frame * 0.3)) * 60;

  // Direction angles
  const directionAngles = {
    'right': 0,
    'down': 90,
    'left': 180,
    'up': 270
  };

  const pacmanRotation = directionAngles[currentPos.dir] || 0;
  const cellSize = 24;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative', transform: 'scale(1.3)' }}>
        {/* Render maze */}
        {maze.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex', height: cellSize }}>
            {row.split('').map((cell, colIndex) => {
              let cellContent = null;
              let backgroundColor = 'transparent';

              if (cell === '#') {
                backgroundColor = '#0000FF';
              } else if (cell === '.') {
                // Hide dots that Pacman has eaten
                const dotEaten = pacmanPath.some((pos, index) => {
                  if (index <= pathIndex) {
                    return Math.abs(pos.x - colIndex) < 0.8 && Math.abs(pos.y - rowIndex) < 0.8;
                  }
                  return false;
                });
                
                if (!dotEaten) {
                  cellContent = (
                    <div
                      style={{
                        width: 3,
                        height: 3,
                        backgroundColor: '#FFFF00',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  );
                }
              } else if (cell === 'o') {
                cellContent = (
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      backgroundColor: '#FFFF00',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      boxShadow: '0 0 8px #FFFF00'
                    }}
                  />
                );
              } else if (cell === '-') {
                backgroundColor = '#FF69B4';
              }

              return (
                <div
                  key={colIndex}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor,
                    position: 'relative',
                    border: cell === '#' ? '1px solid #4040FF' : 'none'
                  }}
                >
                  {cellContent}
                </div>
              );
            })}
          </div>
        ))}

        {/* Pacman - Following maze paths */}
        <div
          style={{
            position: 'absolute',
            left: pacmanX * cellSize - 2,
            top: pacmanY * cellSize - 2,
            width: cellSize + 4,
            height: cellSize + 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: `rotate(${pacmanRotation}deg)`,
            zIndex: 10
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              backgroundColor: '#FFFF00',
              borderRadius: '50%',
              position: 'relative',
              border: '2px solid #FFD700',
              boxShadow: '0 0 12px rgba(255, 255, 0, 0.6)',
              clipPath: mouthAngle > 5 ? 
                `polygon(50% 50%, ${50 + 45 * Math.cos((mouthAngle * Math.PI) / 180)}% ${50 + 45 * Math.sin((mouthAngle * Math.PI) / 180)}%, 100% 50%, ${50 + 45 * Math.cos((-mouthAngle * Math.PI) / 180)}% ${50 + 45 * Math.sin((-mouthAngle * Math.PI) / 180)}%)` 
                : 'none'
            }}
          />
        </div>

        {/* Ghosts with realistic behavior */}
        {ghosts.map((ghost, index) => {
          const ghostPos = getGhostPosition(ghost, index);
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: ghostPos.x * cellSize - 1,
                top: ghostPos.y * cellSize - 1,
                width: cellSize + 2,
                height: cellSize + 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 5
              }}
            >
              {/* Ghost body */}
              <div
                style={{
                  width: 20,
                  height: 24,
                  backgroundColor: ghost.color,
                  borderRadius: '10px 10px 0 0',
                  position: 'relative',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: `0 0 8px ${ghost.color}80`
                }}
              >
                {/* Ghost eyes */}
                <div
                  style={{
                    position: 'absolute',
                    top: 5,
                    left: 4,
                    width: 4,
                    height: 5,
                    backgroundColor: '#FFFFFF',
                    borderRadius: '50%'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 4,
                    width: 4,
                    height: 5,
                    backgroundColor: '#FFFFFF',
                    borderRadius: '50%'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    left: 6,
                    width: 2,
                    height: 3,
                    backgroundColor: '#000000',
                    borderRadius: '50%'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 2,
                    height: 3,
                    backgroundColor: '#000000',
                    borderRadius: '50%'
                  }}
                />
                
                {/* Ghost bottom wavy edge */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: `linear-gradient(45deg, ${ghost.color} 25%, transparent 25%), linear-gradient(-45deg, ${ghost.color} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${ghost.color} 75%), linear-gradient(-45deg, transparent 75%, ${ghost.color} 75%)`,
                    backgroundSize: '5px 5px',
                    backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Game UI */}
        <div
          style={{
            position: 'absolute',
            top: -50,
            left: 0,
            color: '#FFFF00',
            fontFamily: 'monospace',
            fontSize: 18,
            fontWeight: 'bold'
          }}
        >
          1UP    HIGH SCORE
        </div>
        <div
          style={{
            position: 'absolute',
            top: -25,
            left: 0,
            color: '#FFFFFF',
            fontFamily: 'monospace',
            fontSize: 18,
            fontWeight: 'bold'
          }}
        >
          {String(Math.floor(pathIndex * 10 + 100)).padStart(6, ' ')}    {String(50000).padStart(6, ' ')}
        </div>

        {/* Ready text */}
        {frame < fps * 2 && (
          <div
            style={{
              position: 'absolute',
              top: 14 * cellSize,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#FFFF00',
              fontFamily: 'monospace',
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              textShadow: '0 0 10px #FFFF00'
            }}
          >
            READY!
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export { PacmanMazeRunner };