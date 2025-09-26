import React from 'react';
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  interpolate, 
  Easing,
  spring,
  useVideoConfig
} from 'remotion';

export const SocialMediaFeed: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Post data extracted from the image
  const posts = [
    {
      user: "Kling AI",
      handle: "@kling_ai",
      verified: true,
      time: "Sep 13",
      content: "Introducing our new Avatar feature!🔥 For those who love our Lip Sync feature, it is now upgraded and also part of the new Avatar module.\n\nLimited access only upon launch. #klingai #klingavatar",
      likes: 288,
      retweets: 50,
      replies: 29,
      views: "20K"
    },
    {
      user: "David Pakman",
      handle: "@dpakman",
      verified: true,
      time: "Aug 21",
      content: "The funniest thing about the Newsom stuff is, I don't think a lot of these MAGAs realize he's making fun of them and of Trump. They seem to think he's \"owning\" Trump or something. Total lack of awareness of satire.",
      likes: 5900,
      retweets: 819,
      replies: 1000,
      views: "102K"
    },
    {
      user: "KDAWG",
      handle: "@Kdawg5000",
      time: "Sep 13",
      content: "Well when Trump got caught in lies he said he was joking, which didn't even make sense, so I don't think they understand humor/satire.",
      likes: 0,
      retweets: 0,
      replies: 0,
      views: "34"
    }
  ];

  // Smooth animation timing
  const post1Enter = interpolate(
    frame,
    [30, 90],
    [0, 1],
    {
      easing: Easing.out(Easing.ease),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );

  const post2Enter = interpolate(
    frame,
    [120, 180],
    [0, 1],
    {
      easing: Easing.out(Easing.ease),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );

  const post3Enter = interpolate(
    frame,
    [210, 270],
    [0, 1],
    {
      easing: Easing.out(Easing.ease),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );

  // Gentle floating animation for posts
  const float1 = interpolate(
    frame % 240,
    [0, 120, 240],
    [0, -3, 0],
    {
      easing: Easing.inOut(Easing.sin)
    }
  );

  const float2 = interpolate(
    (frame + 80) % 240,
    [0, 120, 240],
    [0, 3, 0],
    {
      easing: Easing.inOut(Easing.sin)
    }
  );

  const float3 = interpolate(
    (frame + 160) % 240,
    [0, 120, 240],
    [0, -2, 0],
    {
      easing: Easing.inOut(Easing.sin)
    }
  );

  // Smooth counter animations
  const animateNumber = (startFrame: number, targetNumber: number) => {
    return interpolate(
      frame,
      [startFrame, startFrame + 90],
      [0, targetNumber],
      {
        easing: Easing.out(Easing.ease),
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      }
    );
  };

  // Background gradient animation
  const backgroundShift = interpolate(
    frame,
    [0, 600],
    [0, 360],
    {
      easing: Easing.linear,
      extrapolateRight: 'extend'
    }
  );

  const Post = ({ post, enterAnimation, floatY, startFrame }: any) => (
    <div
      style={{
        transform: `translateY(${(1 - enterAnimation) * 50}px) translateY(${floatY}px)`,
        opacity: enterAnimation,
        background: 'linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%)',
        border: '1px solid #444',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        width: '100%',
        fontSize: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      {/* User info */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1d9bf0 0%, #0084d1 100%)',
            marginRight: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: 'bold',
            boxShadow: '0 4px 16px rgba(29, 155, 240, 0.3)'
          }}
        >
          {post.user.charAt(0)}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '24px' }}>{post.user}</span>
            {post.verified && (
              <span style={{ color: '#1d9bf0', fontSize: '24px' }}>✓</span>
            )}
            <span style={{ color: '#71767b', fontSize: '20px' }}>
              {post.handle} · {post.time}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        fontSize: '22px', 
        lineHeight: '32px', 
        marginBottom: '24px',
        whiteSpace: 'pre-line'
      }}>
        {post.content}
      </div>

      {/* Video placeholder for first post */}
      {post.user === "Kling AI" && (
        <div
          style={{
            width: '100%',
            height: '300px',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
            borderRadius: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #555'
          }}
        >
          {/* Animated play button */}
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${1 + Math.sin(frame / 20) * 0.05})`,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(255, 255, 255, 0.2)'
            }}
          >
            <div
              style={{
                width: '0',
                height: '0',
                borderLeft: '24px solid #000',
                borderTop: '16px solid transparent',
                borderBottom: '16px solid transparent',
                marginLeft: '6px'
              }}
            />
          </div>
          
          {/* Video controls */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'white',
              fontSize: '18px'
            }}
          >
            <span>0:00 / 1:00</span>
            <div style={{ 
              flex: 1, 
              height: '6px', 
              background: 'linear-gradient(90deg, #1d9bf0 0%, #333 100%)', 
              borderRadius: '3px' 
            }} />
          </div>
        </div>
      )}

      {/* Engagement stats */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around',
        color: '#71767b',
        fontSize: '18px',
        padding: '0 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>💬</span>
          <span>{Math.round(animateNumber(startFrame + 30, post.replies))}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🔁</span>
          <span>{Math.round(animateNumber(startFrame + 45, post.retweets))}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>❤️</span>
          <span>{Math.round(animateNumber(startFrame + 60, post.likes))}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>📊</span>
          <span>{post.views}</span>
        </div>
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ 
      background: `linear-gradient(${backgroundShift}deg, #0a0a0a 0%, #1a1a1a 25%, #0f1419 50%, #1a1a1a 75%, #0a0a0a 100%)`,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(29, 155, 240, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: `rotate(${frame * 0.5}deg)`,
          opacity: 0.6
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(29, 155, 240, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: `rotate(${frame * -0.3}deg)`,
          opacity: 0.5
        }}
      />

      {/* Header */}
      <div
        style={{
          fontSize: '36px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #1d9bf0 0%, #00d4ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '30px',
          textAlign: 'center',
          transform: `translateY(${interpolate(frame, [0, 60], [-50, 0], {
            easing: Easing.out(Easing.ease),
            extrapolateRight: 'clamp'
          })}px)`,
          opacity: interpolate(frame, [0, 60], [0, 1], {
            extrapolateRight: 'clamp'
          })
        }}
      >
        Social Media Feed
      </div>

      {/* Posts Container - fills remaining vertical space */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <Post 
          post={posts[0]} 
          enterAnimation={post1Enter}
          floatY={float1}
          startFrame={90}
        />
        <Post 
          post={posts[1]} 
          enterAnimation={post2Enter}
          floatY={float2}
          startFrame={180}
        />
        <Post 
          post={posts[2]} 
          enterAnimation={post3Enter}
          floatY={float3}
          startFrame={270}
        />
      </div>

      {/* Smooth floating particles */}
      {[...Array(6)].map((_, i) => {
        const particleY = interpolate(
          (frame + i * 50) % 600,
          [0, 600],
          [1080, -100],
          {
            easing: Easing.linear
          }
        );

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${15 + i * 12}%`,
              top: `${particleY}px`,
              width: '4px',
              height: '4px',
              background: 'radial-gradient(circle, #1d9bf0 0%, transparent 70%)',
              borderRadius: '50%',
              opacity: 0.7
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export default SocialMediaFeed;