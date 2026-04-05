import { NextRequest, NextResponse } from 'next/server';

// Animation types
type AnimationType = 'none' | 'gradient' | 'pulse' | 'wave' | 'shimmer';

// Gradient direction types
type GradientDirection = 'horizontal' | 'vertical' | 'diagonal' | 'radial' | 'conic';

// Background type
type BackgroundType = 'solid' | 'gradient' | 'animated';

// Expand 3-char hex to 6-char hex
function expandHexColor(color: string): string {
  if (color.length === 3) {
    return color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }
  return color;
}

// Validate hex color - only allow 3 or 6 character hex values
function isValidHexColor(color: string): boolean {
  return /^[0-9A-F]{3}$/i.test(color) || /^[0-9A-F]{6}$/i.test(color);
}

// Sanitize and validate color parameter
function sanitizeColor(value: string | null, defaultColor: string): string {
  const color = (value ?? defaultColor).toUpperCase();
  // Only allow valid hex characters (0-9, A-F)
  const sanitized = color.replace(/[^0-9A-F]/g, '');
  // Validate it's a valid hex color (3 or 6 chars)
  if (isValidHexColor(sanitized)) {
    // Expand 3-char to 6-char for better compatibility
    return expandHexColor(sanitized);
  }
  return defaultColor;
}

// Validate alignment parameter
function sanitizeAlignment(value: string | null): string {
  const validAlignments = ['left', 'center', 'right'];
  const alignment = value?.toLowerCase();
  return validAlignments.includes(alignment ?? '') ? alignment! : 'center';
}

// Validate bgType parameter
function sanitizeBgType(value: string | null): BackgroundType {
  const validTypes: BackgroundType[] = ['solid', 'gradient', 'animated'];
  const bgType = value?.toLowerCase() as BackgroundType;
  return validTypes.includes(bgType) ? bgType : 'solid';
}

// Validate gradient direction
function sanitizeGradientDirection(value: string | null): GradientDirection {
  const validDirections: GradientDirection[] = [
    'horizontal',
    'vertical',
    'diagonal',
    'radial',
    'conic',
  ];
  const direction = value?.toLowerCase() as GradientDirection;
  return validDirections.includes(direction) ? direction : 'horizontal';
}

// Validate animation type
function sanitizeAnimationType(value: string | null): AnimationType {
  const validAnimations: AnimationType[] = ['none', 'gradient', 'pulse', 'wave', 'shimmer'];
  const animation = value?.toLowerCase() as AnimationType;
  return validAnimations.includes(animation) ? animation : 'none';
}

