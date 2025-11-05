/**
 * Crop Detector - Viewport Overflow Detection for Motion Graphics
 *
 * Detects when elements scale/transform beyond viewport boundaries (1920×1080)
 * Prevents invisible/cropped content that degrades animation quality
 */

export interface ViewportBounds {
  width: number;
  height: number;
}

export interface ElementBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TransformState {
  translateX: number;
  translateY: number;
  scale: number;
  rotate: number;
}

export interface CropDetectionResult {
  isCropped: boolean;
  visiblePercentage: number;
  croppedEdges: Array<'top' | 'bottom' | 'left' | 'right'>;
  overflow: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  recommendation: string;
}

export interface LayoutConfig {
  type: 'grid' | 'flex-row' | 'flex-column' | 'single';
  gap: number;
  elementWidth: number;
  elementHeight: number;
  elementCount: number;
}

export interface LayoutCropResult {
  totalWidth: number;
  totalHeight: number;
  isCropped: boolean;
  overflow: { horizontal: number; vertical: number };
  maxSafeElementWidth: number;
  maxSafeElementHeight: number;
  recommendation: string;
}

/**
 * Calculate element bounds after transform is applied
 */
export function calculateTransformedBounds(
  element: ElementBounds,
  transform: TransformState
): ElementBounds {
  // Apply scale to dimensions
  const scaledWidth = element.width * transform.scale;
  const scaledHeight = element.height * transform.scale;

  // Calculate center point
  const centerX = element.x + (element.width / 2);
  const centerY = element.y + (element.height / 2);

  // Apply translation
  const transformedCenterX = centerX + transform.translateX;
  const transformedCenterY = centerY + transform.translateY;

  // Calculate new bounds
  return {
    x: transformedCenterX - (scaledWidth / 2),
    y: transformedCenterY - (scaledHeight / 2),
    width: scaledWidth,
    height: scaledHeight
  };
}

/**
 * Detect if element is cropped by viewport
 */
export function detectViewportCrop(
  elementBounds: ElementBounds,
  viewport: ViewportBounds
): CropDetectionResult {
  const croppedEdges: Array<'top' | 'bottom' | 'left' | 'right'> = [];
  const overflow = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  };

  // Check each edge
  if (elementBounds.y < 0) {
    croppedEdges.push('top');
    overflow.top = Math.abs(elementBounds.y);
  }

  if (elementBounds.y + elementBounds.height > viewport.height) {
    croppedEdges.push('bottom');
    overflow.bottom = (elementBounds.y + elementBounds.height) - viewport.height;
  }

  if (elementBounds.x < 0) {
    croppedEdges.push('left');
    overflow.left = Math.abs(elementBounds.x);
  }

  if (elementBounds.x + elementBounds.width > viewport.width) {
    croppedEdges.push('right');
    overflow.right = (elementBounds.x + elementBounds.width) - viewport.width;
  }

  // Calculate visible area
  const visibleWidth = Math.min(
    elementBounds.width,
    Math.max(0, Math.min(viewport.width, elementBounds.x + elementBounds.width) - Math.max(0, elementBounds.x))
  );
  const visibleHeight = Math.min(
    elementBounds.height,
    Math.max(0, Math.min(viewport.height, elementBounds.y + elementBounds.height) - Math.max(0, elementBounds.y))
  );

  const visibleArea = visibleWidth * visibleHeight;
  const totalArea = elementBounds.width * elementBounds.height;
  const visiblePercentage = totalArea > 0 ? (visibleArea / totalArea) * 100 : 100;

  // Generate recommendation
  let recommendation = '';
  if (visiblePercentage < 50) {
    recommendation = `CRITICAL: Only ${visiblePercentage.toFixed(1)}% visible. Reduce scale or reposition element.`;
  } else if (visiblePercentage < 90) {
    recommendation = `WARNING: ${visiblePercentage.toFixed(1)}% visible. Consider reducing scale.`;
  } else if (visiblePercentage < 100) {
    recommendation = `Minor crop: ${visiblePercentage.toFixed(1)}% visible. Edges slightly cut off.`;
  } else {
    recommendation = 'No cropping detected - element fully visible.';
  }

  return {
    isCropped: croppedEdges.length > 0,
    visiblePercentage,
    croppedEdges,
    overflow,
    recommendation
  };
}

/**
 * Calculate maximum safe scale for element
 */
