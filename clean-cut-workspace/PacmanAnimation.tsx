import React from 'react';
import { useCurrentFrame, interpolate, useVideoConfig, Easing } from 'remotion';



  // Safe interpolation helper - prevents inputRange monotonic errors
  const safeInterpolate = (frame, inputRange, outputRange, options = {}) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputEnd;
    return interpolate(frame, inputRange, outputRange, options);
  };
const PacmanAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Pac-Man movement across screen
  const pacmanX = safeInterpolate(
    frame,
    [0, durationInFrames],
    [50, width - 100],
    {
      easing: Easing.inOut(Easing.ease),
    }
  );

  // Mouth animation (chomping)
  const mouthAngle = safeInterpolate(
    frame % (fps * 0.3),
    [0, fps * 0.15, fps * 0.3],
    [45, 5, 45],
    {
      easing: Easing.inOut(Easing.ease),
    }
  );

  // Ghost positions
  const ghost1X = safeInterpolate(
    frame,
    [0, durationInFrames],
    [-50, width - 150],
    {
      easing: Easing.inOut(Easing.ease),
    }
  );

  const ghost2X = safeInterpolate(
    frame,
    [0, durationInFrames],
    [-100, width - 200],
    {
      easing: Easing.inOut(Easing.ease),
    }
  );

  // Floating animation for ghosts
  const ghost1Y = safeInterpolate(
    frame,
    [0, fps, fps * 2, fps * 3, fps * 4, durationInFrames],
    [0, -10, 0, -8, 0, -5],
    {
      easing: Easing.inOut(Easing.ease),
    }
  );

  const ghost2Y = safeInterpolate(
    frame,
    [0, fps * 0.5, fps * 1.5, fps * 2.5, fps * 3.5, durationInFrames],
    [0, 8, 0, 10, 0, 5],
    {
      easing: Easing.inOut(Easing.ease),
    }
  );

  // Dots positions
  const dots = Array.from({ length: 12 }, (_, i) => ({
    x: 120 + i * 60,
    y: height / 2,
    eaten: pacmanX > 120 + i * 60 - 20,
  }));

  // Score animation
  const score = Math.floor(safeInterpolate(
    frame,
    [0, durationInFrames],
    [0, 1200],
    { easing: Easing.out(Easing.ease) }
  ));

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background grid pattern */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(90deg, #001122 1px, transparent 1px),
            linear-gradient(180deg, #001122 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          opacity: 0.3,
        }}
      />

      {/* Score */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          color: '#FFD700',
          fontSize: '24px',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
        }}
      >
        SCORE: {score.toString().padStart(4, '0')}
      </div>

      {/* Dots */}
      {dots.map((dot, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: dot.x,
            top: dot.y,
            width: dot.eaten ? '0px' : '8px',
            height: dot.eaten ? '0px' : '8px',
            backgroundColor: '#FFD700',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            transition: dot.eaten ? 'all 0.1s ease-out' : 'none',
          }}
        />
      ))}

      {/* Pac-Man */}
      <div
        style={{
          position: 'absolute',
          left: pacmanX,
          top: height / 2,
          width: '60px',
          height: '60px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg width="60" height="60" viewBox="0 0 60 60">
          <defs>
            <mask id="mouth">
              <rect width="60" height="60" fill="white" />
              <polygon
                points={`30,30 ${30 + 25 * Math.cos((mouthAngle * Math.PI) / 180)},${
                  30 - 25 * Math.sin((mouthAngle * Math.PI) / 180)
                } ${30 + 25 * Math.cos((-mouthAngle * Math.PI) / 180)},${
                  30 - 25 * Math.sin((-mouthAngle * Math.PI) / 180)
                }`}
                fill="black"
              />
            </mask>
          </defs>
          <circle
            cx="30"
            cy="30"
            r="28"
            fill="#FFD700"
            stroke="#FFA500"
            strokeWidth="2"
            mask="url(#mouth)"
          />
          <circle cx="22" cy="22" r="3" fill="#000" />
        </svg>
      </div>

      {/* Ghost 1 (Red) */}
      <div
        style={{
          position: 'absolute',
          left: ghost1X,
          top: height / 2 + ghost1Y,
          width: '50px',
          height: '50px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg width="50" height="50" viewBox="0 0 50 50">
          <path
            d="M25 5 C15 5, 5 15, 5 25 L5 40 L10 35 L15 40 L20 35 L25 40 L30 35 L35 40 L40 35 L45 40 L45 25 C45 15, 35 5, 25 5 Z"
            fill="#FF0000"
            stroke="#CC0000"
            strokeWidth="1"
          />
          <circle cx="18" cy="20" r="4" fill="white" />
          <circle cx="32" cy="20" r="4" fill="white" />
          <circle cx="18" cy="20" r="2" fill="black" />
          <circle cx="32" cy="20" r="2" fill="black" />
        </svg>
      </div>

      {/* Ghost 2 (Blue) */}
      <div
        style={{
          position: 'absolute',
          left: ghost2X,
          top: height / 2 + ghost2Y,
          width: '50px',
          height: '50px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg width="50" height="50" viewBox="0 0 50 50">
          <path
            d="M25 5 C15 5, 5 15, 5 25 L5 40 L10 35 L15 40 L20 35 L25 40 L30 35 L35 40 L40 35 L45 40 L45 25 C45 15, 35 5, 25 5 Z"
            fill="#00FFFF"
            stroke="#0088CC"
            strokeWidth="1"
          />
          <circle cx="18" cy="20" r="4" fill="white" />
          <circle cx="32" cy="20" r="4" fill="white" />
          <circle cx="18" cy="20" r="2" fill="black" />
          <circle cx="32" cy="20" r="2" fill="black" />
        </svg>
      </div>

      {/* Power pellet (blinking) */}
      <div
        style={{
          position: 'absolute',
          left: width - 80,
          top: height / 2,
          width: '16px',
          height: '16px',
          backgroundColor: '#FFD700',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: Math.sin((frame * Math.PI) / (fps * 0.5)) > 0 ? 1 : 0.3,
          boxShadow: '0 0 10px #FFD700',
        }}
      />

      {/* Game title */}
      <div
        style={{
          position: 'absolute',
          top: height - 40,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#FFD700',
          fontSize: '18px',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        PAC-MAN
      </div>
    </div>
  );
};

export { PacmanAnimation };