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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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

  // Build SVG shape based on type and section.
  // NOTE: SVG <rect> only supports numeric rx/ry values, not CSS shorthand.
  let shapeMarkup = '';
  if (type === 'slice') {
    const inset = 24;
    shapeMarkup = `<path d="M0 ${inset} L${inset} 0 H${896 - inset} L896 ${inset} V${height} H0 Z" fill="${bgFill}"/>`;
  } else {
    let radius = 0;
    if (type === 'rect') {
      radius = 8;
    } else if (type === 'cylinder') {
      radius = Math.floor(height / 2);
    } else if (type === 'soft') {
      radius = 36;
    } else {
      radius = 24;
    }

    if (section === 'header') {
      shapeMarkup = `<path d="M0 0 H896 V${height - radius} Q896 ${height} ${896 - radius} ${height} H${radius} Q0 ${height} 0 ${height - radius} Z" fill="${bgFill}"/>`;
    } else {
      shapeMarkup = `<path d="M0 ${radius} Q0 0 ${radius} 0 H${896 - radius} Q896 0 896 ${radius} V${height} H0 Z" fill="${bgFill}"/>`;
    }
  }

  // Create SVG with the requested parameters.
  //
  // IMPORTANT: The @import url() for Google Fonts is intentionally omitted.
  // GitHub proxies all README images through camo.githubusercontent.com and
  // enforces a strict Content Security Policy that blocks external resource
  // loading (fonts, stylesheets, scripts) inside SVGs rendered as <img>.
  // Including @import url('https://fonts.googleapis.com/...') causes GitHub
  // to refuse to display the image entirely. System fonts are used instead.
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="896" height="${height}" viewBox="0 0 896 ${height}">
  <defs>
    <style>
      ${keyframes}
      .text {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
  ${shapeMarkup}
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
