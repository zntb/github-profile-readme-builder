import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Get parameters from query string
  const typeInput = searchParams.get('type') || 'waving';
  const color = searchParams.get('color') || 'EEFF00';
  const colorEnd = searchParams.get('colorEnd') || '';
  const height = Math.min(Math.max(parseInt(searchParams.get('height') || '200', 10), 50), 500);
  const sectionInput = searchParams.get('section') || 'header';
  let text = searchParams.get('text') || '';
  const fontSize = Math.min(Math.max(parseInt(searchParams.get('fontSize') || '30', 10), 10), 100);
  const fontColor = searchParams.get('fontColor') || 'ffffff';
  const animationInput = searchParams.get('animation') || 'none';
  const gradientDirection = searchParams.get('gradientDirection') || 'horizontal';

  // Validate type parameter - only allow safe values
  const validTypes = ['waving', 'rect', 'cylinder', 'soft', 'slice'];
  const type = validTypes.includes(typeInput) ? typeInput : 'waving';

  // Validate section parameter - only allow safe values
  const validSections = ['header', 'footer'];
  const section = validSections.includes(sectionInput) ? sectionInput : 'header';

  // Validate animation parameter - only allow safe values
  const validAnimations = ['none', 'fadeIn', 'waving', 'scale'];
  const animation = validAnimations.includes(animationInput) ? animationInput : 'none';

  // Sanitize text to prevent XSS attacks
  text = text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;');

  // Parse color - remove # if present and validate hex format
  let bgColor = color.startsWith('#') ? color.slice(1) : color;
  let bgColorEnd = colorEnd.startsWith('#') ? colorEnd.slice(1) : colorEnd;
  let txtColor = fontColor.startsWith('#') ? fontColor.slice(1) : fontColor;

  // Validate hex color format - only allow alphanumeric characters
  // This prevents XSS via color parameters
  bgColor = bgColor.replace(/[^a-fA-F0-9]/g, '').slice(0, 6) || 'EEFF00';
  bgColorEnd = bgColorEnd.replace(/[^a-fA-F0-9]/g, '').slice(0, 6) || '';
  txtColor = txtColor.replace(/[^a-fA-F0-9]/g, '').slice(0, 6) || 'ffffff';

  // Determine if we need gradient
  const useGradient = bgColorEnd !== '';

  // Determine border radius based on type and section
  let borderRadius = '0 0 24px 24px';
  if (type === 'rect') {
    borderRadius = '8px';
  } else if (type === 'cylinder') {
    borderRadius = '9999px';
  } else if (type === 'soft') {
    borderRadius = '36px';
  } else if (type === 'slice') {
    borderRadius = '48px 10px 48px 10px';
  } else if (section === 'footer') {
    borderRadius = '24px 24px 0 0';
  }

  // Build animation CSS
  let animationStyle = '';
  let keyframes = '';
  if (animation === 'fadeIn') {
    animationStyle = 'animation: fadeIn 1s ease-out forwards';
    keyframes = `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`;
  } else if (animation === 'waving') {
    animationStyle = 'animation: wave 2s ease-in-out infinite';
    keyframes = `@keyframes wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`;
  } else if (animation === 'scale') {
    animationStyle = 'animation: scale 1s ease-out forwards';
    keyframes = `@keyframes scale { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }`;
  }

  // Build gradient SVG definitions
  let gradientDef = '';
  let bgFill = `#${bgColor}`;
  if (useGradient) {
    const gradId = 'gradientFill';
    let gradientAttrs = '';
    if (gradientDirection === 'vertical') {
      gradientAttrs = 'x1="0%" y1="0%" x2="0%" y2="100%"';
    } else if (gradientDirection === 'diagonal') {
      gradientAttrs = 'x1="0%" y1="0%" x2="100%" y2="100%"';
    } else if (gradientDirection === 'radial') {
      gradientAttrs = 'cx="50%" cy="50%" r="50%"';
    } else {
      gradientAttrs = 'x1="0%" y1="0%" x2="100%" y2="0%"';
    }
    gradientDef = `<linearGradient id="${gradId}" ${gradientAttrs}>
      <stop offset="0%" stop-color="#${bgColor}"/>
      <stop offset="100%" stop-color="#${bgColorEnd}"/>
    </linearGradient>`;
    bgFill = `url(#${gradId})`;
  }

  // Create SVG with the requested parameters
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="896" height="${height}" viewBox="0 0 896 ${height}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap');
      ${keyframes}
      .text {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: ${fontSize}px;
        font-weight: 700;
        fill: #${txtColor};
        text-anchor: middle;
        dominant-baseline: middle;
      }
      svg {
        ${animationStyle}
      }
    </style>
    ${gradientDef}
  </defs>
  <rect x="0" y="0" width="896" height="${height}" rx="${borderRadius}" fill="${bgFill}"/>
  <text class="text" x="448" y="${height / 2}">${text}</text>
</svg>`;

  // Return SVG with proper content-type
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
