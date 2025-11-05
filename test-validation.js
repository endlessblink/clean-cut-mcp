// Test the validation system
const testCode = `import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

interface TestProps {
  color?: string;
}

export const TestComponent: React.FC<Test Props> = ({ color = '#ff0000' }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ backgroundColor: color }}>
      Test {frame}
    </div>
  );
};`;

console.log('=== Validation System Test ===');
console.log('Test code contains syntax error: React.FC<Test Props> (space in type)');
console.log('Expected behavior: Auto-fix should remove the space');
console.log('Code length:', testCode.length, 'characters');
console.log('Contains error pattern:', testCode.includes('Test Props') ? 'YES' : 'NO');