export function calculateMaxSafeScale(
  element: ElementBounds,
  viewport: ViewportBounds,
  safetyMargin: number = 0.95  // 5% safety margin
): number {
  // Calculate scale that would fill viewport
  const scaleToFitWidth = viewport.width / element.width;
  const scaleToFitHeight = viewport.height / element.height;

  // Use the smaller scale (limiting dimension)
  const maxScale = Math.min(scaleToFitWidth, scaleToFitHeight);

  // Apply safety margin
  return maxScale * safetyMargin;
}

/**
 * Validate crop safety for an animation shot
 */
export interface ShotCropValidation {
  shotName: string;
  maxScale: number;
  currentScale: number;
  isSafe: boolean;
  croppedFrames: number[];
  worstFrame: {
    frame: number;
    visiblePercentage: number;
    recommendation: string;
  };
}

export function validateShotCropSafety(
  shotName: string,
  elementBounds: ElementBounds,
  scaleProgression: Array<{ frame: number; scale: number }>,
  viewport: ViewportBounds = { width: 1920, height: 1080 }
): ShotCropValidation {
  const maxSafeScale = calculateMaxSafeScale(elementBounds, viewport);
  const croppedFrames: number[] = [];
  let worstCase = { frame: 0, visiblePercentage: 100, recommendation: '' };

  scaleProgression.forEach(({ frame, scale }) => {
    const transformed = calculateTransformedBounds(
      elementBounds,
      { translateX: 0, translateY: 0, scale, rotate: 0 }
    );

    const cropResult = detectViewportCrop(transformed, viewport);

    if (cropResult.isCropped) {
      croppedFrames.push(frame);
    }

    if (cropResult.visiblePercentage < worstCase.visiblePercentage) {
      worstCase = {
        frame,
        visiblePercentage: cropResult.visiblePercentage,
        recommendation: cropResult.recommendation
      };
    }
  });

  return {
    shotName,
    maxScale: maxSafeScale,
    currentScale: Math.max(...scaleProgression.map(s => s.scale)),
    isSafe: croppedFrames.length === 0,
    croppedFrames,
    worstFrame: worstCase
  };
}

/**
 * Generate human-readable crop report
 */
export function generateCropReport(validations: ShotCropValidation[]): string {
  let report = '# Crop Detection Report\n\n';

  const hasCrops = validations.some(v => !v.isSafe);

  if (hasCrops) {
    report += '❌ **CROP ISSUES DETECTED**\n\n';
  } else {
    report += '✅ **NO CROP ISSUES** - All content within viewport\n\n';
  }

  validations.forEach(validation => {
    report += `## ${validation.shotName}\n\n`;
    report += `- **Max Safe Scale**: ${validation.maxScale.toFixed(2)}x\n`;
    report += `- **Current Max Scale**: ${validation.currentScale.toFixed(2)}x\n`;
    report += `- **Status**: ${validation.isSafe ? '✅ Safe' : '❌ Cropped'}\n`;

    if (!validation.isSafe) {
      report += `- **Cropped Frames**: ${validation.croppedFrames.length} frames\n`;
      report += `- **Worst Frame**: ${validation.worstFrame.frame}\n`;
      report += `  - Visible: ${validation.worstFrame.visiblePercentage.toFixed(1)}%\n`;
      report += `  - ${validation.worstFrame.recommendation}\n`;
    }

    report += '\n';
  });

  return report;
}

/**
 * Quick helper: Check if specific scale would cause crop
 */
export function wouldScaleCropElement(
  elementWidth: number,
  elementHeight: number,
  scale: number,
  viewport: ViewportBounds = { width: 1920, height: 1080 }
): boolean {
  const scaledWidth = elementWidth * scale;
  const scaledHeight = elementHeight * scale;

  return scaledWidth > viewport.width || scaledHeight > viewport.height;
}

/**
 * Usage Example:
 *
 * // 1. Check if current scale is safe
 * const codeEditor = { x: 460, y: 190, width: 1500, height: 850 };
 * const result = detectViewportCrop(
 *   calculateTransformedBounds(codeEditor, { scale: 1.6, ... }),
 *   { width: 1920, height: 1080 }
 * );
 * console.log(result.recommendation);
 *
 * // 2. Calculate max safe scale
 * const maxScale = calculateMaxSafeScale(codeEditor, { width: 1920, height: 1080 });
 * console.log(`Max safe scale: ${maxScale}x`);
 *
 * // 3. Validate entire shot
 * const scaleProgression = [
 *   { frame: 0, scale: 1.3 },
 *   { frame: 30, scale: 1.5 },
 *   { frame: 65, scale: 1.6 }
 * ];
 * const shotValidation = validateShotCropSafety('Shot3-Code', codeEditor, scaleProgression);
 * console.log(generateCropReport([shotValidation]));
 */

