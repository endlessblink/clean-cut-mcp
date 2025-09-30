/**
 * Kinetic Typography System for Remotion
 *
 * Professional text animation with character-by-character, word-by-word, and line-by-line reveals.
 * Includes squash/stretch, bounce, slide, fade, scale, and stagger effects.
 */

import { interpolate } from 'remotion';
import { ProfessionalEasing } from './professional-easing';
import React from 'react';

/**
 * Text animation types
 */
export type TextAnimationType =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'bounce'
  | 'rotate'
  | 'blur'
  | 'glitch'
  | 'typewriter';

/**
 * Text reveal patterns
 */
export type RevealPattern =
  | 'sequential' // One after another
  | 'random' // Random order
  | 'center-out' // From center outward
  | 'edges-in' // From edges inward
  | 'wave'; // Wave pattern

/**
 * Character animation configuration
 */
export interface CharacterAnimationConfig {
  frame: number;
  startFrame: number;
  endFrame: number;
  staggerDelay: number;
  animationType: TextAnimationType;
  easing?: any;
  distance?: number; // For slide animations
  rotation?: number; // For rotate animations
  bounce?: number; // Bounce intensity
}

/**
 * Calculate character animation value
 */
export const animateCharacter = (config: CharacterAnimationConfig): {
  opacity: number;
  transform: string;
  filter: string;
} => {
  const {
    frame,
    startFrame,
    endFrame,
    animationType,
    easing = ProfessionalEasing.gentleOut,
    distance = 50,
    rotation = 180,
    bounce = 1.2,
  } = config;

  // Base progress (0 to 1)
  const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

  let opacity = 1;
  let transform = '';
  let filter = '';

  switch (animationType) {
    case 'fade':
      opacity = progress;
      break;

    case 'slide-up':
      opacity = progress;
      transform = `translateY(${(1 - progress) * distance}px)`;
      break;

    case 'slide-down':
      opacity = progress;
      transform = `translateY(${(progress - 1) * distance}px)`;
      break;

    case 'slide-left':
      opacity = progress;
      transform = `translateX(${(progress - 1) * distance}px)`;
      break;

    case 'slide-right':
      opacity = progress;
      transform = `translateX(${(1 - progress) * distance}px)`;
      break;

    case 'scale':
      opacity = progress;
      transform = `scale(${progress})`;
      break;

    case 'bounce':
      opacity = progress;
      // Overshoot and settle
      const bounceScale = progress < 0.6 ? progress / 0.6 * bounce : 1 - (progress - 0.6) / 0.4 * (bounce - 1);
      transform = `scale(${bounceScale})`;
      break;

    case 'rotate':
      opacity = progress;
      transform = `rotate(${(1 - progress) * rotation}deg)`;
      break;

    case 'blur':
      opacity = progress;
      filter = `blur(${(1 - progress) * 10}px)`;
      break;

    case 'glitch':
      opacity = progress;
      const glitchX = progress < 0.5 ? Math.random() * 5 - 2.5 : 0;
      const glitchY = progress < 0.5 ? Math.random() * 5 - 2.5 : 0;
      transform = `translate(${glitchX}px, ${glitchY}px)`;
      break;

    case 'typewriter':
      // Sharp cutoff
      opacity = progress > 0.5 ? 1 : 0;
      break;
  }

  return { opacity, transform, filter };
};

/**
 * Calculate stagger delay for character based on reveal pattern
 */
export const calculateStagger = (
  index: number,
  totalChars: number,
  pattern: RevealPattern,
  staggerAmount: number
): number => {
  switch (pattern) {
    case 'sequential':
      return index * staggerAmount;

    case 'random':
      // Pseudo-random based on index
      return ((index * 17) % totalChars) * staggerAmount;

    case 'center-out': {
      const center = Math.floor(totalChars / 2);
      const distanceFromCenter = Math.abs(index - center);
      return distanceFromCenter * staggerAmount;
    }

    case 'edges-in': {
      const center = Math.floor(totalChars / 2);
      const distanceFromCenter = Math.abs(index - center);
      return (totalChars - distanceFromCenter) * staggerAmount;
    }

    case 'wave': {
      const waveValue = Math.sin((index / totalChars) * Math.PI * 2) * 0.5 + 0.5;
      return waveValue * totalChars * staggerAmount;
    }

    default:
      return index * staggerAmount;
  }
};

/**
 * Split text into characters with animation data
 */
export interface AnimatedCharacter {
  char: string;
  index: number;
  startFrame: number;
  endFrame: number;
  style: React.CSSProperties;
}

/**
 * Generate animated characters
 */
export const generateAnimatedCharacters = (
  text: string,
  frame: number,
  config: {
    startFrame?: number;
    duration?: number;
    staggerAmount?: number;
    animationType?: TextAnimationType;
    pattern?: RevealPattern;
    easing?: any;
    distance?: number;
    rotation?: number;
    bounce?: number;
  }
): AnimatedCharacter[] => {
  const {
    startFrame = 0,
    duration = 30,
    staggerAmount = 2,
    animationType = 'fade',
    pattern = 'sequential',
    easing = ProfessionalEasing.gentleOut,
    distance = 50,
    rotation = 180,
    bounce = 1.2,
  } = config;

  const characters = text.split('');
  const totalChars = characters.length;

  return characters.map((char, index) => {
    const staggerDelay = calculateStagger(index, totalChars, pattern, staggerAmount);
    const charStartFrame = startFrame + staggerDelay;
    const charEndFrame = charStartFrame + duration;

    const animation = animateCharacter({
      frame,
      startFrame: charStartFrame,
      endFrame: charEndFrame,
      staggerDelay,
      animationType,
      easing,
      distance,
      rotation,
      bounce,
    });

    return {
      char,
      index,
      startFrame: charStartFrame,
      endFrame: charEndFrame,
      style: {
        display: 'inline-block',
        opacity: animation.opacity,
        transform: animation.transform,
        filter: animation.filter,
        transformOrigin: 'center center',
      },
    };
  });
};

