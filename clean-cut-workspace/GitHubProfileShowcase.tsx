import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

export const GitHubProfileShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Professional Typography System
  const FONT_STACKS = {
    primary: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    tech: '"JetBrains Mono", "SF Mono", "Monaco", monospace'
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
      lineHeight: 1.3,
      letterSpacing: '0em'
    },
    h3: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '22px',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0em'
    },
    body: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '18px',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0em'
    },
    small: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.01em'
    },
    badge: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const
    },
    tech: {
      fontFamily: FONT_STACKS.tech,
      fontSize: '16px',
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

  // Colors
  const COLORS = {
    primary: '#ffffff',
    secondary: '#e5e5e5',
    tertiary: '#cccccc',
    muted: '#b3b3b3',
    accent: '#58a6ff',
    success: '#3fb950',
    warning: '#f85149',
    purple: '#a78bfa',
    orange: '#ffa657'
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

  // Animation scenes with overlapping transitions
  const animations = {
    // Scene 1: Welcome intro (0-90 frames, 0-3s)
    intro: {
      opacity: safeInterpolate(frame, [0, 25], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [75, 90], [1, 0], Easing.in(Easing.cubic)),
      scale: safeInterpolate(frame, [0, 25], [0.9, 1], Easing.out(Easing.cubic)),
      y: safeInterpolate(frame, [75, 90], [0, -30], Easing.in(Easing.cubic))
    },
    
    // Scene 2: GitHub stats (75-165 frames, 2.5-5.5s)
    stats: {
      opacity: safeInterpolate(frame, [75, 95], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [150, 165], [1, 0], Easing.in(Easing.cubic)),
      x: safeInterpolate(frame, [75, 95], [40, 0], Easing.out(Easing.cubic)),
      exitX: safeInterpolate(frame, [150, 165], [0, -60], Easing.in(Easing.cubic))
    },
    
    // Scene 3: Featured projects (150-240 frames, 5-8s)
    projects: {
      opacity: safeInterpolate(frame, [150, 170], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [225, 240], [1, 0], Easing.in(Easing.cubic)),
      y: safeInterpolate(frame, [150, 170], [50, 0], Easing.out(Easing.cubic)),
      exitY: safeInterpolate(frame, [225, 240], [0, -40], Easing.in(Easing.cubic))
    },
    
    // Scene 4: Tech stack (225-315 frames, 7.5-10.5s)
    techStack: {
      opacity: safeInterpolate(frame, [225, 245], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [300, 315], [1, 0], Easing.in(Easing.cubic)),
      scale: safeInterpolate(frame, [225, 245], [0.8, 1], Easing.out(Easing.cubic)),
      exitScale: safeInterpolate(frame, [300, 315], [1, 1.1], Easing.in(Easing.cubic))
    },
    
    // Scene 5: Call to action (300-360 frames, 10-12s)
    cta: {
      opacity: safeInterpolate(frame, [300, 320], [0, 1], Easing.out(Easing.cubic)),
      y: safeInterpolate(frame, [300, 320], [30, 0], Easing.out(Easing.cubic))
    }
  };

  // Calculate visibility
  const sceneVisibility = {
    intro: animations.intro.opacity,
    stats: animations.stats.opacity,
    projects: animations.projects.opacity,
    techStack: animations.techStack.opacity,
    cta: animations.cta.opacity
  };

  // GitHub data
  const githubStats = [
    { label: 'Public Repos', value: '15+', icon: '📁' },
    { label: 'Stars Earned', value: '6+', icon: '⭐' },
    { label: 'Commits', value: '200+', icon: '📝' },
    { label: 'Following', value: 'Active', icon: '👥' }
  ];

  const featuredProjects = [
    {
      name: 'Like-I-Said-memory-mcp-server',
      description: 'Advanced MCP Memory & Task Management for LLMs with AI Enhancement and React Dashboard',
      tech: ['TypeScript', 'React', 'AI/ML', 'MCP'],
      status: 'Active'
    },
    {
      name: 'Comfy-Guru',
      description: 'MCP that connects Claude Desktop to your ComfyUI logs - squashing errors peacefully',
      tech: ['Python', 'MCP', 'ComfyUI', 'Automation'],
      status: '⭐ 6 stars'
    }
  ];

  const techStack = {
    languages: ['TypeScript', 'JavaScript', 'Python', 'React', 'Node.js'],
    tools: ['MCP Servers', 'AI/ML', 'ComfyUI', 'Git', 'VS Code'],
    focus: ['LLM Integration', 'AI Enhancement', 'Developer Tools', 'Automation']
  };

  // Background gradient
  const backgroundStyle = {
    background: `linear-gradient(135deg, 
      hsl(220, 26%, 14%) 0%,
      hsl(220, 26%, 18%) 25%,
      hsl(220, 26%, 12%) 50%,
      hsl(220, 26%, 16%) 75%,
      hsl(220, 26%, 10%) 100%)`
  };

  const containerStyles = {
    ...FONT_CONTAINER_STYLES,
    ...backgroundStyle,
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
    width: '90%',
    maxWidth: '1000px',
    textAlign: 'center' as const,
    padding: '40px'
  };

  return (
    <AbsoluteFill style={containerStyles}>
      {/* Subtle animated background particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.1,
        background: `radial-gradient(circle at ${50 + Math.sin(frame * 0.02) * 20}% ${50 + Math.cos(frame * 0.03) * 15}%, ${COLORS.accent} 0%, transparent 50%)`
      }} />

      {/* Scene 1: Welcome Intro */}
      {sceneVisibility.intro > 0.01 && (
        <div style={{
          ...contentStyle,
          opacity: sceneVisibility.intro,
          transform: `translate(-50%, -50%) scale(${animations.intro.scale}) translateY(${animations.intro.y}px)`
        }}>
          <div style={{
            marginBottom: '32px',
            opacity: safeInterpolate(frame, [5, 25], [0, 1])
          }}>
            <h1 style={{
              ...TYPOGRAPHY.display,
              color: COLORS.primary,
              margin: '0 0 20px 0',
              background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.purple} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              endlessblink
            </h1>
            <p style={{
              ...TYPOGRAPHY.h3,
              color: COLORS.secondary,
              margin: '0 0 24px 0'
            }}>
              Building the Future of AI & Developer Tools
            </p>
            <div style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: 'rgba(88, 166, 255, 0.1)',
              border: `2px solid ${COLORS.accent}`,
              borderRadius: '30px',
              color: COLORS.accent,
              ...TYPOGRAPHY.body,
              fontWeight: 600
            }}>
              GitHub Portfolio Showcase
            </div>
          </div>
        </div>
      )}

      {/* Scene 2: GitHub Stats */}
      {sceneVisibility.stats > 0.01 && (
        <div style={{
          ...contentStyle,
          opacity: sceneVisibility.stats,
          transform: `translate(-50%, -50%) translateX(${animations.stats.x + animations.stats.exitX}px)`
        }}>
          <h2 style={{
            ...TYPOGRAPHY.h1,
            color: COLORS.primary,
            margin: '0 0 40px 0',
            opacity: safeInterpolate(frame, [80, 95], [0, 1])
          }}>
            📊 GitHub Activity
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '30px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {githubStats.map((stat, index) => (
              <div
                key={stat.label}
                style={{
                  padding: '24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  opacity: safeInterpolate(frame, [85 + index * 5, 100 + index * 5], [0, 1]),
                  transform: `translateY(${safeInterpolate(frame, [85 + index * 5, 100 + index * 5], [20, 0])}px)`,
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{stat.icon}</div>
                <div style={{
                  ...TYPOGRAPHY.h2,
                  color: COLORS.accent,
                  margin: '0 0 8px 0',
                  fontWeight: 700
                }}>
                  {stat.value}
                </div>
                <div style={{
                  ...TYPOGRAPHY.small,
                  color: COLORS.secondary,
                  margin: 0
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scene 3: Featured Projects */}
      {sceneVisibility.projects > 0.01 && (
        <div style={{
          ...contentStyle,
          opacity: sceneVisibility.projects,
          transform: `translate(-50%, -50%) translateY(${animations.projects.y + animations.projects.exitY}px)`
        }}>
          <h2 style={{
            ...TYPOGRAPHY.h1,
            color: COLORS.primary,
            margin: '0 0 40px 0',
            opacity: safeInterpolate(frame, [155, 170], [0, 1])
          }}>
            🚀 Featured Projects
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '24px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {featuredProjects.map((project, index) => (
              <div
                key={project.name}
                style={{
                  padding: '32px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '20px',
                  border: '1px solid rgba(88, 166, 255, 0.2)',
                  textAlign: 'left' as const,
                  opacity: safeInterpolate(frame, [160 + index * 8, 175 + index * 8], [0, 1]),
                  transform: `translateX(${safeInterpolate(frame, [160 + index * 8, 175 + index * 8], [index % 2 === 0 ? -30 : 30, 0])}px)`,
                  minHeight: '180px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <h3 style={{
                    ...TYPOGRAPHY.h3,
                    color: COLORS.accent,
                    margin: '0',
                    fontFamily: FONT_STACKS.tech,
                    fontSize: '20px'
                  }}>
                    {project.name}
                  </h3>
                  <div style={{
                    ...TYPOGRAPHY.badge,
                    color: COLORS.success,
                    backgroundColor: 'rgba(63, 185, 80, 0.1)',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {project.status}
                  </div>
                </div>
                <p style={{
                  ...TYPOGRAPHY.body,
                  color: COLORS.tertiary,
                  margin: '0 0 20px 0',
                  lineHeight: 1.6
                }}>
                  {project.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
                  {project.tech.map((tech, techIndex) => (
                    <span
                      key={tech}
                      style={{
                        ...TYPOGRAPHY.badge,
                        backgroundColor: 'rgba(167, 139, 250, 0.1)',
                        color: COLORS.purple,
                        padding: '6px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        opacity: safeInterpolate(frame, [170 + index * 8 + techIndex * 3, 180 + index * 8 + techIndex * 3], [0, 1])
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

      {/* Scene 4: Tech Stack */}
      {sceneVisibility.techStack > 0.01 && (
        <div style={{
          ...contentStyle,
          opacity: sceneVisibility.techStack,
          transform: `translate(-50%, -50%) scale(${animations.techStack.scale * animations.techStack.exitScale})`
        }}>
          <h2 style={{
            ...TYPOGRAPHY.h1,
            color: COLORS.primary,
            margin: '0 0 40px 0',
            opacity: safeInterpolate(frame, [230, 245], [0, 1])
          }}>
            🛠️ Tech Stack & Expertise
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {[
              { title: 'Languages', items: techStack.languages, icon: '💻' },
              { title: 'Tools & Frameworks', items: techStack.tools, icon: '🔧' },
              { title: 'Specialization', items: techStack.focus, icon: '🎯' }
            ].map((category, categoryIndex) => (
              <div
                key={category.title}
                style={{
                  padding: '24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  opacity: safeInterpolate(frame, [235 + categoryIndex * 6, 250 + categoryIndex * 6], [0, 1]),
                  transform: `translateY(${safeInterpolate(frame, [235 + categoryIndex * 6, 250 + categoryIndex * 6], [30, 0])}px)`,
                  minHeight: '250px'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{category.icon}</div>
                <h3 style={{
                  ...TYPOGRAPHY.h3,
                  color: COLORS.accent,
                  margin: '0 0 20px 0'
                }}>
                  {category.title}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={item}
                      style={{
                        ...TYPOGRAPHY.small,
                        color: COLORS.secondary,
                        padding: '8px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        opacity: safeInterpolate(frame, [240 + categoryIndex * 6 + itemIndex * 2, 250 + categoryIndex * 6 + itemIndex * 2], [0, 1])
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

      {/* Scene 5: Call to Action */}
      {sceneVisibility.cta > 0.01 && (
        <div style={{
          ...contentStyle,
          opacity: sceneVisibility.cta,
          transform: `translate(-50%, -50%) translateY(${animations.cta.y}px)`
        }}>
          <div style={{
            padding: '40px',
            backgroundColor: 'rgba(88, 166, 255, 0.1)',
            borderRadius: '24px',
            border: `2px solid ${COLORS.accent}`,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h2 style={{
              ...TYPOGRAPHY.h1,
              color: COLORS.primary,
              margin: '0 0 20px 0'
            }}>
              Let's Build Together! 🚀
            </h2>
            <p style={{
              ...TYPOGRAPHY.body,
              color: COLORS.secondary,
              margin: '0 0 24px 0'
            }}>
              Interested in AI tools, MCP servers, or developer automation?<br />
              Check out my repositories and let's collaborate!
            </p>
            <div style={{
              ...TYPOGRAPHY.tech,
              color: COLORS.accent,
              backgroundColor: 'rgba(88, 166, 255, 0.2)',
              padding: '12px 20px',
              borderRadius: '12px',
              display: 'inline-block',
              fontWeight: 600
            }}>
              github.com/endlessblink
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};