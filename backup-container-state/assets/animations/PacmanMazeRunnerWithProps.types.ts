// Zod schema for PacmanMazeRunnerWithProps props
export interface PacmanMazeRunnerWithPropsProps {
  duration?: number; // Animation duration in seconds (1-60)
  fps?: number; // Frames per second (12-120)
  width?: number; // Video width (100-4000)
  height?: number; // Video height (100-4000)
  backgroundColor?: string; // Background color (#000000)
  title?: string; // Animation title (max 100 chars)
  speed?: number; // Animation speed multiplier (0.1-10)
  size?: number; // Element size (10-1000)
  color?: string; // Primary color (#ff6b6b)
}