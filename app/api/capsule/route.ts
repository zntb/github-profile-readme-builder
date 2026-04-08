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
  const validTypes = [
    'wave',
    'egg',
    'shark',
    'waving',
    'rect',
    'cylinder',
    'soft',
    'slice',
    'speech',
    'transparent',
    'blur',
  ] as const;
  const validSections = ['header', 'footer'] as const;
  const validAnimations = ['none', 'fadeIn', 'waving', 'scale'] as const;
  const validDirs = ['horizontal', 'vertical', 'diagonal', 'radial'] as const;
  const parallax = sp.get('parallax') === 'true';

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
  } else if (type === 'wave') {
    if (section === 'header') {
      defTL = defTR = 0;
      defBR = defBL = 40;
    } else {
      defTL = defTR = 40;
      defBR = defBL = 0;
    }
  } else if (type === 'egg') {
    if (section === 'header') {
      defTL = defTR = 50;
      defBR = defBL = 0;
    } else {
      defTL = defTR = 0;
      defBR = defBL = 50;
    }
  } else if (type === 'shark') {
    if (section === 'header') {
      defTL = defTR = 20;
      defBR = 0;
      defBL = 10;
    } else {
      defTL = 0;
      defTR = defBR = defBL = 20;
    }
  } else if (type === 'waving') {
    if (section === 'header') {
      defTL = defTR = 24;
      defBR = defBL = 0;
    } else {
      defTL = defTR = 0;
      defBR = defBL = 24;
    }
  } else if (type === 'speech') {
    if (section === 'header') {
      defTL = defTR = 24;
      defBR = defBL = 0;
    } else {
      defTL = defTR = 0;
      defBR = defBL = 24;
    }
  } else if (type === 'transparent' || type === 'blur') {
    defTL = defTR = defBR = defBL = 0;
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
  let extraDefs = '';

  if (type === 'slice') {
    const inset = 24;
    shapeMarkup = `<path d="M0 ${inset} L${inset} 0 H${WIDTH - inset} L${WIDTH} ${inset} V${height} H0 Z" fill="${bgFill}"/>`;
  } else if (type === 'waving') {
    // Waving shape. With parallax enabled, render dual animated layers.
    if (parallax) {
      const dur = '20s';
      if (section === 'header') {
        shapeMarkup = `
<path fill="${bgFill}" opacity="0.4">
  <animate attributeName="d" dur="${dur}" repeatCount="indefinite" keyTimes="0;0.333;0.667;1" calcMode="spline" keySplines="0.2 0 0.2 1;0.2 0 0.2 1;0.2 0 0.2 1" values="M0 0L0 ${Math.round(height * 0.73)}Q${WIDTH / 4} ${Math.round(height * 0.87)} ${WIDTH / 2} ${Math.round(height * 0.77)}T${WIDTH} ${Math.round(height * 0.85)}L${WIDTH} 0 Z;M0 0L0 ${Math.round(height * 0.82)}Q${WIDTH / 4} ${Math.round(height * 0.87)} ${WIDTH / 2} ${Math.round(height * 0.8)}T${WIDTH} ${Math.round(height * 0.77)}L${WIDTH} 0 Z;M0 0L0 ${Math.round(height * 0.88)}Q${WIDTH / 4} ${Math.round(height * 0.78)} ${WIDTH / 2} ${Math.round(height * 0.88)}T${WIDTH} ${Math.round(height * 0.77)}L${WIDTH} 0 Z;M0 0L0 ${Math.round(height * 0.73)}Q${WIDTH / 4} ${Math.round(height * 0.87)} ${WIDTH / 2} ${Math.round(height * 0.77)}T${WIDTH} ${Math.round(height * 0.85)}L${WIDTH} 0 Z"/>
</path>
<path fill="${bgFill}" opacity="0.4">
  <animate attributeName="d" dur="${dur}" repeatCount="indefinite" keyTimes="0;0.333;0.667;1" calcMode="spline" keySplines="0.2 0 0.2 1;0.2 0 0.2 1;0.2 0 0.2 1" begin="-10s" values="M0 0L0 ${Math.round(height * 0.78)}Q${WIDTH / 4} ${Math.round(height * 0.93)} ${WIDTH / 2} ${Math.round(height * 0.83)}T${WIDTH} ${Math.round(height * 0.87)}L${WIDTH} 0 Z;M0 0L0 ${Math.round(height * 0.83)}Q${WIDTH / 4} ${Math.round(height * 0.73)} ${WIDTH / 2} ${Math.round(height * 0.73)}T${WIDTH} ${Math.round(height * 0.8)}L${WIDTH} 0 Z;M0 0L0 ${Math.round(height * 0.82)}Q${WIDTH / 4} ${Math.round(height * 0.75)} ${WIDTH / 2} ${Math.round(height * 0.83)}T${WIDTH} ${Math.round(height * 0.88)}L${WIDTH} 0 Z;M0 0L0 ${Math.round(height * 0.78)}Q${WIDTH / 4} ${Math.round(height * 0.93)} ${WIDTH / 2} ${Math.round(height * 0.83)}T${WIDTH} ${Math.round(height * 0.87)}L${WIDTH} 0 Z"/>
</path>`;
      } else {
        shapeMarkup = `
<path fill="${bgFill}" opacity="0.4">
  <animate attributeName="d" dur="${dur}" repeatCount="indefinite" keyTimes="0;0.333;0.667;1" calcMode="spline" keySplines="0.2 0 0.2 1;0.2 0 0.2 1;0.2 0 0.2 1" values="M0 ${height}L0 ${Math.round(height * 0.27)}Q${WIDTH / 4} ${Math.round(height * 0.13)} ${WIDTH / 2} ${Math.round(height * 0.23)}T${WIDTH} ${Math.round(height * 0.15)}L${WIDTH} ${height} Z;M0 ${height}L0 ${Math.round(height * 0.18)}Q${WIDTH / 4} ${Math.round(height * 0.13)} ${WIDTH / 2} ${Math.round(height * 0.2)}T${WIDTH} ${Math.round(height * 0.23)}L${WIDTH} ${height} Z;M0 ${height}L0 ${Math.round(height * 0.12)}Q${WIDTH / 4} ${Math.round(height * 0.22)} ${WIDTH / 2} ${Math.round(height * 0.12)}T${WIDTH} ${Math.round(height * 0.23)}L${WIDTH} ${height} Z;M0 ${height}L0 ${Math.round(height * 0.27)}Q${WIDTH / 4} ${Math.round(height * 0.13)} ${WIDTH / 2} ${Math.round(height * 0.23)}T${WIDTH} ${Math.round(height * 0.15)}L${WIDTH} ${height} Z"/>
</path>
<path fill="${bgFill}" opacity="0.4">
  <animate attributeName="d" dur="${dur}" repeatCount="indefinite" keyTimes="0;0.333;0.667;1" calcMode="spline" keySplines="0.2 0 0.2 1;0.2 0 0.2 1;0.2 0 0.2 1" begin="-10s" values="M0 ${height}L0 ${Math.round(height * 0.22)}Q${WIDTH / 4} ${Math.round(height * 0.07)} ${WIDTH / 2} ${Math.round(height * 0.17)}T${WIDTH} ${Math.round(height * 0.13)}L${WIDTH} ${height} Z;M0 ${height}L0 ${Math.round(height * 0.17)}Q${WIDTH / 4} ${Math.round(height * 0.27)} ${WIDTH / 2} ${Math.round(height * 0.27)}T${WIDTH} ${Math.round(height * 0.2)}L${WIDTH} ${height} Z;M0 ${height}L0 ${Math.round(height * 0.18)}Q${WIDTH / 4} ${Math.round(height * 0.25)} ${WIDTH / 2} ${Math.round(height * 0.17)}T${WIDTH} ${Math.round(height * 0.12)}L${WIDTH} ${height} Z;M0 ${height}L0 ${Math.round(height * 0.22)}Q${WIDTH / 4} ${Math.round(height * 0.07)} ${WIDTH / 2} ${Math.round(height * 0.17)}T${WIDTH} ${Math.round(height * 0.13)}L${WIDTH} ${height} Z"/>
</path>`;
      }
    } else {
      const waveHeight = 20;
      if (section === 'header') {
        shapeMarkup = `<path d="M0 ${waveHeight} Q${WIDTH / 4} ${waveHeight - 10} ${WIDTH / 2} ${waveHeight} T${WIDTH} ${waveHeight} V${height} H0 Z" fill="${bgFill}"/>`;
      } else {
        shapeMarkup = `<path d="M0 0 H${WIDTH} V${height - waveHeight} Q${(WIDTH * 3) / 4} ${height - waveHeight + 10} ${WIDTH / 2} ${height - waveHeight} T0 ${height - waveHeight} Z" fill="${bgFill}"/>`;
      }
    }
  } else if (type === 'wave') {
    // Wave shape - creates a wave pattern at the bottom or top
    const waveHeight = 30;
    if (section === 'header') {
      shapeMarkup = `<path d="M0 ${waveHeight} Q${WIDTH / 4} ${waveHeight + 15} ${WIDTH / 2} ${waveHeight} T${WIDTH} ${waveHeight} V${height} H0 Z" fill="${bgFill}"/>`;
    } else {
      shapeMarkup = `<path d="M0 0 H${WIDTH} V${height - waveHeight} Q${(WIDTH * 3) / 4} ${height - waveHeight - 15} ${WIDTH / 2} ${height - waveHeight} T0 ${height - waveHeight} Z" fill="${bgFill}"/>`;
    }
  } else if (type === 'egg') {
    // Egg shape - oval with more rounded top
    if (section === 'header') {
      shapeMarkup = `<ellipse cx="${WIDTH / 2}" cy="${height / 2}" rx="${WIDTH / 2 - 10}" ry="${height / 2 - 5}" fill="${bgFill}"/>`;
    } else {
      shapeMarkup = `<ellipse cx="${WIDTH / 2}" cy="${height / 2}" rx="${WIDTH / 2 - 10}" ry="${height / 2 - 5}" fill="${bgFill}"/>`;
    }
  } else if (type === 'shark') {
    // Shark fin shape
    if (section === 'header') {
      shapeMarkup = `<path d="M0 ${height} L0 40 Q${WIDTH / 3} 0 ${WIDTH / 2} 40 L${WIDTH} 40 V${height} H0 Z" fill="${bgFill}"/>`;
    } else {
      shapeMarkup = `<path d="M0 0 H${WIDTH} V${height - 40} L${WIDTH / 2} ${height - 40} Q${WIDTH / 3} ${height} 0 ${height - 40} Z" fill="${bgFill}"/>`;
    }
  } else if (type === 'speech') {
    // Speech bubble shape with tail
    const tailSize = 20;
    if (section === 'header') {
      shapeMarkup = `<path d="M${tailSize} 0 H${WIDTH - tailSize} Q${WIDTH} 0 ${WIDTH} ${tailSize} V${height - tailSize} Q${WIDTH} ${height} ${WIDTH - tailSize} ${height} H${tailSize} Q0 ${height} 0 ${height - tailSize} V${tailSize} Q0 0 ${tailSize} 0 Z" fill="${bgFill}"/>`;
    } else {
      shapeMarkup = `<path d="M${tailSize} 0 H${WIDTH - tailSize} Q${WIDTH} 0 ${WIDTH} ${tailSize} V${height - tailSize} Q${WIDTH} ${height} ${WIDTH - tailSize} ${height} H${WIDTH / 2 + tailSize} L${WIDTH / 2} ${height + tailSize} L${WIDTH / 2 - tailSize} ${height} H${tailSize} Q0 ${height} 0 ${height - tailSize} V${tailSize} Q0 0 ${tailSize} 0 Z" fill="${bgFill}"/>`;
    }
  } else if (type === 'transparent') {
    // Transparent background - no fill
    shapeMarkup = `<rect width="${WIDTH}" height="${height}" fill="transparent"/>`;
  } else if (type === 'blur') {
    // Blur effect background
    extraDefs = `<filter id="blurFilter"><feGaussianBlur in="SourceGraphic" stdDeviation="10" /></filter>`;
    shapeMarkup = `<rect width="${WIDTH}" height="${height}" fill="${bgFill}" filter="url(#blurFilter)"/>`;
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

  // Parallax for waving is encoded directly in SVG path animations.

  /* ── Final SVG ────────────────────────────────────────────────── */
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}">
  <defs>
    ${gradientDef}
    ${extraDefs}
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
