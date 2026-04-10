import { applyPalette, GIFEncoder, quantize } from 'gifenc';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const WIDTH = 896;

// Interpolate between two hex colors
function lerpColor(color1: string, color2: string, t: number): string {
  const r1 = parseInt(color1.substring(0, 2), 16);
  const g1 = parseInt(color1.substring(2, 4), 16);
  const b1 = parseInt(color1.substring(4, 6), 16);
  const r2 = parseInt(color2.substring(0, 2), 16);
  const g2 = parseInt(color2.substring(2, 4), 16);
  const b2 = parseInt(color2.substring(4, 6), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}

type GradientDir = 'horizontal' | 'vertical' | 'diagonal' | 'radial';

function buildGradientDef(
  id: string,
  startColor: string,
  endColor: string,
  direction: GradientDir,
  animate: boolean = false,
): string {
  const animationAttrs = animate
    ? `
      <animate attributeName="stop-color" values="#${startColor};${startColor};${endColor};${startColor}" dur="3s" repeatCount="indefinite" />`
    : '';
  const animationAttrs2 = animate
    ? `
      <animate attributeName="stop-color" values="#${endColor};${endColor};${startColor};${endColor}" dur="3s" repeatCount="indefinite" />`
    : '';

  if (direction === 'radial') {
    return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#${startColor}">${animationAttrs}</stop>
      <stop offset="100%" stop-color="#${endColor}">${animationAttrs2}</stop>
    </radialGradient>`;
  }
  const coords: Record<string, string> = {
    horizontal: 'x1="0%" y1="0%" x2="100%" y2="0%"',
    vertical: 'x1="0%" y1="0%" x2="0%" y2="100%"',
    diagonal: 'x1="0%" y1="0%" x2="100%" y2="100%"',
  };
  return `<linearGradient id="${id}" ${coords[direction] ?? coords.horizontal}>
    <stop offset="0%" stop-color="#${startColor}">${animationAttrs}</stop>
    <stop offset="100%" stop-color="#${endColor}">${animationAttrs2}</stop>
  </linearGradient>`;
}

/**
 * Generate an SVG path for a rectangle with independent corner radii.
 */
function roundedRectPath(
  w: number,
  h: number,
  rtl: number,
  rtr: number,
  rbr: number,
  rbl: number,
): string {
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

interface GifFrameParams {
  shapeMarkup: string;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  txtColor: string;
  gradDir: GradientDir;
  textAlignX: number;
  textAlignY: number;
  extraDefs?: string;
  /** Optional second gradient colors (used by parallax waving shapes). */
  startColor2?: string;
  endColor2?: string;
}

/**
 * Generate an animated GIF by rebuilding the SVG for each frame with
 * per-frame interpolated gradient colours.
 *
 * The previous approach tried to regex-patch `stop-color` attributes inside the
 * rendered SVG string, but that was broken in two ways:
 *
 *   1. The callback checked `match.includes('0%')`, which is always false because
 *      `match` is the matched text (e.g. `stop-color="#EEFF00"`), never the
 *      surrounding XML that contains `offset="0%"`.
 *
 *   2. The RGBA conversion loop read `rgbData[j * 3]` on a buffer that was already
 *      RGBA (4 bytes/pixel) after `.removeAlpha().ensureAlpha()`, so every channel
 *      was misread and the GIF was corrupt.
 *
 * The correct approach is to rebuild a clean per-frame SVG with a freshly
 * constructed, non-animated gradient definition for each frame.
 */
async function generateAnimatedGif(
  params: GifFrameParams,
  startColor: string,
  endColor: string,
  duration: number = 3,
  fps: number = 10,
): Promise<Buffer> {
  const {
    shapeMarkup,
    width,
    height,
    text,
    fontSize,
    txtColor,
    gradDir,
    textAlignX,
    textAlignY,
    extraDefs = '',
    startColor2,
    endColor2,
  } = params;

  const numFrames = Math.ceil(duration * fps);
  const gif = GIFEncoder();
  const delay = Math.round(1000 / fps);

  for (let i = 0; i < numFrames; i++) {
    // Smooth sine-wave cycle so the animation loops seamlessly.
    const t = (i / numFrames) * 2 * Math.PI;
    const blend = (Math.sin(t) + 1) / 2;

    const cs = lerpColor(startColor, endColor, blend);
    const ce = lerpColor(endColor, startColor, blend);

    // Build a static (no SMIL) gradient definition for this frame.
    const frameGradDef = buildGradientDef('bg', cs, ce, gradDir, false);

    let frameGradDef2 = '';
    if (startColor2 && endColor2) {
      const cs2 = lerpColor(startColor2, endColor2, blend);
      const ce2 = lerpColor(endColor2, startColor2, blend);
      frameGradDef2 = buildGradientDef('bg2', cs2, ce2, gradDir, false);
    }

    const frameSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    ${frameGradDef}
    ${frameGradDef2}
    ${extraDefs}
  </defs>
  <g>${shapeMarkup}</g>
  ${
    text
      ? `<text style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:${fontSize}px;font-weight:700;fill:#${txtColor};text-anchor:middle;dominant-baseline:middle" x="${(width * textAlignX) / 100}" y="${(height * textAlignY) / 100}">${text}</text>`
      : ''
  }
</svg>`;

    const pngBuffer = await sharp(Buffer.from(frameSvg)).png().toBuffer();
    const metadata = await sharp(pngBuffer).metadata();
    const fw = metadata.width || width;
    const fh = metadata.height || height;

    // ensureAlpha() guarantees an RGBA (4-byte-per-pixel) buffer directly —
    // no manual channel conversion needed.
    const rgbaRaw = await sharp(pngBuffer).ensureAlpha().raw().toBuffer();
    const uint8 = new Uint8Array(rgbaRaw.buffer, rgbaRaw.byteOffset, rgbaRaw.byteLength);

    const palette = quantize(Buffer.from(uint8), 256, { oneBitAlpha: false });
    const index = applyPalette(Buffer.from(uint8), palette);

    gif.writeFrame(index, fw, fh, { palette, delay });
  }

  gif.finish();
  return Buffer.from(gif.bytes());
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
  const validAnimations = [
    'none',
    'fadeIn',
    'waving',
    'scale',
    'gradient',
    'pulse',
    'shimmer',
    'bounce',
  ] as const;
  const validDirs = ['horizontal', 'vertical', 'diagonal', 'radial'] as const;
  const parallax = sp.get('parallax') === 'true';

  const wavePosition = Math.min(Math.max(parseInt(sp.get('wavePosition') ?? '70', 10), 0), 100);
  const waveAmplitude = Math.min(Math.max(parseInt(sp.get('waveAmplitude') ?? '20', 10), 5), 50);
  const waveSpeed = Math.min(Math.max(parseInt(sp.get('waveSpeed') ?? '20', 10), 5), 60);
  const flipWave = sp.get('flipWave') === 'true';
  const actualWavePosition = flipWave ? 100 - wavePosition : wavePosition;

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

  /* ── Text Alignment ───────────────────────────────────────────── */
  const textAlignX = Math.min(Math.max(parseInt(sp.get('textAlignX') ?? '50', 10), 0), 100);
  const textAlignY = Math.min(Math.max(parseInt(sp.get('textAlignY') ?? '50', 10), 0), 100);

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

  const waveColor2 = sanitizeHex(sp.get('waveColor2') ?? '', bgColor);
  const waveColorEnd2 = sanitizeHex(sp.get('waveColorEnd2') ?? '', bgColorEnd);
  const useGradient2 = waveColorEnd2.length === 6;

  const useGradient = bgColorEnd.length === 6;

  /* ── Compute default corner radii ─────────────────────────────── */
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
  const GRAD_ID_2 = 'bg2';
  let gradientDef = '';
  let gradientDef2 = '';
  let bgFill = `#${bgColor}`;
  let bgFill2 = `#${waveColor2}`;

  // For the GIF path (animation === 'gradient'), per-frame gradient defs are
  // built inside generateAnimatedGif — no SMIL animation in the base SVG.
  const animateGradient = false;

  if (useGradient) {
    gradientDef = buildGradientDef(GRAD_ID, bgColor, bgColorEnd, gradDir, animateGradient);
    bgFill = `url(#${GRAD_ID})`;
  }

  if (useGradient2) {
    gradientDef2 = buildGradientDef(GRAD_ID_2, waveColor2, waveColorEnd2, gradDir, animateGradient);
    bgFill2 = `url(#${GRAD_ID_2})`;
  } else {
    bgFill2 = bgFill;
  }

  /* ── Shape markup ─────────────────────────────────────────────── */
  let shapeMarkup: string;
  let extraDefs = '';

  if (type === 'slice') {
    const inset = 24;
    shapeMarkup = `<path d="M0 ${inset} L${inset} 0 H${WIDTH - inset} L${WIDTH} ${inset} V${height} H0 Z" fill="${bgFill}"/>`;
  } else if (type === 'waving') {
    if (parallax) {
      const dur = `${waveSpeed}s`;
      const effectiveSection = flipWave ? (section === 'header' ? 'footer' : 'header') : section;
      const baseWaveY = (height * actualWavePosition) / 100;
      const amplitude = flipWave ? -waveAmplitude : waveAmplitude;

      const layer1Y = Math.round(baseWaveY - amplitude * 0.2);
      const layer2Y = Math.round(baseWaveY + amplitude * 0.15);
      const layer2Offset = waveSpeed * 0.33;

      if (effectiveSection === 'header') {
        shapeMarkup = `
<!-- Background wave layer (slower, creates depth) -->
<path fill="${bgFill}" opacity="0.5">
  <animate attributeName="d" dur="${dur}" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" values="
    M0 ${layer1Y} Q${WIDTH * 0.125} ${layer1Y - amplitude * 0.6} ${WIDTH * 0.25} ${layer1Y} Q${WIDTH * 0.375} ${layer1Y + amplitude * 0.6} ${WIDTH * 0.5} ${layer1Y} Q${WIDTH * 0.625} ${layer1Y - amplitude * 0.4} ${WIDTH * 0.75} ${layer1Y} Q${WIDTH * 0.875} ${layer1Y + amplitude * 0.5} ${WIDTH} ${layer1Y} V${height} H0 Z;
    M0 ${layer1Y + amplitude * 0.25} Q${WIDTH * 0.125} ${layer1Y - amplitude * 0.35} ${WIDTH * 0.25} ${layer1Y + amplitude * 0.25} Q${WIDTH * 0.375} ${layer1Y + amplitude * 0.85} ${WIDTH * 0.5} ${layer1Y + amplitude * 0.25} Q${WIDTH * 0.625} ${layer1Y - amplitude * 0.15} ${WIDTH * 0.75} ${layer1Y + amplitude * 0.25} Q${WIDTH * 0.875} ${layer1Y + amplitude * 0.75} ${WIDTH} ${layer1Y + amplitude * 0.25} V${height} H0 Z;
    M0 ${layer1Y - amplitude * 0.15} Q${WIDTH * 0.125} ${layer1Y + amplitude * 0.45} ${WIDTH * 0.25} ${layer1Y - amplitude * 0.15} Q${WIDTH * 0.375} ${layer1Y - amplitude * 0.75} ${WIDTH * 0.5} ${layer1Y - amplitude * 0.15} Q${WIDTH * 0.625} ${layer1Y + amplitude * 0.25} ${WIDTH * 0.75} ${layer1Y - amplitude * 0.15} Q${WIDTH * 0.875} ${layer1Y - amplitude * 0.55} ${WIDTH} ${layer1Y - amplitude * 0.15} V${height} H0 Z;
    M0 ${layer1Y + amplitude * 0.2} Q${WIDTH * 0.125} ${layer1Y - amplitude * 0.4} ${WIDTH * 0.25} ${layer1Y + amplitude * 0.2} Q${WIDTH * 0.375} ${layer1Y + amplitude * 0.6} ${WIDTH * 0.5} ${layer1Y + amplitude * 0.2} Q${WIDTH * 0.625} ${layer1Y - amplitude * 0.5} ${WIDTH * 0.75} ${layer1Y + amplitude * 0.2} Q${WIDTH * 0.875} ${layer1Y + amplitude * 0.4} ${WIDTH} ${layer1Y + amplitude * 0.2} V${height} H0 Z;
    M0 ${layer1Y} Q${WIDTH * 0.125} ${layer1Y - amplitude * 0.6} ${WIDTH * 0.25} ${layer1Y} Q${WIDTH * 0.375} ${layer1Y + amplitude * 0.6} ${WIDTH * 0.5} ${layer1Y} Q${WIDTH * 0.625} ${layer1Y - amplitude * 0.4} ${WIDTH * 0.75} ${layer1Y} Q${WIDTH * 0.875} ${layer1Y + amplitude * 0.5} ${WIDTH} ${layer1Y} V${height} H0 Z"
  />
</path>
<!-- Foreground wave layer (faster, creates parallax depth) -->
<path fill="${bgFill2}" opacity="0.6">
  <animate attributeName="d" dur="${dur}" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" begin="-${layer2Offset}s" values="
    M0 ${layer2Y} Q${WIDTH * 0.125} ${layer2Y - amplitude * 0.5} ${WIDTH * 0.25} ${layer2Y} Q${WIDTH * 0.375} ${layer2Y + amplitude * 0.5} ${WIDTH * 0.5} ${layer2Y} Q${WIDTH * 0.625} ${layer2Y - amplitude * 0.3} ${WIDTH * 0.75} ${layer2Y} Q${WIDTH * 0.875} ${layer2Y + amplitude * 0.4} ${WIDTH} ${layer2Y} V${height} H0 Z;
    M0 ${layer2Y + amplitude * 0.3} Q${WIDTH * 0.125} ${layer2Y - amplitude * 0.2} ${WIDTH * 0.25} ${layer2Y + amplitude * 0.3} Q${WIDTH * 0.375} ${layer2Y + amplitude * 0.8} ${WIDTH * 0.5} ${layer2Y + amplitude * 0.3} Q${WIDTH * 0.625} ${layer2Y} ${WIDTH * 0.75} ${layer2Y + amplitude * 0.3} Q${WIDTH * 0.875} ${layer2Y + amplitude * 0.7} ${WIDTH} ${layer2Y + amplitude * 0.3} V${height} H0 Z;
    M0 ${layer2Y - amplitude * 0.2} Q${WIDTH * 0.125} ${layer2Y + amplitude * 0.4} ${WIDTH * 0.25} ${layer2Y - amplitude * 0.2} Q${WIDTH * 0.375} ${layer2Y - amplitude * 0.6} ${WIDTH * 0.5} ${layer2Y - amplitude * 0.2} Q${WIDTH * 0.625} ${layer2Y + amplitude * 0.2} ${WIDTH * 0.75} ${layer2Y - amplitude * 0.2} Q${WIDTH * 0.875} ${layer2Y - amplitude * 0.4} ${WIDTH} ${layer2Y - amplitude * 0.2} V${height} H0 Z;
    M0 ${layer2Y + amplitude * 0.15} Q${WIDTH * 0.125} ${layer2Y - amplitude * 0.35} ${WIDTH * 0.25} ${layer2Y + amplitude * 0.15} Q${WIDTH * 0.375} ${layer2Y + amplitude * 0.55} ${WIDTH * 0.5} ${layer2Y + amplitude * 0.15} Q${WIDTH * 0.625} ${layer2Y - amplitude * 0.45} ${WIDTH * 0.75} ${layer2Y + amplitude * 0.15} Q${WIDTH * 0.875} ${layer2Y + amplitude * 0.35} ${WIDTH} ${layer2Y + amplitude * 0.15} V${height} H0 Z;
    M0 ${layer2Y} Q${WIDTH * 0.125} ${layer2Y - amplitude * 0.5} ${WIDTH * 0.25} ${layer2Y} Q${WIDTH * 0.375} ${layer2Y + amplitude * 0.5} ${WIDTH * 0.5} ${layer2Y} Q${WIDTH * 0.625} ${layer2Y - amplitude * 0.3} ${WIDTH * 0.75} ${layer2Y} Q${WIDTH * 0.875} ${layer2Y + amplitude * 0.4} ${WIDTH} ${layer2Y} V${height} H0 Z"
  />
</path>`;
      } else {
        shapeMarkup = `
<!-- Background wave layer (slower, creates depth) -->
<path fill="${bgFill}" opacity="0.5">
  <animate attributeName="d" dur="${dur}" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" values="
    M0 0 H${WIDTH} V${height - layer1Y} Q${WIDTH * 0.875} ${height - layer1Y + amplitude * 0.6} ${WIDTH * 0.75} ${height - layer1Y} Q${WIDTH * 0.625} ${height - layer1Y - amplitude * 0.6} ${WIDTH * 0.5} ${height - layer1Y} Q${WIDTH * 0.375} ${height - layer1Y + amplitude * 0.4} ${WIDTH * 0.25} ${height - layer1Y} Q${WIDTH * 0.125} ${height - layer1Y - amplitude * 0.5} 0 ${height - layer1Y} Z;
    M0 0 H${WIDTH} V${height - layer1Y - amplitude * 0.25} Q${WIDTH * 0.875} ${height - layer1Y + amplitude * 0.35} ${WIDTH * 0.75} ${height - layer1Y - amplitude * 0.25} Q${WIDTH * 0.625} ${height - layer1Y - amplitude * 0.85} ${WIDTH * 0.5} ${height - layer1Y - amplitude * 0.25} Q${WIDTH * 0.375} ${height - layer1Y + amplitude * 0.15} ${WIDTH * 0.25} ${height - layer1Y - amplitude * 0.25} Q${WIDTH * 0.125} ${height - layer1Y - amplitude * 0.75} 0 ${height - layer1Y - amplitude * 0.25} Z;
    M0 0 H${WIDTH} V${height - layer1Y + amplitude * 0.15} Q${WIDTH * 0.875} ${height - layer1Y - amplitude * 0.45} ${WIDTH * 0.75} ${height - layer1Y + amplitude * 0.15} Q${WIDTH * 0.625} ${height - layer1Y + amplitude * 0.75} ${WIDTH * 0.5} ${height - layer1Y + amplitude * 0.15} Q${WIDTH * 0.375} ${height - layer1Y - amplitude * 0.25} ${WIDTH * 0.25} ${height - layer1Y + amplitude * 0.15} Q${WIDTH * 0.125} ${height - layer1Y + amplitude * 0.55} 0 ${height - layer1Y + amplitude * 0.15} Z;
    M0 0 H${WIDTH} V${height - layer1Y - amplitude * 0.2} Q${WIDTH * 0.875} ${height - layer1Y + amplitude * 0.4} ${WIDTH * 0.75} ${height - layer1Y - amplitude * 0.2} Q${WIDTH * 0.625} ${height - layer1Y - amplitude * 0.6} ${WIDTH * 0.5} ${height - layer1Y - amplitude * 0.2} Q${WIDTH * 0.375} ${height - layer1Y + amplitude * 0.5} ${WIDTH * 0.25} ${height - layer1Y - amplitude * 0.2} Q${WIDTH * 0.125} ${height - layer1Y - amplitude * 0.4} 0 ${height - layer1Y - amplitude * 0.2} Z;
    M0 0 H${WIDTH} V${height - layer1Y} Q${WIDTH * 0.875} ${height - layer1Y + amplitude * 0.6} ${WIDTH * 0.75} ${height - layer1Y} Q${WIDTH * 0.625} ${height - layer1Y - amplitude * 0.6} ${WIDTH * 0.5} ${height - layer1Y} Q${WIDTH * 0.375} ${height - layer1Y + amplitude * 0.4} ${WIDTH * 0.25} ${height - layer1Y} Q${WIDTH * 0.125} ${height - layer1Y - amplitude * 0.5} 0 ${height - layer1Y} Z"
  />
</path>
<!-- Foreground wave layer (faster, creates parallax depth) -->
<path fill="${bgFill2}" opacity="0.6">
  <animate attributeName="d" dur="${dur}" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" begin="-${layer2Offset}s" values="
    M0 0 H${WIDTH} V${height - layer2Y} Q${WIDTH * 0.875} ${height - layer2Y + amplitude * 0.5} ${WIDTH * 0.75} ${height - layer2Y} Q${WIDTH * 0.625} ${height - layer2Y - amplitude * 0.5} ${WIDTH * 0.5} ${height - layer2Y} Q${WIDTH * 0.375} ${height - layer2Y + amplitude * 0.3} ${WIDTH * 0.25} ${height - layer2Y} Q${WIDTH * 0.125} ${height - layer2Y - amplitude * 0.4} 0 ${height - layer2Y} Z;
    M0 0 H${WIDTH} V${height - layer2Y - amplitude * 0.3} Q${WIDTH * 0.875} ${height - layer2Y + amplitude * 0.2} ${WIDTH * 0.75} ${height - layer2Y - amplitude * 0.3} Q${WIDTH * 0.625} ${height - layer2Y - amplitude * 0.8} ${WIDTH * 0.5} ${height - layer2Y - amplitude * 0.3} Q${WIDTH * 0.375} ${height - layer2Y} ${WIDTH * 0.25} ${height - layer2Y - amplitude * 0.3} Q${WIDTH * 0.125} ${height - layer2Y - amplitude * 0.7} 0 ${height - layer2Y - amplitude * 0.3} Z;
    M0 0 H${WIDTH} V${height - layer2Y + amplitude * 0.2} Q${WIDTH * 0.875} ${height - layer2Y - amplitude * 0.4} ${WIDTH * 0.75} ${height - layer2Y + amplitude * 0.2} Q${WIDTH * 0.625} ${height - layer2Y + amplitude * 0.6} ${WIDTH * 0.5} ${height - layer2Y + amplitude * 0.2} Q${WIDTH * 0.375} ${height - layer2Y - amplitude * 0.2} ${WIDTH * 0.25} ${height - layer2Y + amplitude * 0.2} Q${WIDTH * 0.125} ${height - layer2Y + amplitude * 0.4} 0 ${height - layer2Y + amplitude * 0.2} Z;
    M0 0 H${WIDTH} V${height - layer2Y - amplitude * 0.15} Q${WIDTH * 0.875} ${height - layer2Y + amplitude * 0.35} ${WIDTH * 0.75} ${height - layer2Y - amplitude * 0.15} Q${WIDTH * 0.625} ${height - layer2Y - amplitude * 0.55} ${WIDTH * 0.5} ${height - layer2Y - amplitude * 0.15} Q${WIDTH * 0.375} ${height - layer2Y + amplitude * 0.45} ${WIDTH * 0.25} ${height - layer2Y - amplitude * 0.15} Q${WIDTH * 0.125} ${height - layer2Y - amplitude * 0.35} 0 ${height - layer2Y - amplitude * 0.15} Z;
    M0 0 H${WIDTH} V${height - layer2Y} Q${WIDTH * 0.875} ${height - layer2Y + amplitude * 0.5} ${WIDTH * 0.75} ${height - layer2Y} Q${WIDTH * 0.625} ${height - layer2Y - amplitude * 0.5} ${WIDTH * 0.5} ${height - layer2Y} Q${WIDTH * 0.375} ${height - layer2Y + amplitude * 0.3} ${WIDTH * 0.25} ${height - layer2Y} Q${WIDTH * 0.125} ${height - layer2Y - amplitude * 0.4} 0 ${height - layer2Y} Z"
  />
</path>`;
      }
    } else {
      const useFlipWave = flipWave ? (section === 'header' ? 'footer' : 'header') : section;
      const waveY = Math.round((height * actualWavePosition) / 100);
      const waveVar = Math.round(waveAmplitude * 0.5);
      if (useFlipWave === 'header') {
        shapeMarkup = `<path d="M0 ${waveY} Q${WIDTH / 4} ${waveY - waveVar} ${WIDTH / 2} ${waveY} T${WIDTH} ${waveY} V${height} H0 Z" fill="${bgFill}"/>`;
      } else {
        shapeMarkup = `<path d="M0 0 H${WIDTH} V${height - waveY} Q${(WIDTH * 3) / 4} ${height - waveY + waveVar} ${WIDTH / 2} ${height - waveY} T0 ${height - waveY} Z" fill="${bgFill}"/>`;
      }
    }
  } else if (type === 'wave') {
    const waveHeight = 30;
    if (section === 'header') {
      shapeMarkup = `<path d="M0 ${waveHeight} Q${WIDTH / 4} ${waveHeight + 15} ${WIDTH / 2} ${waveHeight} T${WIDTH} ${waveHeight} V${height} H0 Z" fill="${bgFill}"/>`;
    } else {
      shapeMarkup = `<path d="M0 0 H${WIDTH} V${height - waveHeight} Q${(WIDTH * 3) / 4} ${height - waveHeight - 15} ${WIDTH / 2} ${height - waveHeight} T0 ${height - waveHeight} Z" fill="${bgFill}"/>`;
    }
  } else if (type === 'egg') {
    shapeMarkup = `<ellipse cx="${WIDTH / 2}" cy="${height / 2}" rx="${WIDTH / 2 - 10}" ry="${height / 2 - 5}" fill="${bgFill}"/>`;
  } else if (type === 'shark') {
    if (section === 'header') {
      shapeMarkup = `<path d="M0 ${height} L0 40 Q${WIDTH / 3} 0 ${WIDTH / 2} 40 L${WIDTH} 40 V${height} H0 Z" fill="${bgFill}"/>`;
    } else {
      shapeMarkup = `<path d="M0 0 H${WIDTH} V${height - 40} L${WIDTH / 2} ${height - 40} Q${WIDTH / 3} ${height} 0 ${height - 40} Z" fill="${bgFill}"/>`;
    }
  } else if (type === 'speech') {
    const tailSize = 20;
    if (section === 'header') {
      shapeMarkup = `<path d="M${tailSize} 0 H${WIDTH - tailSize} Q${WIDTH} 0 ${WIDTH} ${tailSize} V${height - tailSize} Q${WIDTH} ${height} ${WIDTH - tailSize} ${height} H${tailSize} Q0 ${height} 0 ${height - tailSize} V${tailSize} Q0 0 ${tailSize} 0 Z" fill="${bgFill}"/>`;
    } else {
      shapeMarkup = `<path d="M${tailSize} 0 H${WIDTH - tailSize} Q${WIDTH} 0 ${WIDTH} ${tailSize} V${height - tailSize} Q${WIDTH} ${height} ${WIDTH - tailSize} ${height} H${WIDTH / 2 + tailSize} L${WIDTH / 2} ${height + tailSize} L${WIDTH / 2 - tailSize} ${height} H${tailSize} Q0 ${height} 0 ${height - tailSize} V${tailSize} Q0 0 ${tailSize} 0 Z" fill="${bgFill}"/>`;
    }
  } else if (type === 'transparent') {
    shapeMarkup = `<rect width="${WIDTH}" height="${height}" fill="transparent"/>`;
  } else if (type === 'blur') {
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
  } else if (animation === 'pulse') {
    keyframes = `@keyframes pulseAnim{0%,100%{opacity:1}50%{opacity:0.7}}`;
    animStyle = 'animation:pulseAnim 2s ease-in-out infinite';
  } else if (animation === 'shimmer') {
    keyframes = `@keyframes shimmerAnim{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`;
    animStyle = 'animation:shimmerAnim 2s linear infinite';
  } else if (animation === 'bounce') {
    keyframes = `@keyframes bounceAnim{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`;
    animStyle = 'animation:bounceAnim 0.5s ease-in-out infinite';
  }
  // NOTE: 'gradient' animation is handled via GIF generation below — no CSS needed.

  /* ── Final SVG ────────────────────────────────────────────────── */
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}">
  <defs>
    ${gradientDef}
    ${gradientDef2}
    ${extraDefs}
    <style>
      ${keyframes}
      .bg-shape{${animStyle}}
      .label{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:${fontSize}px;font-weight:700;fill:#${txtColor};text-anchor:middle;dominant-baseline:middle}
    </style>
  </defs>
  <g class="bg-shape">${shapeMarkup}</g>
  ${text ? `<text class="label" x="${(WIDTH * textAlignX) / 100}" y="${(height * textAlignY) / 100}">${text}</text>` : ''}
</svg>`;

  // Gradient Flow animation: render as an animated GIF so it works on GitHub,
  // which strips CSS animations and SMIL `<animate>` elements from SVGs.
  // Only attempt GIF generation when there are actually two gradient colours.
  // Note: When parallax is enabled, the shapeMarkup contains SMIL <animate> elements
  // that are incompatible with frame-by-frame GIF generation. We need to use a
  // static shape without animations for the GIF frames.
  const hasParallaxAnimation = type === 'waving' && parallax && shapeMarkup.includes('<animate');
  if (animation === 'gradient' && useGradient) {
    try {
      // For parallax waves, we need to generate a static shape for the GIF
      // without the SMIL animations. Extract the static path from the animated markup.
      const staticShapeMarkup = hasParallaxAnimation
        ? shapeMarkup
            .replace(/<animate[\s\S]*?\/>/g, '')
            .replace(/<animateTransform[\s\S]*?\/>/g, '')
        : shapeMarkup;

      const gifBuffer = await generateAnimatedGif(
        {
          shapeMarkup: staticShapeMarkup,
          width: WIDTH,
          height,
          text,
          fontSize,
          txtColor,
          gradDir,
          textAlignX,
          textAlignY,
          extraDefs,
          ...(useGradient2 ? { startColor2: waveColor2, endColor2: waveColorEnd2 } : {}),
        },
        bgColor,
        bgColorEnd,
        3,
        10,
      );
      return new NextResponse(gifBuffer as unknown as Blob, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (error) {
      console.error('Failed to generate GIF, falling back to SVG:', error);
      // Fall back to SVG if GIF generation fails
    }
  }

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