/**
 * LAYOUT CROP VALIDATION (NEW - catches grid/flex overflows)
 *
 * Validates multi-element layouts account for gaps and total width
 */
export function validateLayoutCrop(
  layout: LayoutConfig,
  viewport: ViewportBounds = { width: 1920, height: 1080 }
): LayoutCropResult {
  let totalWidth = 0;
  let totalHeight = 0;

  if (layout.type === 'flex-row' || layout.type === 'grid') {
    // Calculate total width: (elementWidth × count) + (gap × (count - 1))
    totalWidth = (layout.elementWidth * layout.elementCount) + (layout.gap * (layout.elementCount - 1));
    totalHeight = layout.elementHeight;
  } else if (layout.type === 'flex-column') {
    // Calculate total height: (elementHeight × count) + (gap × (count - 1))
    totalWidth = layout.elementWidth;
    totalHeight = (layout.elementHeight * layout.elementCount) + (layout.gap * (layout.elementCount - 1));
  } else {
    // Single element
    totalWidth = layout.elementWidth;
    totalHeight = layout.elementHeight;
  }

  const horizontalOverflow = Math.max(0, totalWidth - viewport.width);
  const verticalOverflow = Math.max(0, totalHeight - viewport.height);
  const isCropped = horizontalOverflow > 0 || verticalOverflow > 0;

  // Calculate max safe element sizes
  let maxSafeElementWidth = layout.elementWidth;
  let maxSafeElementHeight = layout.elementHeight;

  if (layout.type === 'flex-row' || layout.type === 'grid') {
    // Available width after gaps
    const availableWidth = viewport.width - (layout.gap * (layout.elementCount - 1));
    maxSafeElementWidth = Math.floor(availableWidth / layout.elementCount * 0.95);  // 5% safety margin
  }

  if (layout.type === 'flex-column') {
    // Available height after gaps
    const availableHeight = viewport.height - (layout.gap * (layout.elementCount - 1));
    maxSafeElementHeight = Math.floor(availableHeight / layout.elementCount * 0.95);
  }

  // Generate recommendation
  let recommendation = '';
  if (isCropped) {
    if (horizontalOverflow > 0) {
      recommendation += `❌ HORIZONTAL CROP: Layout width ${totalWidth}px exceeds viewport ${viewport.width}px (overflow: ${horizontalOverflow}px). `;
      recommendation += `Reduce element width to max ${maxSafeElementWidth}px or reduce gap. `;
    }
    if (verticalOverflow > 0) {
      recommendation += `❌ VERTICAL CROP: Layout height ${totalHeight}px exceeds viewport ${viewport.height}px (overflow: ${verticalOverflow}px). `;
      recommendation += `Reduce element height to max ${maxSafeElementHeight}px or reduce gap.`;
    }
  } else {
    recommendation = `✅ Layout fits within viewport (${totalWidth}×${totalHeight} < ${viewport.width}×${viewport.height})`;
  }

  return {
    totalWidth,
    totalHeight,
    isCropped,
    overflow: { horizontal: horizontalOverflow, vertical: verticalOverflow },
    maxSafeElementWidth,
    maxSafeElementHeight,
    recommendation
  };
}

/**
 * Usage Example for Grid Layouts:
 *
 * const twoCardLayout = validateLayoutCrop({
 *   type: 'flex-row',
 *   gap: 40,
 *   elementWidth: 1040,  // Card width
 *   elementHeight: 400,
 *   elementCount: 2
 * });
 *
 * console.log(twoCardLayout.recommendation);
 * // "❌ HORIZONTAL CROP: Layout width 2120px exceeds viewport 1920px (overflow: 200px).
 * //  Reduce element width to max 893px or reduce gap."
 *
 * // Fix: Use recommended width
 * const fixedLayout = validateLayoutCrop({
 *   type: 'flex-row',
 *   gap: 40,
 *   elementWidth: 893,  // Safe width
 *   elementHeight: 400,
 *   elementCount: 2
 * });
 * // "✅ Layout fits within viewport"
 */
