import { NextRequest, NextResponse } from 'next/server';

const WIDTH = 896;

type GradientDir = 'horizontal' | 'vertical' | 'diagonal' | 'radial';

function buildGradientDef(
  id: string,
  startColor: string,
  endColor: string,
  direction: GradientDir,
): string {
  if (direction === 'radial') {
    return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#${startColor}"/>
      <stop offset="100%" stop-color="#${endColor}"/>
    </radialGradient>`;
  }
  const coords: Record<string, string> = {
    horizontal: 'x1="0%" y1="0%" x2="100%" y2="0%"',
    vertical: 'x1="0%" y1="0%" x2="0%" y2="100%"',
    diagonal: 'x1="0%" y1="0%" x2="100%" y2="100%"',
  };
  return `<linearGradient id="${id}" ${coords[direction] ?? coords.horizontal}>
    <stop offset="0%" stop-color="#${startColor}"/>
    <stop offset="100%" stop-color="#${endColor}"/>
  </linearGradient>`;
}

/**
 * Generate an SVG path for a rectangle with independent corner radii.
 * Radii are clamped so they cannot exceed half the width or height.
 */
function roundedRectPath(
  w: number,
  h: number,
  rtl: number,
  rtr: number,
  rbr: number,
  rbl: number,
): string {
  // Clamp radii so adjacent corners don't overlap
  const maxH = h / 2;
  const maxW = w / 2;
  rtl = Math.min(rtl, maxH, maxW);
  rtr = Math.min(rtr, maxH, maxW);
  rbr = Math.min(rbr, maxH, maxW);
  rbl = Math.min(rbl, maxH, maxW);

  return [
    `M ${rtl} 0`,
    `H ${w - rtr}`,
    rtr > 0 ? `Q ${w} 0 ${w} ${rtr}` : '',
    `V ${h - rbr}`,
    rbr > 0 ? `Q ${w} ${h} ${w - rbr} ${h}` : '',
    `H ${rbl}`,
    rbl > 0 ? `Q 0 ${h} 0 ${h - rbl}` : '',
    `V ${rtl}`,
    rtl > 0 ? `Q 0 0 ${rtl} 0` : '',
    'Z',
  ]
    .filter(Boolean)
    .join(' ');
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  /* ── Type & section ───────────────────────────────────────────── */
  const validTypes = ['waving', 'rect', 'cylinder', 'soft', 'slice'] as const;
  const validSections = ['header', 'footer'] as const;
  const validAnimations = ['none', 'fadeIn', 'waving', 'scale'] as const;
  const validDirs = ['horizontal', 'vertical', 'diagonal', 'radial'] as const;

  const type = (validTypes as readonly string[]).includes(sp.get('type') ?? '')
    ? (sp.get('type') as (typeof validTypes)[number])
    : 'waving';
  const section = (validSections as readonly string[]).includes(sp.get('section') ?? '')
    ? (sp.get('section') as (typeof validSections)[number])
    : 'header';
  const animation = (validAnimations as readonly string[]).includes(sp.get('animation') ?? '')
    ? (sp.get('animation') as (typeof validAnimations)[number])
    : 'none';
  const gradDir = (validDirs as readonly string[]).includes(sp.get('gradientDirection') ?? '')
    ? (sp.get('gradientDirection') as GradientDir)
    : 'horizontal';

  /* ── Dimensions ───────────────────────────────────────────────── */
  const height = Math.min(Math.max(parseInt(sp.get('height') ?? '200', 10), 50), 500);

  /* ── Text / font ──────────────────────────────────────────────── */
  const rawText = sp.get('text') ?? '';
  const text = rawText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  const fontSize = Math.min(Math.max(parseInt(sp.get('fontSize') ?? '30', 10), 10), 100);

  /* ── Colors ───────────────────────────────────────────────────── */
  const sanitizeHex = (raw: string | null, fallback: string) =>
    (raw ?? '').replace(/[^a-fA-F0-9]/g, '').slice(0, 6) || fallback;

  const bgColor = sanitizeHex(
    sp.get('color') ? (sp.get('color') as string).replace(/^#/, '') : null,
    'EEFF00',
  );
  const bgColorEnd = sanitizeHex(
    sp.get('colorEnd') ? (sp.get('colorEnd') as string).replace(/^#/, '') : null,
    '',
  );
  const txtColor = sanitizeHex(
    sp.get('fontColor') ? (sp.get('fontColor') as string).replace(/^#/, '') : null,
    'ffffff',
  );

  const useGradient = bgColorEnd.length === 6;

  /* ── Compute default corner radii from type + section ─────────── */
  const maxR = Math.floor(height / 2);

  let defTL = 0,
    defTR = 0,
    defBR = 0,
    defBL = 0;

  if (type === 'rect') {
    defTL = defTR = defBR = defBL = 8;
  } else if (type === 'cylinder') {
    defTL = defTR = defBR = defBL = maxR;
  } else if (type === 'soft') {
    defTL = defTR = defBR = defBL = 36;
  } else if (type === 'waving') {
    if (section === 'header') {
      defTL = defTR = 24;
      defBR = defBL = 0;
    } else {
      defTL = defTR = 0;
      defBR = defBL = 24;
    }
  }
  // 'slice' handled separately below

  /* ── Per-corner radius overrides ──────────────────────────────── */
  const parseCorner = (key: string, def: number) => {
    const raw = sp.get(key);
    if (raw === null) return def;
    const n = parseInt(raw, 10);
    return isNaN(n) ? def : Math.min(Math.max(n, 0), maxR);
  };

  const rtl = parseCorner('rtl', defTL);
  const rtr = parseCorner('rtr', defTR);
  const rbr = parseCorner('rbr', defBR);
  const rbl = parseCorner('rbl', defBL);

  /* ── Gradient definition ──────────────────────────────────────── */
  const GRAD_ID = 'bg';
  let gradientDef = '';
  let bgFill = `#${bgColor}`;

  if (useGradient) {
    gradientDef = buildGradientDef(GRAD_ID, bgColor, bgColorEnd, gradDir);
    bgFill = `url(#${GRAD_ID})`;
  }

  /* ── Shape markup ─────────────────────────────────────────────── */
  let shapeMarkup: string;

  if (type === 'slice') {
    const inset = 24;
    shapeMarkup = `<path d="M0 ${inset} L${inset} 0 H${WIDTH - inset} L${WIDTH} ${inset} V${height} H0 Z" fill="${bgFill}"/>`;
  } else {
    const d = roundedRectPath(WIDTH, height, rtl, rtr, rbr, rbl);
    shapeMarkup = `<path d="${d}" fill="${bgFill}"/>`;
  }

  /* ── Animation CSS ────────────────────────────────────────────── */
  let animStyle = '';
  let keyframes = '';

  if (animation === 'fadeIn') {
    keyframes = `@keyframes fadeIn{from{opacity:0}to{opacity:1}}`;
    animStyle = 'animation:fadeIn 1s ease-out forwards';
  } else if (animation === 'waving') {
    keyframes = `@keyframes wv{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`;
    animStyle = 'animation:wv 2s ease-in-out infinite';
  } else if (animation === 'scale') {
    keyframes = `@keyframes sc{from{transform:scale(0.9);opacity:0}to{transform:scale(1);opacity:1}}`;
    animStyle = 'animation:sc 0.8s ease-out forwards';
  }

  /* ── Final SVG ────────────────────────────────────────────────── */
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}">
  <defs>
    ${gradientDef}
    <style>
      ${keyframes}
      .bg-shape{${animStyle}}
      .label{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:${fontSize}px;font-weight:700;fill:#${txtColor};text-anchor:middle;dominant-baseline:middle}
    </style>
  </defs>
  <g class="bg-shape">${shapeMarkup}</g>
  ${text ? `<text class="label" x="${WIDTH / 2}" y="${height / 2}">${text}</text>` : ''}
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
