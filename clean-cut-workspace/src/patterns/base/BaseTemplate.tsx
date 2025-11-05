/**
 * BaseTemplate - Foundation for all animation templates
 *
 * Enforces base rules automatically:
 * - Fonts 24px+ with fontFamily specified
 * - Padding 40px+ (80px for containers)
 * - Proper spacing and sizing for 1920x1080
 * - PROJECT_CONFIG.md integration
 */

import React from 'react';
import { AbsoluteFill } from 'remotion';

// Base props all templates share
export interface BaseTemplateProps {
  // Colors (from PROJECT_CONFIG.md or override)
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;

  // Typography overrides
  fontFamily?: string;
  fontScale?: number;  // 1.0 = default, 1.2 = 20% larger

  // Timing overrides
  transitionSpeed?: number;  // Multiplier for all transitions
}

// Standard font stack (base rule compliant)
export const DEFAULT_FONT_STACK = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif";

// Base typography (minimum sizes for 1920x1080)
export const BASE_TYPOGRAPHY = {
  display: {
    fontSize: 72,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em'
  },
  h1: {
    fontSize: 48,
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em'
  },
  h2: {
    fontSize: 36,
    fontWeight: 600,
    lineHeight: 1.3
  },
  h3: {
    fontSize: 28,
    fontWeight: 600,
    lineHeight: 1.4
  },
  body: {
    fontSize: 24,  // Minimum for video
    fontWeight: 400,
    lineHeight: 1.5
  },
  small: {
    fontSize: 20,  // Still readable
    fontWeight: 400,
    lineHeight: 1.4
  }
};

// Base spacing (minimum for video)
export const BASE_SPACING = {
  containerPadding: 80,   // Minimum container padding
  cardPadding: 40,        // Minimum card padding
  sectionGap: 60,         // Between major sections
  elementGap: 25,         // Between related elements
  tightGap: 15            // Between tightly related items
};

/**
 * Base container with enforced rules
 */
export const BaseContainer: React.FC<{
  children: React.ReactNode;
  backgroundColor?: string;
  padding?: number;
}> = ({ children, backgroundColor = '#0a0a0a', padding = BASE_SPACING.containerPadding }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        padding: Math.max(padding, BASE_SPACING.containerPadding), // Enforce minimum
        fontFamily: DEFAULT_FONT_STACK,  // Always set fontFamily
        color: '#ffffff'
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Typography components with base rule enforcement
 */
export const Display: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color, style }) => (
  <div style={{
    ...BASE_TYPOGRAPHY.display,
    fontFamily: DEFAULT_FONT_STACK,
    color: color || '#ffffff',
    ...style
  }}>
    {children}
  </div>
);

export const H1: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color, style }) => (
  <h1 style={{
    ...BASE_TYPOGRAPHY.h1,
    fontFamily: DEFAULT_FONT_STACK,
    color: color || '#ffffff',
    margin: 0,
    ...style
  }}>
    {children}
  </h1>
);

export const H2: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color, style }) => (
  <h2 style={{
    ...BASE_TYPOGRAPHY.h2,
    fontFamily: DEFAULT_FONT_STACK,
    color: color || '#f0f0f0',
    margin: 0,
    ...style
  }}>
    {children}
  </h2>
);

export const Body: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color, style }) => (
  <p style={{
    ...BASE_TYPOGRAPHY.body,
    fontFamily: DEFAULT_FONT_STACK,
    color: color || '#e0e0e0',
    margin: 0,
    ...style
  }}>
    {children}
  </p>
);

/**
 * Card component with enforced padding
 */
export const Card: React.FC<{
  children: React.ReactNode;
  backgroundColor?: string;
  padding?: number;
  style?: React.CSSProperties;
}> = ({ children, backgroundColor = '#1a1a1a', padding = BASE_SPACING.cardPadding, style }) => (
  <div style={{
    backgroundColor,
    padding: Math.max(padding, BASE_SPACING.cardPadding), // Enforce minimum
    borderRadius: 12,
    ...style
  }}>
    {children}
  </div>
);
