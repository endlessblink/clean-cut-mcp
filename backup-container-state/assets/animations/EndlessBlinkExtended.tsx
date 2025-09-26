import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

// Props interface for easy customization
interface EndlessBlinkExtendedProps {
  // Profile Information
  username?: string;
  displayName?: string;
  bio?: string;
  profileDescription?: string;
  
  // Visual Customization
  accentColor?: string;
  backgroundColor?: string;
  secondaryColor?: string;
  textColor?: string;
  
  // Animation Timing
  animationSpeed?: number;
  sceneTransitionSpeed?: number;
  
  // Content Control
  showTechStack?: boolean;
  showDetailedStats?: boolean;
  showCommunityImpact?: boolean;
  
  // Additional Info
  yearsActive?: string;
  location?: string;
  specialization?: string;
}

// Extended GitHub profile data with more details
const getProfileData = (props: EndlessBlinkExtendedProps) => ({
  username: props.username || 'endlessblink',
  displayName: props.displayName || 'EndlessBlink',
  bio: props.bio || 'AI Enhancement & MCP Development Specialist',
  profileDescription: props.profileDescription || 'Creating intelligent tools that bridge AI and development workflows',
  yearsActive: props.yearsActive || '2024',
  location: props.location || '🌍 Global',
  specialization: props.specialization || 'MCP Protocol & AI Integration',
  
  repositories: [
    {
      name: 'Like-I-Said-memory-mcp-server',
      description: 'Advanced MCP Memory and Task Management for LLMs with AI Enhancement and React Dashboard',
      longDescription: 'Revolutionary v2 with automatic memory-task linking, natural language updates, cross-session continuity, and project-based organization',
      language: 'TypeScript',
      stars: '⭐ Featured',
      features: ['27 MCP Tools', 'React Dashboard', 'Natural Language', 'Cross-Session Memory'],
      tech: ['MCP', 'AI Enhancement', 'Memory Systems', 'Task Management']
    },
    {
      name: 'Comfy-Guru', 
      description: 'MCP server connecting Claude Desktop to ComfyUI logs for peaceful error debugging',
      longDescription: 'Intelligent log discovery, error pattern recognition, and automated ComfyUI troubleshooting through Claude Desktop integration',
      language: 'Python',
      stars: '4⭐',
      features: ['Smart Log Discovery', 'Error Detection', 'Claude Integration', 'Peaceful Debugging'],
      tech: ['ComfyUI', 'Claude MCP', 'Log Analysis', 'Debug Tools']
    }
  ],
  
  achievements: [
    '🏆 MCP Server Pioneer',
    '🚀 AI Tool Innovation',
    '🌟 Open Source Advocate',
    '💡 Memory Systems Expert',
    '🔧 DevTools Creator',
    '🎯 Problem Solver'
  ],
  
  stats: {
    repos: '15+',
    commits: '320+',
    contributions: '1.5k+',
    followers: '50+',
    issues_solved: '25+'
  },
  
  techStack: {
    languages: ['TypeScript', 'Python', 'JavaScript', 'Node.js'],
    ai_tools: ['Claude MCP', 'ComfyUI', 'Memory Systems', 'AI Enhancement'],
    frameworks: ['React', 'FastMCP', 'Model Context Protocol'],
    specialties: ['MCP Development', 'AI Integration', 'DevTools', 'Automation']
  },
  
  communityImpact: {
    mcp_servers: '2 Major Servers',
    developers_helped: '100+',
    documentation: 'Comprehensive Guides',
    support_rating: '5⭐'
  }
});

// Professional typography system
const FONT_STACKS = {
  primary: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
};

const TYPOGRAPHY = {
  display: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '64px',
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.02em'
  },
  h1: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '42px',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em'
  },
  h2: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '32px',
    fontWeight: 600,
    lineHeight: 1.3
  },
  h3: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: 1.4
  },
  body: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: 1.6
  },
  small: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.5
  },
  badge: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.3,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const
  }
};

const FONT_CONTAINER_STYLES = {
  fontFamily: FONT_STACKS.primary,
  WebkitFontSmoothing: 'antialiased' as const,
  MozOsxFontSmoothing: 'grayscale' as const,
  textRendering: 'optimizeLegibility' as const
};

