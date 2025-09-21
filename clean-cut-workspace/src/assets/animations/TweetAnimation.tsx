import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const TweetAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Animation timings
  const headerDelay = 0;
  const klingTweetDelay = fps * 1;
  const pakmanTweetDelay = fps * 4;
  const kdawgTweetDelay = fps * 7;
  const videoPlayerDelay = fps * 2.5;

  // Header animation
  const headerOpacity = interpolate(
    frame,
    [headerDelay, headerDelay + fps * 0.8],
    [0, 1],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }
  );

  const headerY = interpolate(
    frame,
    [headerDelay, headerDelay + fps * 0.8],
    [-30, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.back) }
  );

  // Kling AI tweet animation
  const klingOpacity = interpolate(
    frame,
    [klingTweetDelay, klingTweetDelay + fps * 1],
    [0, 1],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }
  );

  const klingScale = interpolate(
    frame,
    [klingTweetDelay, klingTweetDelay + fps * 1],
    [0.8, 1],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.back) }
  );

  // Video player animation
  const videoOpacity = interpolate(
    frame,
    [videoPlayerDelay, videoPlayerDelay + fps * 1],
    [0, 1],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }
  );

  const videoScale = interpolate(
    frame,
    [videoPlayerDelay, videoPlayerDelay + fps * 1.2],
    [0.9, 1],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.back) }
  );

  // Pakman tweet animation
  const pakmanOpacity = interpolate(
    frame,
    [pakmanTweetDelay, pakmanTweetDelay + fps * 1.2],
    [0, 1],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }
  );

  const pakmanX = interpolate(
    frame,
    [pakmanTweetDelay, pakmanTweetDelay + fps * 1.2],
    [50, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.back) }
  );

  // Kdawg tweet animation
  const kdawgOpacity = interpolate(
    frame,
    [kdawgTweetDelay, kdawgTweetDelay + fps * 1.2],
    [0, 1],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }
  );

  const kdawgX = interpolate(
    frame,
    [kdawgTweetDelay, kdawgTweetDelay + fps * 1.2],
    [-50, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.back) }
  );

  // Floating animation for engagement stats
  const floatY = interpolate(
    frame,
    [0, fps * 2, fps * 4, fps * 6],
    [0, -5, 0, -3],
    { easing: Easing.inOut(Easing.sin) }
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
          textAlign: 'center',
          marginBottom: '40px',
        }}
      >
        <h1
          style={{
            color: '#1DA1F2',
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '0 0 10px 0',
            textShadow: '0 0 20px rgba(29, 161, 242, 0.5)',
          }}
        >
          Twitter Thread Animation
        </h1>
        <div
          style={{
            color: '#8B98A5',
            fontSize: '16px',
            fontWeight: '400',
          }}
        >
          A conversation about AI and politics
        </div>
      </div>

      {/* Main Content Container */}
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Kling AI Tweet */}
        <div
          style={{
            opacity: klingOpacity,
            transform: `scale(${klingScale})`,
            backgroundColor: '#16181C',
            border: '1px solid #2F3336',
            borderRadius: '16px',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#1DA1F2',
                borderRadius: '50%',
                marginRight: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              K
            </div>
            <div>
              <div style={{ color: '#E7E9EA', fontWeight: 'bold', fontSize: '15px' }}>
                Kling AI ✓
              </div>
              <div style={{ color: '#71767B', fontSize: '13px' }}>
                @kling_ai • Sep 13
              </div>
            </div>
          </div>
          <div style={{ color: '#E7E9EA', fontSize: '15px', lineHeight: '20px', marginBottom: '12px' }}>
            Introducing our new Avatar feature!🎭 For those who love our Lip Sync feature, it is now upgraded and also part of the new Avatar module.
            <br /><br />
            Limited access only upon launch. #klingai #klingavatar
          </div>

          {/* Video Player */}
          <div
            style={{
              opacity: videoOpacity,
              transform: `scale(${videoScale})`,
              backgroundColor: '#0F1419',
              borderRadius: '12px',
              height: '200px',
              position: 'relative',
              border: '1px solid #2F3336',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '20px solid #000',
                  borderTop: '12px solid transparent',
                  borderBottom: '12px solid transparent',
                  marginLeft: '4px',
                }}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                color: 'white',
                fontSize: '13px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              0:00 / 1:00
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71767B', fontSize: '13px' }}>
            <div style={{ transform: `translateY(${floatY}px)` }}>💬 29</div>
            <div style={{ transform: `translateY(${floatY * 0.8}px)` }}>🔄 50</div>
            <div style={{ transform: `translateY(${floatY * 1.2}px)` }}>❤️ 288</div>
            <div style={{ transform: `translateY(${floatY * 0.6}px)` }}>📊 20K</div>
          </div>
        </div>

        {/* David Pakman Tweet */}
        <div
          style={{
            opacity: pakmanOpacity,
            transform: `translateX(${pakmanX}px)`,
            backgroundColor: '#16181C',
            border: '1px solid #2F3336',
            borderRadius: '16px',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#7C3AED',
                borderRadius: '50%',
                marginRight: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              DP
            </div>
            <div>
              <div style={{ color: '#E7E9EA', fontWeight: 'bold', fontSize: '15px' }}>
                David Pakman ✓
              </div>
              <div style={{ color: '#71767B', fontSize: '13px' }}>
                @dpakman • Aug 21
              </div>
            </div>
          </div>
          <div style={{ color: '#E7E9EA', fontSize: '15px', lineHeight: '20px', marginBottom: '12px' }}>
            The funniest thing about the Newsom stuff is, I don't think a lot of these MAGAs realize he's making fun of them and of Trump. They seem to think he's "copying" Trump or something. Total lack of awareness of satire.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71767B', fontSize: '13px' }}>
            <div style={{ transform: `translateY(${floatY * 0.7}px)` }}>💬 1K</div>
            <div style={{ transform: `translateY(${floatY * 1.1}px)` }}>🔄 819</div>
            <div style={{ transform: `translateY(${floatY * 0.9}px)` }}>❤️ 5.9K</div>
            <div style={{ transform: `translateY(${floatY * 1.3}px)` }}>📊 102K</div>
          </div>
        </div>

        {/* Kdawg Tweet */}
        <div
          style={{
            opacity: kdawgOpacity,
            transform: `translateX(${kdawgX}px)`,
            backgroundColor: '#16181C',
            border: '1px solid #2F3336',
            borderRadius: '16px',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#F59E0B',
                borderRadius: '50%',
                marginRight: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              🔥
            </div>
            <div>
              <div style={{ color: '#E7E9EA', fontWeight: 'bold', fontSize: '15px' }}>
                🔥 KDAWG 🔥 🔶
              </div>
              <div style={{ color: '#71767B', fontSize: '13px' }}>
                @Kdawg5000 • Sep 13
              </div>
            </div>
          </div>
          <div style={{ color: '#E7E9EA', fontSize: '15px', lineHeight: '20px', marginBottom: '12px' }}>
            Well when Trump got caught in lies he said he was joking, which didn't even make sense, so I don't think they understand humor/satire.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71767B', fontSize: '13px' }}>
            <div style={{ transform: `translateY(${floatY * 1.2}px)` }}>💬 -</div>
            <div style={{ transform: `translateY(${floatY * 0.8}px)` }}>🔄 -</div>
            <div style={{ transform: `translateY(${floatY * 1.4}px)` }}>❤️ -</div>
            <div style={{ transform: `translateY(${floatY * 0.6}px)` }}>📊 34</div>
          </div>
        </div>
      </div>

      {/* Subtle background animation */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at ${50 + Math.sin(frame * 0.02) * 20}% ${50 + Math.cos(frame * 0.03) * 15}%, rgba(29, 161, 242, 0.05) 0%, transparent 50%)`,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    </div>
  );
};

export default TweetAnimation;