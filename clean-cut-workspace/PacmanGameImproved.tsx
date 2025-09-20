import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

const PacmanGameImproved: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Classic Pacman maze layout (simplified version)
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

  // Pacman position animation - much slower movement
  const pacmanPath = [
    { x: 1, y: 23, dir: 'right' },
    { x: 8, y: 23, dir: 'up' },
    { x: 8, y: 21, dir: 'right' },
    { x: 13, y: 21, dir: 'down' },
    { x: 13, y: 23, dir: 'right' },
    { x: 26, y: 23, dir: 'up' },
    { x: 26, y: 21, dir: 'left' },
    { x: 19, y: 21, dir: 'up' },
    { x: 19, y: 19, dir: 'left' },
    { x: 13, y: 19, dir: 'down' },
    { x: 13, y: 21, dir: 'left' },
    { x: 8, y: 21, dir: 'down' },
    { x: 8, y: 23, dir: 'left' },
    { x: 1, y: 23, dir: 'right' }
  ];

  const pathProgress = (frame / fps) * 0.15; // Much slower - complete path in ~80 seconds
  const pathIndex = Math.floor(pathProgress * pacmanPath.length) % pacmanPath.length;
  const currentPos = pacmanPath[pathIndex];
  const nextPos = pacmanPath[(pathIndex + 1) % pacmanPath.length];
  const segmentProgress = (pathProgress * pacmanPath.length) % 1;

  // Smooth interpolate between current and next position
  const smoothProgress = segmentProgress * segmentProgress * (3 - 2 * segmentProgress);
  const pacmanX = interpolate(smoothProgress, [0, 1], [currentPos.x, nextPos.x]);
  const pacmanY = interpolate(smoothProgress, [0, 1], [currentPos.y, nextPos.y]);

  // Ghost positions with individual movement patterns
  const ghosts = [
    { x: 13.5, y: 11, color: '#FF0000', name: 'blinky', baseX: 13.5, baseY: 11 }, // Red
    { x: 14.5, y: 11, color: '#FFB8FF', name: 'pinky', baseX: 14.5, baseY: 11 }, // Pink
    { x: 13.5, y: 12, color: '#00FFFF', name: 'inky', baseX: 13.5, baseY: 12 },  // Cyan
    { x: 14.5, y: 12, color: '#FFB852', name: 'clyde', baseX: 14.5, baseY: 12 }  // Orange
  ];

  // Ghost movement patterns - each ghost moves differently
  const getGhostPosition = (ghost: typeof ghosts[0], index: number) => {
    const time = frame * 0.05;
    
    if (frame > fps * 3) { // Start moving after 3 seconds
      switch (index) {
        case 0: // Blinky - moves in figure 8 pattern
          return {
            x: ghost.baseX + Math.sin(time * 0.8) * 3,
            y: ghost.baseY + Math.sin(time * 1.6) * 2
          };
        case 1: // Pinky - moves in circles
          return {
            x: ghost.baseX + Math.cos(time) * 2.5,
            y: ghost.baseY + Math.sin(time) * 2.5
          };
        case 2: // Inky - moves back and forth
          return {
            x: ghost.baseX + Math.sin(time * 1.2) * 4,
            y: ghost.baseY + Math.cos(time * 0.6) * 1.5
          };
        case 3: // Clyde - moves up and down primarily
          return {
            x: ghost.baseX + Math.cos(time * 0.7) * 1.5,
            y: ghost.baseY + Math.sin(time * 1.5) * 3
          };
        default:
          return { x: ghost.baseX, y: ghost.baseY };
      }
    }
    return { x: ghost.baseX, y: ghost.baseY };
  };

  // Pacman mouth animation - slower
  const mouthAngle = Math.abs(Math.sin(frame * 0.2)) * 70;

  // Direction angles
  const directionAngles = {
    'right': 0,
    'down': 90,
    'left': 180,
    'up': 270
  };

  const pacmanRotation = directionAngles[currentPos.dir] || 0;

  // Larger cell size for bigger characters
  const cellSize = 24;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative', transform: 'scale(1.4)' }}>
        {/* Render maze */}
        {maze.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex', height: cellSize }}>
            {row.split('').map((cell, colIndex) => {
              let cellContent = null;
              let backgroundColor = 'transparent';

              if (cell === '#') {
                backgroundColor = '#0000FF';
              } else if (cell === '.') {
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

        {/* Pacman - Much Bigger and Clearer */}
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
              boxShadow: '0 0 10px rgba(255, 255, 0, 0.5)',
              clipPath: mouthAngle > 5 ? 
                `polygon(50% 50%, ${50 + 45 * Math.cos((mouthAngle * Math.PI) / 180)}% ${50 + 45 * Math.sin((mouthAngle * Math.PI) / 180)}%, 100% 50%, ${50 + 45 * Math.cos((-mouthAngle * Math.PI) / 180)}% ${50 + 45 * Math.sin((-mouthAngle * Math.PI) / 180)}%)` 
                : 'none'
            }}
          />
        </div>

        {/* Ghosts - Bigger and with Movement */}
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

        {/* Score display */}
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
          {String(Math.floor(frame * 8)).padStart(6, ' ')}    {String(50000).padStart(6, ' ')}
        </div>

        {/* Ready text (appears at start) */}
        {frame < fps * 3 && (
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

        {/* Level indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            right: 0,
            color: '#FFFF00',
            fontFamily: 'monospace',
            fontSize: 14,
            fontWeight: 'bold'
          }}
        >
          LEVEL 1
        </div>
      </div>
    </AbsoluteFill>
  );
};

export { PacmanGameImproved };