export const EndlessBlinkExtended: React.FC<EndlessBlinkExtendedProps> = (props = {}) => {
  const frame = useCurrentFrame();
  
  // Get customizable data
  const profileData = getProfileData(props);
  
  // Customizable colors
  const COLORS = {
    primary: props.textColor || '#ffffff',
    secondary: '#e5e5e5', 
    tertiary: '#cccccc',
    muted: '#b3b3b3',
    accent: props.accentColor || '#58a6ff',
    secondaryAccent: props.secondaryColor || '#8b5cf6',
    success: '#238636',
    warning: '#f85149',
    background: props.backgroundColor || '#0d1117',
    cardBg: 'rgba(33, 38, 45, 0.8)',
    gradientStart: `rgba(88, 166, 255, 0.1)`,
    gradientEnd: `rgba(139, 92, 246, 0.1)`
  };
  
  // Customizable animation speeds
  const SPEED_MULTIPLIER = props.animationSpeed || 1;
  const TRANSITION_SPEED = props.sceneTransitionSpeed || 1;
  
  // Safe interpolation with bounds checking
  const safeInterpolate = (frame: number, inputRange: [number, number], outputRange: [number, number], easing?: any) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputEnd;
    return interpolate(frame, inputRange, outputRange, { easing });
  };
  
  // Extended animation timeline (18 seconds = 540 frames)
  const animations = {
    // Scene 1: Profile intro (0-120 frames)
    profileIntro: {
      opacity: safeInterpolate(frame, [0, 25 / SPEED_MULTIPLIER], [0, 1], Easing.out(Easing.cubic)) * 
                safeInterpolate(frame, [100 / SPEED_MULTIPLIER, 120 / SPEED_MULTIPLIER], [1, 0], Easing.in(Easing.cubic)),
      entryY: safeInterpolate(frame, [0, 25 / SPEED_MULTIPLIER], [40, 0], Easing.out(Easing.cubic)),
      exitY: safeInterpolate(frame, [100 / SPEED_MULTIPLIER, 120 / SPEED_MULTIPLIER], [0, -30], Easing.in(Easing.cubic))
    },
    
    // Scene 2: Featured repositories deep dive (105-200 frames) 
    repositories: {
      opacity: safeInterpolate(frame, [105 / SPEED_MULTIPLIER, 130 / SPEED_MULTIPLIER], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [185 / SPEED_MULTIPLIER, 200 / SPEED_MULTIPLIER], [1, 0], Easing.in(Easing.cubic)),
      entryX: safeInterpolate(frame, [105 / SPEED_MULTIPLIER, 130 / SPEED_MULTIPLIER], [50, 0], Easing.out(Easing.cubic)),
      exitX: safeInterpolate(frame, [185 / SPEED_MULTIPLIER, 200 / SPEED_MULTIPLIER], [0, -70], Easing.in(Easing.cubic))
    },
    
    // Scene 3: Tech stack showcase (185-280 frames)
    techStack: {
      opacity: safeInterpolate(frame, [185 / SPEED_MULTIPLIER, 210 / SPEED_MULTIPLIER], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [265 / SPEED_MULTIPLIER, 280 / SPEED_MULTIPLIER], [1, 0], Easing.in(Easing.cubic)),
      entryScale: safeInterpolate(frame, [185 / SPEED_MULTIPLIER, 210 / SPEED_MULTIPLIER], [0.8, 1], Easing.out(Easing.cubic)),
      exitScale: safeInterpolate(frame, [265 / SPEED_MULTIPLIER, 280 / SPEED_MULTIPLIER], [1, 1.1], Easing.in(Easing.cubic))
    },
    
    // Scene 4: GitHub stats detailed (265-360 frames)
    stats: {
      opacity: safeInterpolate(frame, [265 / SPEED_MULTIPLIER, 290 / SPEED_MULTIPLIER], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [345 / SPEED_MULTIPLIER, 360 / SPEED_MULTIPLIER], [1, 0], Easing.in(Easing.cubic)),
      entryY: safeInterpolate(frame, [265 / SPEED_MULTIPLIER, 290 / SPEED_MULTIPLIER], [35, 0], Easing.out(Easing.cubic)),
      exitY: safeInterpolate(frame, [345 / SPEED_MULTIPLIER, 360 / SPEED_MULTIPLIER], [0, -40], Easing.in(Easing.cubic))
    },
    
    // Scene 5: Community impact (345-440 frames)
    community: {
      opacity: safeInterpolate(frame, [345 / SPEED_MULTIPLIER, 370 / SPEED_MULTIPLIER], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [425 / SPEED_MULTIPLIER, 440 / SPEED_MULTIPLIER], [1, 0], Easing.in(Easing.cubic)),
      entryX: safeInterpolate(frame, [345 / SPEED_MULTIPLIER, 370 / SPEED_MULTIPLIER], [60, 0], Easing.out(Easing.cubic)),
      exitX: safeInterpolate(frame, [425 / SPEED_MULTIPLIER, 440 / SPEED_MULTIPLIER], [0, -80], Easing.in(Easing.cubic))
    },
    
    // Scene 6: Achievements & final call to action (425-540 frames)
    achievements: {
      opacity: safeInterpolate(frame, [425 / SPEED_MULTIPLIER, 450 / SPEED_MULTIPLIER], [0, 1], Easing.out(Easing.cubic)),
      entryY: safeInterpolate(frame, [425 / SPEED_MULTIPLIER, 450 / SPEED_MULTIPLIER], [35, 0], Easing.out(Easing.cubic))
    }
  };
  
  // Calculate scene visibility
  const sceneVisibility = {
    profileIntro: animations.profileIntro.opacity,
    repositories: animations.repositories.opacity,
    techStack: animations.techStack.opacity,
    stats: animations.stats.opacity,
    community: animations.community.opacity,
    achievements: animations.achievements.opacity
  };
  
  // Container styles
  const containerStyles = {
    ...FONT_CONTAINER_STYLES,
    width: '100%',
    height: '100%',
    background: `linear-gradient(135deg, ${COLORS.background} 0%, #161b22 50%, #0d1117 100%)`,
    overflow: 'hidden'
  };
  
  const contentStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '1200px',
    textAlign: 'center' as const,
    padding: '40px'
  };
  
  return (
    <AbsoluteFill style={containerStyles}>
      {/* Enhanced animated background */}
      <div style={{
        position: 'absolute',
        width: '150%',
        height: '150%',
        left: '-25%',
        top: '-25%',
        background: `radial-gradient(ellipse at ${50 + Math.sin(frame * 0.02) * 15}% ${50 + Math.cos(frame * 0.03) * 15}%, ${COLORS.gradientStart} 0%, transparent 40%), 
                     radial-gradient(ellipse at ${30 + Math.cos(frame * 0.025) * 20}% ${70 + Math.sin(frame * 0.02) * 10}%, ${COLORS.gradientEnd} 0%, transparent 50%)`,
        opacity: 0.7
      }} />
      
      {/* Scene 1: Enhanced Profile Introduction */}
      {sceneVisibility.profileIntro > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.profileIntro,
            transform: `translateY(${animations.profileIntro.entryY + animations.profileIntro.exitY}px)`
          }}>
            {/* Enhanced GitHub icon with pulsing animation */}
            <div style={{
              width: '140px',
              height: '140px',
              margin: '0 auto 32px',
              background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.secondaryAccent} 100%)`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 60px rgba(88, 166, 255, ${0.5 + Math.sin(frame * 0.1) * 0.3})`,
              transform: `scale(${1 + Math.sin(frame * 0.08) * 0.08})`,
              border: '3px solid rgba(255, 255, 255, 0.1)'
            }}>
              <svg width="72" height="72" fill="white" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
            </div>
            
            <h1 style={{...TYPOGRAPHY.display, color: COLORS.primary, margin: '0 0 16px 0'}}>
              {profileData.displayName}
            </h1>
            
            <p style={{...TYPOGRAPHY.h3, color: COLORS.accent, margin: '0 0 24px 0'}}>
              @{profileData.username} • {profileData.specialization}
            </p>
            
            <p style={{...TYPOGRAPHY.body, color: COLORS.secondary, margin: '0 0 20px 0', maxWidth: '600px', margin: '0 auto 20px'}}>
              {profileData.profileDescription}
            </p>
            
            {/* Profile badges */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap' as const,
              marginTop: '24px'
            }}>
              <span style={{
                ...TYPOGRAPHY.small,
                color: COLORS.accent,
                background: 'rgba(88, 166, 255, 0.1)',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(88, 166, 255, 0.2)'
              }}>
                {profileData.location}
              </span>
              <span style={{
                ...TYPOGRAPHY.small,
                color: COLORS.secondaryAccent,
                background: 'rgba(139, 92, 246, 0.1)',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                Active since {profileData.yearsActive}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Scene 2: Enhanced Repository Deep Dive */}
      {sceneVisibility.repositories > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.repositories,
            transform: `translateX(${animations.repositories.entryX + animations.repositories.exitX}px)`
          }}>
            <h2 style={{...TYPOGRAPHY.h2, color: COLORS.primary, margin: '0 0 40px 0'}}>
              🚀 פרויקטים מובילים ופורצי דרך
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '32px',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {profileData.repositories.map((repo, index) => (
                <div
                  key={repo.name}
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.cardBg} 0%, rgba(33, 38, 45, 0.9) 100%)`,
                    borderRadius: '20px',
                    padding: '40px',
                    border: `2px solid rgba(88, 166, 255, 0.3)`,
                    textAlign: 'left' as const,
                    minHeight: '200px',
                    opacity: safeInterpolate(frame, [120 + index * 10, 140 + index * 10], [0, 1]),
                    transform: `translateY(${safeInterpolate(frame, [120 + index * 10, 140 + index * 10], [30, 0])}px)`,
                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{...TYPOGRAPHY.h3, color: COLORS.accent, margin: 0, fontSize: '24px'}}>
                      {repo.name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      ...TYPOGRAPHY.small,
                      color: COLORS.tertiary,
                      background: 'rgba(88, 166, 255, 0.1)',
                      padding: '6px 12px',
                      borderRadius: '12px'
                    }}>
                      {repo.stars}
                    </div>
                  </div>
                  
                  <p style={{...TYPOGRAPHY.body, color: COLORS.secondary, margin: '0 0 16px 0'}}>
                    {repo.description}
                  </p>
                  
                  <p style={{...TYPOGRAPHY.small, color: COLORS.tertiary, margin: '0 0 24px 0', lineHeight: 1.6}}>
                    {repo.longDescription}
                  </p>
                  
                  {/* Features */}
                  <div style={{marginBottom: '20px'}}>
                    <h4 style={{...TYPOGRAPHY.small, color: COLORS.accent, margin: '0 0 12px 0', fontWeight: 600}}>
                      ✨ Key Features:
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px'
                    }}>
                      {repo.features.map((feature, fIndex) => (
                        <div
                          key={feature}
                          style={{
                            ...TYPOGRAPHY.small,
                            color: COLORS.secondary,
                            background: 'rgba(34, 197, 94, 0.1)',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            fontSize: '14px',
                            opacity: safeInterpolate(frame, [130 + index * 10 + fIndex * 3, 140 + index * 10 + fIndex * 3], [0, 1])
                          }}
                        >
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tech stack */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap' as const,
                    alignItems: 'center'
                  }}>
                    <span style={{
                      ...TYPOGRAPHY.small,
                      color: COLORS.warning,
                      padding: '4px 12px',
                      background: 'rgba(248, 81, 73, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(248, 81, 73, 0.2)'
                    }}>
                      {repo.language}
                    </span>
                    {repo.tech.map((tech, techIndex) => (
                      <span
                        key={tech}
                        style={{
                          ...TYPOGRAPHY.badge,
                          color: COLORS.accent,
                          padding: '4px 10px',
                          background: 'rgba(88, 166, 255, 0.1)',
                          borderRadius: '8px',
                          border: '1px solid rgba(88, 166, 255, 0.2)',
                          fontSize: '12px'
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Scene 3: Tech Stack Showcase (conditionally shown) */}
      {(props.showTechStack !== false) && sceneVisibility.techStack > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.techStack,
            transform: `scale(${animations.techStack.entryScale * animations.techStack.exitScale})`
          }}>
            <h2 style={{...TYPOGRAPHY.h2, color: COLORS.primary, margin: '0 0 48px 0'}}>
              🛠️ Tech Stack & מומחיות
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '32px',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {Object.entries(profileData.techStack).map(([category, items], index) => {
                const categoryLabels = {
                  languages: { icon: '💻', label: 'Programming Languages' },
                  ai_tools: { icon: '🤖', label: 'AI & ML Tools' },
                  frameworks: { icon: '⚡', label: 'Frameworks & Libraries' },
                  specialties: { icon: '🎯', label: 'Core Specialties' }
                };
                
                const categoryInfo = categoryLabels[category as keyof typeof categoryLabels];
                
                return (
                  <div
                    key={category}
                    style={{
                      background: COLORS.cardBg,
                      borderRadius: '20px',
                      padding: '32px 24px',
                      textAlign: 'center' as const,
                      border: `2px solid rgba(88, 166, 255, 0.2)`,
                      minHeight: '180px',
                      opacity: safeInterpolate(frame, [200 + index * 8, 220 + index * 8], [0, 1]),
                      transform: `translateY(${safeInterpolate(frame, [200 + index * 8, 220 + index * 8], [25, 0])}px)`,
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>
                      {categoryInfo.icon}
                    </div>
                    <h3 style={{...TYPOGRAPHY.h3, color: COLORS.accent, margin: '0 0 20px 0', fontSize: '18px'}}>
                      {categoryInfo.label}
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap' as const,
                      gap: '8px',
                      justifyContent: 'center'
                    }}>
                      {(items as string[]).map((item, itemIndex) => (
                        <span
                          key={item}
                          style={{
                            ...TYPOGRAPHY.small,
                            color: COLORS.primary,
                            background: 'rgba(88, 166, 255, 0.15)',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            border: '1px solid rgba(88, 166, 255, 0.3)',
                            fontSize: '14px',
                            opacity: safeInterpolate(frame, [210 + index * 8 + itemIndex * 2, 220 + index * 8 + itemIndex * 2], [0, 1])
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Scene 4: Detailed GitHub Statistics */}
      {(props.showDetailedStats !== false) && sceneVisibility.stats > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.stats,
            transform: `translateY(${animations.stats.entryY + animations.stats.exitY}px)`
          }}>
            <h2 style={{...TYPOGRAPHY.h2, color: COLORS.primary, margin: '0 0 48px 0'}}>
              📊 GitHub Analytics & Impact
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              maxWidth: '800px',
              margin: '0 auto 40px'
            }}>
              {Object.entries(profileData.stats).map(([key, value], index) => {
                const labels = {
                  repos: { icon: '📁', label: 'Repositories', color: COLORS.accent },
                  commits: { icon: '💾', label: 'Commits', color: COLORS.secondaryAccent },
                  contributions: { icon: '🚀', label: 'Contributions', color: '#22c55e' },
                  followers: { icon: '👥', label: 'Followers', color: '#f59e0b' },
                  issues_solved: { icon: '🔧', label: 'Issues Solved', color: '#ef4444' }
                };
                
                const statInfo = labels[key as keyof typeof labels];
                
                return (
                  <div
                    key={key}
                    style={{
                      background: COLORS.cardBg,
                      borderRadius: '18px',
                      padding: '28px 20px',
                      textAlign: 'center' as const,
                      border: `2px solid rgba(88, 166, 255, 0.2)`,
                      minHeight: '140px',
                      display: 'flex',
                      flexDirection: 'column' as const,
                      justifyContent: 'center',
                      opacity: safeInterpolate(frame, [280 + index * 6, 295 + index * 6], [0, 1]),
                      transform: `translateY(${safeInterpolate(frame, [280 + index * 6, 295 + index * 6], [20, 0])}px) scale(${1 + Math.sin((frame + index * 60) * 0.04) * 0.03})`,
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                      {statInfo.icon}
                    </div>
                    <div style={{
                      ...TYPOGRAPHY.display, 
                      color: statInfo.color, 
                      margin: '0 0 6px 0', 
                      fontSize: '36px',
                      fontWeight: 800
                    }}>
                      {value}
                    </div>
                    <div style={{...TYPOGRAPHY.small, color: COLORS.tertiary, fontSize: '12px'}}>
                      {statInfo.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Scene 5: Community Impact (conditionally shown) */}
      {(props.showCommunityImpact !== false) && sceneVisibility.community > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.community,
            transform: `translateX(${animations.community.entryX + animations.community.exitX}px)`
          }}>
            <h2 style={{...TYPOGRAPHY.h2, color: COLORS.primary, margin: '0 0 40px 0'}}>
              🌟 Community Impact
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              {Object.entries(profileData.communityImpact).map(([key, value], index) => {
                const impactLabels = {
                  mcp_servers: { icon: '🔗', label: 'MCP Servers Created' },
                  developers_helped: { icon: '🤝', label: 'Developers Assisted' },
                  documentation: { icon: '📚', label: 'Documentation Quality' },
                  support_rating: { icon: '⭐', label: 'Community Rating' }
                };
                
                const impactInfo = impactLabels[key as keyof typeof impactLabels];
                
                return (
                  <div
                    key={key}
                    style={{
                      background: `linear-gradient(135deg, rgba(88, 166, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)`,
                      borderRadius: '16px',
                      padding: '32px 24px',
                      textAlign: 'center' as const,
                      border: '2px solid rgba(88, 166, 255, 0.3)',
                      minHeight: '120px',
                      opacity: safeInterpolate(frame, [360 + index * 8, 375 + index * 8], [0, 1]),
                      transform: `translateY(${safeInterpolate(frame, [360 + index * 8, 375 + index * 8], [25, 0])}px)`,
                      boxShadow: '0 16px 48px rgba(88, 166, 255, 0.2)'
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                      {impactInfo.icon}
                    </div>
                    <h3 style={{...TYPOGRAPHY.h3, color: COLORS.accent, margin: '0 0 8px 0', fontSize: '18px'}}>
                      {value}
                    </h3>
                    <p style={{...TYPOGRAPHY.small, color: COLORS.secondary, margin: 0, fontSize: '14px'}}>
                      {impactInfo.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Scene 6: Achievements & Enhanced Call to Action */}
      {sceneVisibility.achievements > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.achievements,
            transform: `translateY(${animations.achievements.entryY}px)`
          }}>
            <h2 style={{...TYPOGRAPHY.h2, color: COLORS.primary, margin: '0 0 40px 0'}}>
              🏆 הישגים והכרה
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              maxWidth: '900px',
              margin: '0 auto 48px'
            }}>
              {profileData.achievements.map((achievement, index) => (
                <div
                  key={achievement}
                  style={{
                    background: `linear-gradient(135deg, rgba(88, 166, 255, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)`,
                    color: COLORS.primary,
                    padding: '20px 16px',
                    borderRadius: '16px',
                    border: '1px solid rgba(88, 166, 255, 0.3)',
                    ...TYPOGRAPHY.body,
                    fontWeight: 600,
                    minHeight: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center' as const,
                    opacity: safeInterpolate(frame, [440 + index * 6, 455 + index * 6], [0, 1]),
                    transform: `translateY(${safeInterpolate(frame, [440 + index * 6, 455 + index * 6], [20, 0])}px) scale(${1 + Math.sin((frame + index * 40) * 0.06) * 0.03})`,
                    boxShadow: '0 12px 32px rgba(88, 166, 255, 0.2)',
                    fontSize: '16px'
                  }}
                >
                  {achievement}
                </div>
              ))}
            </div>
            
            {/* Enhanced call to action */}
            <div style={{
              opacity: safeInterpolate(frame, [480, 500], [0, 1]),
              transform: `translateY(${safeInterpolate(frame, [480, 500], [25, 0])}px)`,
              background: `linear-gradient(135deg, rgba(88, 166, 255, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)`,
              borderRadius: '24px',
              padding: '40px',
              border: '2px solid rgba(88, 166, 255, 0.3)',
              boxShadow: '0 20px 60px rgba(88, 166, 255, 0.3)'
            }}>
              <p style={{...TYPOGRAPHY.h3, color: COLORS.accent, margin: '0 0 16px 0'}}>
                🚀 בואו נשתף פעולה ונבנה את העתיד של AI
              </p>
              <p style={{...TYPOGRAPHY.body, color: COLORS.secondary, margin: '0 0 24px 0'}}>
                מתמחה בפיתוח כלי MCP ופתרונות AI חדשניים
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                flexWrap: 'wrap' as const
              }}>
                <div style={{
                  ...TYPOGRAPHY.body,
                  color: COLORS.accent,
                  background: 'rgba(88, 166, 255, 0.2)',
                  padding: '12px 24px',
                  borderRadius: '20px',
                  border: '2px solid rgba(88, 166, 255, 0.4)',
                  fontWeight: 600
                }}>
                  github.com/endlessblink
                </div>
                <div style={{
                  ...TYPOGRAPHY.body,
                  color: COLORS.secondaryAccent,
                  background: 'rgba(139, 92, 246, 0.2)',
                  padding: '12px 24px',
                  borderRadius: '20px',
                  border: '2px solid rgba(139, 92, 246, 0.4)',
                  fontWeight: 600
                }}>
                  MCP Protocol Expert
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};