/**
 * Word-by-word animation
 */
export const generateAnimatedWords = (
  text: string,
  frame: number,
  config: {
    startFrame?: number;
    duration?: number;
    staggerAmount?: number;
    animationType?: TextAnimationType;
    pattern?: RevealPattern;
    easing?: any;
    distance?: number;
  }
): Array<{
  word: string;
  index: number;
  style: React.CSSProperties;
}> => {
  const {
    startFrame = 0,
    duration = 30,
    staggerAmount = 8,
    animationType = 'slide-up',
    pattern = 'sequential',
    easing = ProfessionalEasing.gentleOut,
    distance = 50,
  } = config;

  const words = text.split(' ');
  const totalWords = words.length;

  return words.map((word, index) => {
    const staggerDelay = calculateStagger(index, totalWords, pattern, staggerAmount);
    const wordStartFrame = startFrame + staggerDelay;
    const wordEndFrame = wordStartFrame + duration;

    const animation = animateCharacter({
      frame,
      startFrame: wordStartFrame,
      endFrame: wordEndFrame,
      staggerDelay,
      animationType,
      easing,
      distance,
    });

    return {
      word,
      index,
      style: {
        display: 'inline-block',
        opacity: animation.opacity,
        transform: animation.transform,
        filter: animation.filter,
        marginRight: '0.3em',
      },
    };
  });
};

/**
 * Line-by-line animation
 */
export const generateAnimatedLines = (
  text: string,
  frame: number,
  config: {
    startFrame?: number;
    duration?: number;
    staggerAmount?: number;
    animationType?: TextAnimationType;
    easing?: any;
    distance?: number;
  }
): Array<{
  line: string;
  index: number;
  style: React.CSSProperties;
}> => {
  const {
    startFrame = 0,
    duration = 30,
    staggerAmount = 15,
    animationType = 'slide-left',
    easing = ProfessionalEasing.gentleOut,
    distance = 100,
  } = config;

  const lines = text.split('\n');

  return lines.map((line, index) => {
    const lineStartFrame = startFrame + index * staggerAmount;
    const lineEndFrame = lineStartFrame + duration;

    const animation = animateCharacter({
      frame,
      startFrame: lineStartFrame,
      endFrame: lineEndFrame,
      staggerDelay: 0,
      animationType,
      easing,
      distance,
    });

    return {
      line,
      index,
      style: {
        display: 'block',
        opacity: animation.opacity,
        transform: animation.transform,
        filter: animation.filter,
      },
    };
  });
};

/**
 * Squash and stretch animation for text
 */
export const squashStretch = (
  frame: number,
  startFrame: number,
  duration: number,
  intensity: number = 0.3
): { scaleX: number; scaleY: number } => {
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ProfessionalEasing.elastic,
  });

  // Overshoot in Y, compensate in X
  const scaleY = 1 + Math.sin(progress * Math.PI) * intensity;
  const scaleX = 1 / scaleY; // Maintain volume

  return { scaleX, scaleY };
};

/**
 * Text reveal with mask (curtain effect)
 */
export const getMaskReveal = (
  frame: number,
  startFrame: number,
  endFrame: number,
  direction: 'left' | 'right' | 'top' | 'bottom' = 'left'
): string => {
  const progress = interpolate(frame, [startFrame, endFrame], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ProfessionalEasing.cinematic,
  });

  switch (direction) {
    case 'left':
      return `linear-gradient(to right, black ${progress}%, transparent ${progress}%)`;
    case 'right':
      return `linear-gradient(to left, black ${progress}%, transparent ${progress}%)`;
    case 'top':
      return `linear-gradient(to bottom, black ${progress}%, transparent ${progress}%)`;
    case 'bottom':
      return `linear-gradient(to top, black ${progress}%, transparent ${progress}%)`;
  }
};

/**
 * Usage Examples:
 *
 * // 1. Character-by-character animation
 * const chars = generateAnimatedCharacters('Hello World', frame, {
 *   startFrame: 0,
 *   duration: 20,
 *   staggerAmount: 3,
 *   animationType: 'slide-up',
 *   pattern: 'sequential'
 * });
 *
 * <div>
 *   {chars.map((char, i) => (
 *     <span key={i} style={char.style}>{char.char}</span>
 *   ))}
 * </div>
 *
 * // 2. Word-by-word animation
 * const words = generateAnimatedWords('The quick brown fox', frame, {
 *   startFrame: 30,
 *   animationType: 'bounce'
 * });
 *
 * // 3. Squash and stretch
 * const { scaleX, scaleY } = squashStretch(frame, 0, 30, 0.4);
 * <div style={{ transform: `scaleX(${scaleX}) scaleY(${scaleY})` }}>
 *   Text
 * </div>
 *
 * // 4. Mask reveal
 * const mask = getMaskReveal(frame, 0, 60, 'left');
 * <div style={{ WebkitMaskImage: mask, maskImage: mask }}>
 *   Revealed Text
 * </div>
 */