// Build linear gradient definition with better compatibility
function buildGradientDef(
  id: string,
  startColor: string,
  endColor: string,
  direction: GradientDirection,
): string {
  // Handle radial separately
  if (direction === 'radial') {
    return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%" fx="50%" fy="50%" spreadMethod="pad">
    <stop offset="0%" stop-color="#${startColor}" />
    <stop offset="100%" stop-color="#${endColor}" />
  </radialGradient>`;
  }

  // For conic, fallback to diagonal for better compatibility
  const effectiveDir = direction === 'conic' ? 'diagonal' : direction;

  // For linear gradients
  let x1 = '0%',
    y1 = '0%',
    x2 = '100%',
    y2 = '0%';

  switch (effectiveDir) {
    case 'vertical':
      x1 = '0%';
      y1 = '0%';
      x2 = '0%';
      y2 = '100%';
      break;
    case 'diagonal':
      x1 = '0%';
      y1 = '0%';
      x2 = '100%';
      y2 = '100%';
      break;
    default:
      // horizontal - already set
      break;
  }

  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" spreadMethod="pad">
    <stop offset="0%" stop-color="#${startColor}" />
    <stop offset="100%" stop-color="#${endColor}" />
  </linearGradient>`;
}

// Build animated gradient with SMIL animations that work in GitHub
function buildAnimatedGradientDef(
  id: string,
  startColor: string,
  endColor: string,
  animation: AnimationType,
): string {
  if (animation === 'gradient') {
    // Animated gradient flow using stop-color animation
    return `<linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="0%" spreadMethod="pad">
      <stop offset="0%" stop-color="#${startColor}">
        <animate attributeName="stop-color" values="#${startColor};#${endColor};#${startColor}" dur="3s" repeatCount="indefinite" />
      </stop>
      <stop offset="100%" stop-color="#${endColor}">
        <animate attributeName="stop-color" values="#${endColor};#${startColor};#${endColor}" dur="3s" repeatCount="indefinite" />
      </stop>
    </linearGradient>`;
  }

  if (animation === 'pulse') {
    // Pulse animation using stop-color
    return `<linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="0%" spreadMethod="pad">
      <stop offset="0%" stop-color="#${startColor}">
        <animate attributeName="stop-color" values="#${startColor};#${startColor};#${startColor}" dur="1s" repeatCount="indefinite" />
      </stop>
      <stop offset="100%" stop-color="#${endColor}">
        <animate attributeName="stop-color" values="#${endColor};#${endColor};#${endColor}" dur="1s" repeatCount="indefinite" />
      </stop>
    </linearGradient>`;
  }

  // Default to gradient animation
  return buildAnimatedGradientDef(id, startColor, endColor, 'gradient');
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  // Get and sanitize parameters
  const bgType = sanitizeBgType(sp.get('bgType'));
  const thickness = parseInt(sp.get('thickness') ?? '2', 10);
  const width = parseInt(sp.get('width') ?? '800', 10);
  const alignment = sanitizeAlignment(sp.get('alignment'));

  // Color parameters - sanitized
  const bgSolidColor = sanitizeColor(sp.get('bgSolidColor'), 'CCCCCC');
  const bgStartColor = sanitizeColor(sp.get('bgStartColor'), 'CCCCCC');
  const bgEndColor = sanitizeColor(sp.get('bgEndColor'), '999999');
  const bgGradientDirection = sanitizeGradientDirection(sp.get('bgGradientDirection'));
  const bgAnimation = sanitizeAnimationType(sp.get('bgAnimation'));

  // Clamp values
  const clampedThickness = Math.max(1, Math.min(50, thickness));
  const clampedWidth = Math.max(100, Math.min(2000, width));

  // Calculate alignment offset
  let xOffset = 0;
  if (alignment === 'left') {
    xOffset = -(clampedWidth / 4);
  } else if (alignment === 'right') {
    xOffset = clampedWidth / 4;
  }

  // Build SVG based on bgType
  let svgContent = '';
  const gradientId = 'dividerGradient';
  const gradientRef = `url(#${gradientId})`;

  if (bgType === 'solid') {
    svgContent = `<rect x="${xOffset}" y="0" width="${clampedWidth}" height="${clampedThickness}" fill="#${bgSolidColor}" rx="${clampedThickness / 2}"/>`;
  } else if (bgType === 'gradient') {
    const gradientDef = buildGradientDef(gradientId, bgStartColor, bgEndColor, bgGradientDirection);
    svgContent = `<defs>${gradientDef}</defs><rect x="${xOffset}" y="0" width="${clampedWidth}" height="${clampedThickness}" fill="${gradientRef}" rx="${clampedThickness / 2}"/>`;
  } else if (bgType === 'animated') {
    const gradientDef = buildAnimatedGradientDef(gradientId, bgStartColor, bgEndColor, bgAnimation);
    svgContent = `<defs>${gradientDef}</defs><rect x="${xOffset}" y="0" width="${clampedWidth}" height="${clampedThickness}" fill="${gradientRef}" rx="${clampedThickness / 2}"/>`;
  } else {
    // Fallback to solid
    svgContent = `<rect x="${xOffset}" y="0" width="${clampedWidth}" height="${clampedThickness}" fill="#${bgSolidColor}" rx="${clampedThickness / 2}"/>`;
  }

  return new NextResponse(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${clampedWidth}" height="${clampedThickness}" viewBox="0 0 ${clampedWidth} ${clampedThickness}">
  ${svgContent}
</svg>`,
    {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
