/**
 * Product Showcase Template
 *
 * Perfect for: SaaS apps, mobile apps, physical products
 * Duration: 15 seconds (450 frames)
 * Layout: Hero → Features → CTA
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { z } from 'zod';
import { BaseContainer, Display, H1, H2, Body, BASE_SPACING } from '../base/BaseTemplate';

// Zod schema for props validation
export const ProductShowcaseSchema = z.object({
  productName: z.string(),
  tagline: z.string().optional(),
  features: z.array(z.object({
    icon: z.string(),        // Emoji or icon
    title: z.string(),
    description: z.string()
  })).min(3).max(5),
  ctaText: z.string().optional(),
  website: z.string().optional(),
  logo: z.string().optional(),      // URL or staticFile path
  primaryColor: z.string().optional(),
  accentColor: z.string().optional()
});

export type ProductShowcaseProps = z.infer<typeof ProductShowcaseSchema>;

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  productName = 'Your Product',
  tagline = 'Transform your workflow',
  features = [
    { icon: '⚡', title: 'Fast Performance', description: 'Lightning-fast load times' },
    { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security' },
    { icon: '✨', title: 'Easy to Use', description: 'Intuitive interface' }
  ],
  ctaText = 'Get Started Now',
  website = 'yourproduct.com',
  logo,
  primaryColor = '#10b981',
  accentColor = '#3b82f6'
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Hero section (0-90 frames)
  const heroProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 }
  });

  const logoScale = interpolate(heroProgress, [0, 1], [0.8, 1.0]);
  const titleY = interpolate(frame, [20, 50], [40, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: 'clamp'
  });

  // Feature animations (staggered, 90-330 frames)
  const getFeatureProgress = (index: number) => {
    const startFrame = 90 + (index * 60); // 60 frame stagger
    return spring({
      frame: frame - startFrame,
      fps,
      config: { damping: 12, stiffness: 80 }
    });
  };

  // CTA section (330-450 frames)
  const ctaProgress = spring({
    frame: frame - 330,
    fps,
    config: { damping: 10, stiffness: 100 }
  });

  const ctaScale = interpolate(ctaProgress, [0, 1], [0.9, 1.0]);
  const websiteOpacity = interpolate(frame, [390, 420], [0, 1], {
    extrapolateRight: 'clamp'
  });

  return (
    <BaseContainer backgroundColor="#0a0a0a" padding={BASE_SPACING.containerPadding}>
      {/* Hero Section (0-90f) */}
      {frame < 330 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translateY(${titleY}px)`,
          textAlign: 'center',
          opacity: interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' }) *
                   interpolate(frame, [270, 300], [1, 0], { extrapolateRight: 'clamp' })
        }}>
          {logo && (
            <div style={{
              width: 200,
              height: 200,
              margin: '0 auto 40px',
              transform: `scale(${logoScale})`,
              fontSize: 120  // Emoji logo fallback
            }}>
              {logo}
            </div>
          )}

          <Display color={primaryColor} style={{ marginBottom: 20 }}>
            {productName}
          </Display>

          <H2 color="#a0a0a0">
            {tagline}
          </H2>
        </div>
      )}

      {/* Features Section (90-330f) */}
      {frame >= 90 && frame < 390 && (
        <div style={{
          position: 'absolute',
          left: BASE_SPACING.containerPadding,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 1920 - (BASE_SPACING.containerPadding * 2),
          display: 'flex',
          flexDirection: 'column',
          gap: BASE_SPACING.elementGap
        }}>
          {features.slice(0, 3).map((feature, i) => {
            const progress = getFeatureProgress(i);
            const translateX = interpolate(progress, [0, 1], [100, 0]);

            if (progress <= 0) return null;

            return (
              <div
                key={i}
                style={{
                  transform: `translateX(${translateX}px)`,
                  opacity: progress,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 30,
                  padding: BASE_SPACING.cardPadding,
                  backgroundColor: '#1a1a1a',
                  borderRadius: 12,
                  borderLeft: `4px solid ${accentColor}`
                }}
              >
                <div style={{ fontSize: 48, flexShrink: 0 }}>
                  {feature.icon}
                </div>
                <div>
                  <H2 color={primaryColor} style={{ marginBottom: 10 }}>
                    {feature.title}
                  </H2>
                  <Body color="#d0d0d0">
                    {feature.description}
                  </Body>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA Section (330-450f) */}
      {frame >= 330 && (
        <div style={{
          position: 'absolute',
          bottom: BASE_SPACING.containerPadding + 100,
          left: '50%',
          transform: `translateX(-50%) scale(${ctaScale})`,
          textAlign: 'center'
        }}>
          <div style={{
            padding: '24px 60px',
            backgroundColor: primaryColor,
            borderRadius: 16,
            cursor: 'pointer',
            marginBottom: 30
          }}>
            <H1 color="#ffffff">
              {ctaText}
            </H1>
          </div>

          <Body color="#808080" style={{ opacity: websiteOpacity }}>
            {website}
          </Body>
        </div>
      )}
    </BaseContainer>
  );
};
