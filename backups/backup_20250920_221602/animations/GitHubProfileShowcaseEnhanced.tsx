import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

export const GitHubProfileShowcaseEnhanced: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Professional Typography System - LARGER SIZES
  const FONT_STACKS = {
    primary: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    tech: '"JetBrains Mono", "SF Mono", "Monaco", monospace'
  };

  const TYPOGRAPHY = {
    display: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '84px', // Increased from 64px
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.02em'
    },
    h1: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '56px', // Increased from 42px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em'
    },
    h2: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '42px', // Increased from 32px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '0em'
    },
    h3: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '28px', // Increased from 22px
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0em'
    },
    body: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '22px', // Increased from 18px
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0em'
    },
    small: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '20px', // Increased from 16px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.01em'
    },
    badge: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '18px', // Increased from 14px
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const
    },
    tech: {
      fontFamily: FONT_STACKS.tech,
      fontSize: '20px', // Increased from 16px
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0em'
    }
  };

  const FONT_CONTAINER_STYLES = {
    fontFamily: FONT_STACKS.primary,
    fontDisplay: 'swap' as const,
    WebkitFontSmoothing: 'antialiased' as const,
    MozOsxFontSmoothing: 'grayscale' as const,
    textRendering: 'optimizeLegibility' as const
  };

  // Enhanced Colors with better contrast
  const COLORS = {
    primary: '#ffffff',
    secondary: '#e6edf3',
    tertiary: '#d0d7de',
    muted: '#b3b3b3',
    accent: '#58a6ff',
    success: '#3fb950',
    warning: '#f85149',
    purple: '#a78bfa',
    orange: '#ffa657',
    pink: '#f778ba',
    cyan: '#39d0d8'
  };

  // Safe interpolation function
  const safeInterpolate = (frame, inputRange, outputRange, options = {}) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputEnd;
    return interpolate(frame, inputRange, outputRange, options);
  };

  // NON-OVERLAPPING animation scenes with clear gaps
  const animations = {
    // Scene 1: Welcome intro (0-75 frames, 0-2.5s)
    intro: {
      opacity: safeInterpolate(frame, [0, 25], [0, 1], { easing: Easing.out(Easing.cubic) }) *
               safeInterpolate(frame, [50, 75], [1, 0], { easing: Easing.in(Easing.cubic) }),
      scale: safeInterpolate(frame, [0, 25], [0.85, 1], { easing: Easing.out(Easing.cubic) }),
      y: safeInterpolate(frame, [50, 75], [0, -40], { easing: Easing.in(Easing.cubic) })
    },
    
    // Scene 2: GitHub stats (90-165 frames, 3-5.5s) - Clear gap after intro
    stats: {
      opacity: safeInterpolate(frame, [90, 110], [0, 1], { easing: Easing.out(Easing.cubic) }) *
               safeInterpolate(frame, [145, 165], [1, 0], { easing: Easing.in(Easing.cubic) }),
      x: safeInterpolate(frame, [90, 110], [50, 0], { easing: Easing.out(Easing.cubic) }),
      exitX: safeInterpolate(frame, [145, 165], [0, -70], { easing: Easing.in(Easing.cubic) })
    },
    
    // Scene 3: Featured projects (180-255 frames, 6-8.5s) - Clear gap after stats
    projects: {
      opacity: safeInterpolate(frame, [180, 200], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [235, 255], [1, 0], Easing.in(Easing.cubic)),
      y: safeInterpolate(frame, [180, 200], [60, 0], Easing.out(Easing.cubic)),
      exitY: safeInterpolate(frame, [235, 255], [0, -50], Easing.in(Easing.cubic))
    },
    
    // Scene 4: Tech stack (270-345 frames, 9-11.5s) - Clear gap after projects
    techStack: {
      opacity: safeInterpolate(frame, [270, 290], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [325, 345], [1, 0], Easing.in(Easing.cubic)),
      scale: safeInterpolate(frame, [270, 290], [0.8, 1], Easing.out(Easing.cubic)),
      exitScale: safeInterpolate(frame, [325, 345], [1, 1.15], Easing.in(Easing.cubic))
    },
    
    // Scene 5: Call to action (360-420 frames, 12-14s) - Clear gap after tech stack
    cta: {
      opacity: safeInterpolate(frame, [360, 380], [0, 1], Easing.out(Easing.cubic)),
      y: safeInterpolate(frame, [360, 380], [40, 0], Easing.out(Easing.cubic))
    }
  };

  // Calculate visibility - NO OVERLAPS
  const sceneVisibility = {
    intro: animations.intro.opacity,
    stats: animations.stats.opacity,
    projects: animations.projects.opacity,
    techStack: animations.techStack.opacity,
    cta: animations.cta.opacity
  };

  // Enhanced GitHub data with more visual interest
  const githubStats = [
    { label: 'Public Repos', value: '15+', icon: '📁', color: COLORS.accent, bgColor: 'rgba(88, 166, 255, 0.15)' },
    { label: 'Stars Earned', value: '6+', icon: '⭐', color: COLORS.orange, bgColor: 'rgba(255, 166, 87, 0.15)' },
    { label: 'Total Commits', value: '200+', icon: '📝', color: COLORS.success, bgColor: 'rgba(63, 185, 80, 0.15)' },
    { label: 'Active Projects', value: 'Daily', icon: '🚀', color: COLORS.purple, bgColor: 'rgba(167, 139, 250, 0.15)' }
  ];

  const featuredProjects = [
    {
      name: 'Like-I-Said-memory-mcp-server',
      description: 'Advanced MCP Memory & Task Management System for LLMs with AI Enhancement and React Dashboard',
      tech: ['TypeScript', 'React', 'AI/ML', 'MCP'],
      status: '🔥 Active',
      color: COLORS.accent,
      bgGradient: 'linear-gradient(135deg, rgba(88, 166, 255, 0.1) 0%, rgba(167, 139, 250, 0.05) 100%)'
    },
    {
      name: 'Comfy-Guru',
      description: 'Intelligent MCP server connecting Claude Desktop to ComfyUI - Error detection and peaceful resolution',
      tech: ['Python', 'MCP', 'ComfyUI', 'Automation'],
      status: '⭐ 6 stars',
      color: COLORS.success,
      bgGradient: 'linear-gradient(135deg, rgba(63, 185, 80, 0.1) 0%, rgba(57, 208, 216, 0.05) 100%)'
    }
  ];

  const techStack = {
    languages: ['TypeScript', 'JavaScript', 'Python', 'React', 'Node.js'],
    tools: ['MCP Servers', 'AI/ML', 'ComfyUI', 'Git', 'VS Code'],
    focus: ['LLM Integration', 'AI Enhancement', 'Developer Tools', 'Automation']
  };

  // Enhanced animated background
  const getAnimatedBackground = () => {
    const time = frame * 0.01;
    return {
      background: `
        radial-gradient(circle at ${20 + Math.sin(time) * 10}% ${30 + Math.cos(time * 0.8) * 10}%, rgba(88, 166, 255, 0.05) 0%, transparent 40%),
        radial-gradient(circle at ${80 + Math.cos(time * 1.2) * 8}% ${70 + Math.sin(time * 0.6) * 8}%, rgba(167, 139, 250, 0.04) 0%, transparent 40%),
        radial-gradient(circle at ${50 + Math.sin(time * 1.5) * 12}% ${20 + Math.cos(time) * 15}%, rgba(247, 120, 186, 0.03) 0%, transparent 50%),
        linear-gradient(135deg, 
          hsl(220, 26%, 14%) 0%,
          hsl(220, 26%, 18%) 25%,
          hsl(220, 26%, 12%) 50%,
          hsl(220, 26%, 16%) 75%,
          hsl(220, 26%, 10%) 100%)
      `
    };
  };

  const containerStyles = {
    ...FONT_CONTAINER_STYLES,
    ...getAnimatedBackground(),
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative' as const
  };

  const contentStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '92%',
    maxWidth: '1200px', // Increased from 1000px
    textAlign: 'center' as const,
    padding: '60px' // Increased padding
  };

  return (
    <AbsoluteFill style={containerStyles}>
      {/* Enhanced floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            backgroundColor: i % 2 === 0 ? COLORS.accent : COLORS.purple,
            borderRadius: '50%',
            opacity: 0.3,
            left: `${20 + i * 15}%`,
            top: `${30 + Math.sin(frame * 0.02 + i) * 20}%`,
            transform: `translateY(${Math.cos(frame * 0.015 + i * 0.5) * 30}px)`
          }}
        />
      ))}

      {/* Scene 1: Enhanced Welcome Intro */}
      {sceneVisibility.intro > 0.01 && (
        <div style={{
          ...contentStyle,
          opacity: sceneVisibility.intro,
          transform: `translate(-50%, -50%) scale(${animations.intro.scale}) translateY(${animations.intro.y}px)`
        }}>
          <div style={{ marginBottom: '48px' }}>
            {/* Animated icon */}
            <div style={{
              fontSize: '64px',
              marginBottom: '24px',
              opacity: safeInterpolate(frame, [5, 20], [0, 1]),
              transform: `scale(${safeInterpolate(frame, [5, 25], [0.5, 1], Easing.out(Easing.cubic))})`
            }}>
              👨‍💻
            </div>
            
            <h1 style={{
              ...TYPOGRAPHY.display,
              color: COLORS.primary,
              margin: '0 0 32px 0',
              background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.purple} 50%, ${COLORS.pink} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              opacity: safeInterpolate(frame, [10, 25], [0, 1]),
              textShadow: '0 0 40px rgba(88, 166, 255, 0.3)'
            }}>
              endlessblink
            </h1>
            
            <p style={{
              ...TYPOGRAPHY.h2,
              color: COLORS.secondary,
              margin: '0 0 36px 0',
              opacity: safeInterpolate(frame, [15, 30], [0, 1])
            }}>
              Building the Future of AI & Developer Tools
            </p>
            
            <div style={{
              display: 'inline-block',
              padding: '20px 36px',
              backgroundColor: 'rgba(88, 166, 255, 0.15)',
              border: `3px solid ${COLORS.accent}`,
              borderRadius: '40px',
              color: COLORS.accent,
              ...TYPOGRAPHY.body,
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
              boxShadow: '0 10px 30px rgba(88, 166, 255, 0.2)',
              opacity: safeInterpolate(frame, [20, 35], [0, 1]),
              transform: `translateY(${safeInterpolate(frame, [20, 35], [20, 0])}px)`
            }}>
              🚀 GitHub Portfolio Showcase
            </div>
          </div>
        </div>
      )}

      {/* Scene 2: Enhanced GitHub Stats */}
      {sceneVisibility.stats > 0.01 && (
        <div style={{
          ...contentStyle,
          opacity: sceneVisibility.stats,
          transform: `translate(-50%, -50%) translateX(${animations.stats.x + animations.stats.exitX}px)`
        }}>
          <h2 style={{
            ...TYPOGRAPHY.h1,
            color: COLORS.primary,
            margin: '0 0 60px 0',
            opacity: safeInterpolate(frame, [95, 110], [0, 1]),
            textShadow: '0 0 20px rgba(255, 255, 255, 0.1)'
          }}>
            📊 GitHub Activity Dashboard
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '40px', // Increased gap
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {githubStats.map((stat, index) => (
              <div
                key={stat.label}
                style={{
                  padding: '36px', // Increased padding
                  backgroundColor: stat.bgColor,
                  borderRadius: '24px',
                  border: `2px solid ${stat.color}`,
                  opacity: safeInterpolate(frame, [100 + index * 6, 115 + index * 6], [0, 1]),
                  transform: `translateY(${safeInterpolate(frame, [100 + index * 6, 115 + index * 6], [30, 0])}px) 
                             scale(${safeInterpolate(frame, [100 + index * 6, 115 + index * 6], [0.9, 1])})`,
                  minHeight: '180px', // Increased height
                  display: 'flex',
                  flexDirection: 'column' as const,
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: `0 15px 35px ${stat.color}20`,
                  position: 'relative' as const,
                  overflow: 'hidden'
                }}
              >
                {/* Animated background glow */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100px',
                  height: '100px',
                  background: `radial-gradient(circle, ${stat.color}15 0%, transparent 70%)`,
                  opacity: safeInterpolate(frame, [105 + index * 6, 120 + index * 6], [0, 1])
                }} />
                
                <div style={{ fontSize: '48px', marginBottom: '20px', zIndex: 1 }}>{stat.icon}</div>
                <div style={{
                  ...TYPOGRAPHY.h1,
                  color: stat.color,
                  margin: '0 0 16px 0',
                  fontWeight: 800,
                  fontSize: '52px', // Extra large numbers
                  zIndex: 1
                }}>
                  {stat.value}
                </div>
                <div style={{
                  ...TYPOGRAPHY.body,
                  color: COLORS.secondary,
                  margin: 0,
                  fontWeight: 500,
                  zIndex: 1
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scene 3: Enhanced Featured Projects */}
      {sceneVisibility.projects > 0.01 && (
        <div style={{
          ...contentStyle,
          opacity: sceneVisibility.projects,
          transform: `translate(-50%, -50%) translateY(${animations.projects.y + animations.projects.exitY}px)`
        }}>
          <h2 style={{
            ...TYPOGRAPHY.h1,
            color: COLORS.primary,
            margin: '0 0 60px 0',
            opacity: safeInterpolate(frame, [185, 200], [0, 1]),
            textShadow: '0 0 20px rgba(255, 255, 255, 0.1)'
          }}>
            🚀 Featured Projects & Innovation
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '36px', // Increased gap
            maxWidth: '1000px', // Increased width
            margin: '0 auto'
          }}>
            {featuredProjects.map((project, index) => (
              <div
                key={project.name}
                style={{
                  padding: '48px', // Increased padding
                  background: project.bgGradient,
                  borderRadius: '28px',
                  border: `3px solid ${project.color}`,
                  textAlign: 'left' as const,
                  opacity: safeInterpolate(frame, [190 + index * 10, 210 + index * 10], [0, 1]),
                  transform: `translateX(${safeInterpolate(frame, [190 + index * 10, 210 + index * 10], [index % 2 === 0 ? -50 : 50, 0])}px)
                             scale(${safeInterpolate(frame, [190 + index * 10, 210 + index * 10], [0.95, 1])})`,
                  minHeight: '240px', // Increased height
                  boxShadow: `0 20px 50px ${project.color}15`,
                  position: 'relative' as const,
                  overflow: 'hidden'
                }}
              >
                {/* Animated corner accent */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: `linear-gradient(135deg, ${project.color}20 0%, transparent 60%)`,
                  borderBottomLeft: `60px solid ${project.color}10`
                }} />
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'start', 
                  marginBottom: '24px',
                  position: 'relative' as const,
                  zIndex: 1
                }}>
                  <h3 style={{
                    ...TYPOGRAPHY.h2, // Larger project titles
                    color: project.color,
                    margin: '0',
                    fontFamily: FONT_STACKS.tech,
                    fontSize: '32px',
                    fontWeight: 700
                  }}>
                    {project.name}
                  </h3>
                  <div style={{
                    ...TYPOGRAPHY.badge,
                    color: project.color,
                    backgroundColor: `${project.color}20`,
                    padding: '12px 20px',
                    borderRadius: '20px',
                    fontSize: '16px',
                    fontWeight: 700,
                    border: `2px solid ${project.color}40`
                  }}>
                    {project.status}
                  </div>
                </div>
                
                <p style={{
                  ...TYPOGRAPHY.body,
                  color: COLORS.secondary,
                  margin: '0 0 32px 0',
                  lineHeight: 1.7,
                  fontSize: '24px', // Larger description text
                  position: 'relative' as const,
                  zIndex: 1
                }}>
                  {project.description}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap' as const, 
                  gap: '12px',
                  position: 'relative' as const,
                  zIndex: 1
                }}>
                  {project.tech.map((tech, techIndex) => (
                    <span
                      key={tech}
                      style={{
                        ...TYPOGRAPHY.badge,
                        backgroundColor: 'rgba(167, 139, 250, 0.15)',
                        color: COLORS.purple,
                        padding: '10px 18px',
                        borderRadius: '20px',
                        fontSize: '16px',
                        fontWeight: 600,
                        border: '2px solid rgba(167, 139, 250, 0.3)',
                        opacity: safeInterpolate(frame, [200 + index * 10 + techIndex * 4, 215 + index * 10 + techIndex * 4], [0, 1]),
                        transform: `scale(${safeInterpolate(frame, [200 + index * 10 + techIndex * 4, 215 + index * 10 + techIndex * 4], [0.8, 1])})`
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
      )}

      {/* Scene 4: Enhanced Tech Stack */}
      {sceneVisibility.techStack > 0.01 && (
        <div style={{
          ...contentStyle,
          opacity: sceneVisibility.techStack,
          transform: `translate(-50%, -50%) scale(${animations.techStack.scale * animations.techStack.exitScale})`
        }}>
          <h2 style={{
            ...TYPOGRAPHY.h1,
            color: COLORS.primary,
            margin: '0 0 60px 0',
            opacity: safeInterpolate(frame, [275, 290], [0, 1]),
            textShadow: '0 0 20px rgba(255, 255, 255, 0.1)'
          }}>
            🛠️ Tech Stack & Expertise Hub
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '48px', // Increased gap
            maxWidth: '1100px', // Increased width
            margin: '0 auto'
          }}>
            {[
              { 
                title: 'Languages & Frameworks', 
                items: techStack.languages, 
                icon: '💻',
                color: COLORS.accent,
                bgColor: 'rgba(88, 166, 255, 0.1)'
              },
              { 
                title: 'Tools & Platforms', 
                items: techStack.tools, 
                icon: '🔧',
                color: COLORS.success,
                bgColor: 'rgba(63, 185, 80, 0.1)'
              },
              { 
                title: 'Core Specialization', 
                items: techStack.focus, 
                icon: '🎯',
                color: COLORS.purple,
                bgColor: 'rgba(167, 139, 250, 0.1)'
              }
            ].map((category, categoryIndex) => (
              <div
                key={category.title}
                style={{
                  padding: '40px', // Increased padding
                  backgroundColor: category.bgColor,
                  borderRadius: '28px',
                  border: `3px solid ${category.color}`,
                  opacity: safeInterpolate(frame, [280 + categoryIndex * 8, 300 + categoryIndex * 8], [0, 1]),
                  transform: `translateY(${safeInterpolate(frame, [280 + categoryIndex * 8, 300 + categoryIndex * 8], [40, 0])}px)
                             scale(${safeInterpolate(frame, [280 + categoryIndex * 8, 300 + categoryIndex * 8], [0.9, 1])})`,
                  minHeight: '320px', // Increased height
                  boxShadow: `0 20px 50px ${category.color}15`,
                  position: 'relative' as const,
                  overflow: 'hidden'
                }}
              >
                {/* Background pattern */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '150px',
                  height: '150px',
                  background: `radial-gradient(circle, ${category.color}08 0%, transparent 70%)`,
                  opacity: safeInterpolate(frame, [285 + categoryIndex * 8, 305 + categoryIndex * 8], [0, 1])
                }} />
                
                <div style={{ 
                  fontSize: '48px', 
                  marginBottom: '24px',
                  position: 'relative' as const,
                  zIndex: 1
                }}>
                  {category.icon}
                </div>
                
                <h3 style={{
                  ...TYPOGRAPHY.h2, // Larger category titles
                  color: category.color,
                  margin: '0 0 32px 0',
                  fontSize: '36px',
                  fontWeight: 700,
                  position: 'relative' as const,
                  zIndex: 1
                }}>
                  {category.title}
                </h3>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column' as const, 
                  gap: '12px',
                  position: 'relative' as const,
                  zIndex: 1
                }}>
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={item}
                      style={{
                        ...TYPOGRAPHY.body,
                        color: COLORS.secondary,
                        padding: '16px 20px', // Increased padding
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        fontSize: '20px', // Larger text
                        fontWeight: 500,
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        opacity: safeInterpolate(frame, [290 + categoryIndex * 8 + itemIndex * 3, 305 + categoryIndex * 8 + itemIndex * 3], [0, 1]),
                        transform: `translateX(${safeInterpolate(frame, [290 + categoryIndex * 8 + itemIndex * 3, 305 + categoryIndex * 8 + itemIndex * 3], [20, 0])}px)`
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scene 5: Enhanced Call to Action */}
      {sceneVisibility.cta > 0.01 && (
        <div style={{
          ...contentStyle,
          opacity: sceneVisibility.cta,
          transform: `translate(-50%, -50%) translateY(${animations.cta.y}px)`
        }}>
          <div style={{
            padding: '60px', // Increased padding
            background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.15) 0%, rgba(167, 139, 250, 0.1) 100%)',
            borderRadius: '32px',
            border: `4px solid ${COLORS.accent}`,
            maxWidth: '800px',
            margin: '0 auto',
            boxShadow: '0 25px 60px rgba(88, 166, 255, 0.2)',
            position: 'relative' as const,
            overflow: 'hidden'
          }}>
            {/* Animated background elements */}
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              width: '80px',
              height: '80px',
              background: `radial-gradient(circle, ${COLORS.purple}15 0%, transparent 70%)`,
              borderRadius: '50%',
              opacity: safeInterpolate(frame, [365, 380], [0, 1])
            }} />
            <div style={{
              position: 'absolute',
              bottom: '20%',
              right: '15%',
              width: '60px',
              height: '60px',
              background: `radial-gradient(circle, ${COLORS.pink}15 0%, transparent 70%)`,
              borderRadius: '50%',
              opacity: safeInterpolate(frame, [370, 385], [0, 1])
            }} />
            
            <div style={{
              fontSize: '56px',
              marginBottom: '24px',
              opacity: safeInterpolate(frame, [365, 380], [0, 1]),
              transform: `scale(${safeInterpolate(frame, [365, 380], [0.8, 1])})`
            }}>
              🤝
            </div>
            
            <h2 style={{
              ...TYPOGRAPHY.h1,
              color: COLORS.primary,
              margin: '0 0 32px 0',
              fontSize: '64px', // Extra large CTA title
              position: 'relative' as const,
              zIndex: 1
            }}>
              Let's Build Together! 🚀
            </h2>
            
            <p style={{
              ...TYPOGRAPHY.body,
              color: COLORS.secondary,
              margin: '0 0 40px 0',
              fontSize: '28px', // Larger CTA text
              lineHeight: 1.6,
              position: 'relative' as const,
              zIndex: 1
            }}>
              Interested in AI tools, MCP servers, or developer automation?<br />
              Check out my repositories and let's collaborate on amazing projects!
            </p>
            
            <div style={{
              ...TYPOGRAPHY.tech,
              color: COLORS.accent,
              backgroundColor: 'rgba(88, 166, 255, 0.25)',
              padding: '20px 32px',
              borderRadius: '20px',
              display: 'inline-block',
              fontWeight: 700,
              fontSize: '24px', // Larger GitHub link
              border: `3px solid ${COLORS.accent}`,
              boxShadow: `0 15px 40px ${COLORS.accent}25`,
              position: 'relative' as const,
              zIndex: 1,
              textDecoration: 'none',
              opacity: safeInterpolate(frame, [375, 390], [0, 1]),
              transform: `translateY(${safeInterpolate(frame, [375, 390], [20, 0])}px)`
            }}>
              🌟 github.com/endlessblink 🌟
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};