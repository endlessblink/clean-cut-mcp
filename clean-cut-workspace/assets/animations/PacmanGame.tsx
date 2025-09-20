import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

const PacmanGame: React.FC = () => {
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

  // Pacman position animation
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

  const pathProgress = (frame / fps) * 0.8; // Complete path in 15 seconds
  const pathIndex = Math.floor(pathProgress * pacmanPath.length) % pacmanPath.length;
  const currentPos = pacmanPath[pathIndex];
  const nextPos = pacmanPath[(pathIndex + 1) % pacmanPath.length];
  const segmentProgress = (pathProgress * pacmanPath.length) % 1;

  // Interpolate between current and next position
  const pacmanX = interpolate(segmentProgress, [0, 1], [currentPos.x, nextPos.x]);
  const pacmanY = interpolate(segmentProgress, [0, 1], [currentPos.y, nextPos.y]);

  // Ghost positions
  const ghosts = [
    { x: 13.5, y: 11, color: '#FF0000', name: 'blinky' }, // Red
    { x: 14.5, y: 11, color: '#FFB8FF', name: 'pinky' }, // Pink
    { x: 13.5, y: 12, color: '#00FFFF', name: 'inky' },  // Cyan
    { x: 14.5, y: 12, color: '#FFB852', name: 'clyde' }  // Orange
  ];

  // Ghost animation
  const ghostOffset = Math.sin(frame * 0.3) * 0.3;

  // Pacman mouth animation
  const mouthAngle = Math.abs(Math.sin(frame * 0.4)) * 60;

  // Direction angles
  const directionAngles = {
    'right': 0,
    'down': 90,
    'left': 180,
    'up': 270
  };

  const pacmanRotation = directionAngles[currentPos.dir] || 0;

  // Cell size
  const cellSize = 20;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative', transform: 'scale(1.2)' }}>
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
                      width: 2,
                      height: 2,
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
                      width: 8,
                      height: 8,
                      backgroundColor: '#FFFF00',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
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

        {/* Pacman */}
        <div
          style={{
            position: 'absolute',
            left: pacmanX * cellSize,
            top: pacmanY * cellSize,
            width: cellSize,
            height: cellSize,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: `rotate(${pacmanRotation}deg)`
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              backgroundColor: '#FFFF00',
              borderRadius: '50%',
              position: 'relative',
              clipPath: `polygon(50% 50%, ${50 + 40 * Math.cos((mouthAngle * Math.PI) / 180)}% ${50 + 40 * Math.sin((mouthAngle * Math.PI) / 180)}%, 100% 50%, ${50 + 40 * Math.cos((-mouthAngle * Math.PI) / 180)}% ${50 + 40 * Math.sin((-mouthAngle * Math.PI) / 180)}%)`
            }}
          />
        </div>

        {/* Ghosts */}
        {ghosts.map((ghost, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: ghost.x * cellSize,
              top: (ghost.y + ghostOffset * Math.sin(frame * 0.2 + index)) * cellSize,
              width: cellSize,
              height: cellSize,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {/* Ghost body */}
            <div
              style={{
                width: 16,
                height: 20,
                backgroundColor: ghost.color,
                borderRadius: '8px 8px 0 0',
                position: 'relative'
              }}
            >
              {/* Ghost eyes */}
              <div
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 3,
                  width: 3,
                  height: 4,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 3,
                  width: 3,
                  height: 4,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 5,
                  left: 4,
                  width: 1,
                  height: 2,
                  backgroundColor: '#000000',
                  borderRadius: '50%'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 4,
                  width: 1,
                  height: 2,
                  backgroundColor: '#000000',
                  borderRadius: '50%'
                }}
              />
              
              {/* Ghost bottom wavy edge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -2,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(45deg, ${ghost.color} 25%, transparent 25%), linear-gradient(-45deg, ${ghost.color} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${ghost.color} 75%), linear-gradient(-45deg, transparent 75%, ${ghost.color} 75%)`,
                  backgroundSize: '4px 4px',
                  backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
                }}
              />
            </div>
          </div>
        ))}

        {/* Score display */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            left: 0,
            color: '#FFFF00',
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 'bold'
          }}
        >
          1UP    HIGH SCORE
        </div>
        <div
          style={{
            position: 'absolute',
            top: -20,
            left: 0,
            color: '#FFFFFF',
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 'bold'
          }}
        >
          {String(frame * 10).padStart(6, ' ')}    {String(50000).padStart(6, ' ')}
        </div>

        {/* Ready text (appears at start) */}
        {frame < fps * 2 && (
          <div
            style={{
              position: 'absolute',
              top: 14 * cellSize,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#FFFF00',
              fontFamily: 'monospace',
              fontSize: 16,
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            READY!
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export { PacmanGame };