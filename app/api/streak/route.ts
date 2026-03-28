import { NextRequest, NextResponse } from 'next/server';

import { calculateStreakStats, fetchContributionCalendar } from '@/lib/github';
import { getStreakTheme, type StreakTheme } from '@/lib/themes';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isValidHexColor(color: string): boolean {
  return /^[0-9A-Fa-f]{6}$/.test(color);
}

function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function generateStreakSvg(
  streakStats: {
    currentStreak: number;
    longestStreak: number;
    totalContributions: number;
    currentStreakStart: Date | null;
    currentStreakEnd: Date | null;
    longestStreakStart: Date | null;
    longestStreakEnd: Date | null;
  },
  theme: StreakTheme,
  options: { hideBorder: boolean; borderRadius: number },
) {
  // 495 px is the maximum image width GitHub renders in a README.
  const width = 495;
  const height = 195;

  // Three equal columns ─────────────────────────────────────────────────────
  const divider1X = Math.round(width / 3); // 165
  const divider2X = Math.round((width * 2) / 3); // 330
  const leftCX = Math.round(divider1X / 2); // 83
  const midCX = Math.round((divider1X + divider2X) / 2); // 248
  const rightCX = Math.round((divider2X + width) / 2); // 413

  // Ring geometry ────────────────────────────────────────────────────────────
  const ringCY = 92;
  const ringR = 40;
  const circumference = +(2 * Math.PI * ringR).toFixed(2);

  const { currentStreak, longestStreak, totalContributions } = streakStats;
  const progress = longestStreak > 0 ? currentStreak / longestStreak : 0;
  const dashOffset = +(circumference * (1 - progress)).toFixed(2);

  // Flame icon – sits immediately above the ring ─────────────────────────────
  const flameSize = 20;
  const flameGap = 6;
  const flameX = midCX - flameSize / 2;
  const flameY = ringCY - ringR - flameGap - flameSize; // top edge of icon

  // Centre-column text baselines ────────────────────────────────────────────
  const centerNumY = ringCY + 10; // inside ring
  const centerLabelY = ringCY + ringR + 24; // "Current Streak"
  const centerDateY = centerLabelY + 18; // date range

  // Side-column text baselines – vertically centred across the same span ────
  // Content band: from top of flame to bottom of date text
  const contentTop = flameY;
  const contentBottom = centerDateY + 4; // +4 for descenders
  // side block height: num(28) + gap(10) + label(13) + gap(8) + date(11) = 70
  const sideBlockH = 70;
  const sideNumY = Math.round(contentTop + (contentBottom - contentTop - sideBlockH) / 2) + 28;
  const sideLabelY = sideNumY + 23; // gap(10) + font-size(13)
  const sideDateY = sideLabelY + 19; // gap(8)  + font-size(11)

  // Divider extent – aligned with the content band
  const divTop = Math.max(14, contentTop - 4);
  const divBottom = Math.min(height - 14, contentBottom + 4);

  const currentYear = new Date().getFullYear();

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .side-num   { font: 800 28px 'Segoe UI', Ubuntu, Sans-Serif; }
    .curr-num   { font: 800 28px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.currStreak}; }
    .stat-label { font: 600 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; }
    .date-label { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.dates}; }
  </style>

  <!-- Card background -->
  <rect x="0.5" y="0.5"
    rx="${options.borderRadius}" ry="${options.borderRadius}"
    width="${width - 1}" height="${height - 1}"
    fill="#${theme.bg}"
    stroke="${options.hideBorder ? 'none' : '#' + theme.border}"
    stroke-width="${options.hideBorder ? 0 : 1}"/>

  <!-- Column dividers -->
  <line x1="${divider1X}" y1="${divTop}" x2="${divider1X}" y2="${divBottom}"
    stroke="#${theme.border}" stroke-width="1" stroke-opacity="0.4"/>
  <line x1="${divider2X}" y1="${divTop}" x2="${divider2X}" y2="${divBottom}"
    stroke="#${theme.border}" stroke-width="1" stroke-opacity="0.4"/>

  <!-- ── Left column: Total Contributions ─────────────────────────────── -->
  <text x="${leftCX}" y="${sideNumY}"
    text-anchor="middle" class="side-num" fill="#${theme.sideNums}">${totalContributions.toLocaleString()}</text>
  <text x="${leftCX}" y="${sideLabelY}"
    text-anchor="middle" class="stat-label">Total Contributions</text>
  <text x="${leftCX}" y="${sideDateY}"
    text-anchor="middle" class="date-label">Jan 1, ${currentYear} &#8211; Present</text>

  <!-- ── Centre column ─────────────────────────────────────────────────── -->

  <!-- Flame icon -->
  <svg x="${flameX}" y="${flameY}" width="${flameSize}" height="${flameSize}" viewBox="0 0 24 24">
    <path d="M12 23a7.5 7.5 0 0 1-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5
             c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.773.5 1.604.5 2.47A7.5 7.5 0 0 1 12 23z"
      fill="#${theme.fire}"/>
  </svg>

  <!-- Ring track (dimmed) -->
  <circle cx="${midCX}" cy="${ringCY}" r="${ringR}"
    fill="none" stroke="#${theme.ring}" stroke-width="5" stroke-opacity="0.2"/>

  <!-- Ring progress arc -->
  <circle cx="${midCX}" cy="${ringCY}" r="${ringR}"
    fill="none" stroke="#${theme.ring}" stroke-width="5"
    stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
    stroke-linecap="round"
    transform="rotate(-90 ${midCX} ${ringCY})"/>

  <!-- Streak number (inside ring) -->
  <text x="${midCX}" y="${centerNumY}"
    text-anchor="middle" class="curr-num">${currentStreak}</text>

  <!-- "Current Streak" label and date range -->
  <text x="${midCX}" y="${centerLabelY}"
    text-anchor="middle" class="stat-label">Current Streak</text>
  <text x="${midCX}" y="${centerDateY}"
    text-anchor="middle" class="date-label">${formatDate(streakStats.currentStreakStart)} &#8211; ${formatDate(streakStats.currentStreakEnd)}</text>

  <!-- ── Right column: Longest Streak ──────────────────────────────────── -->
  <text x="${rightCX}" y="${sideNumY}"
    text-anchor="middle" class="side-num" fill="#${theme.sideNums}">${longestStreak}</text>
  <text x="${rightCX}" y="${sideLabelY}"
    text-anchor="middle" class="stat-label">Longest Streak</text>
  <text x="${rightCX}" y="${sideDateY}"
    text-anchor="middle" class="date-label">${formatDate(streakStats.longestStreakStart)} &#8211; ${formatDate(streakStats.longestStreakEnd)}</text>
</svg>`.trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const username = searchParams.get('username') || 'github';
  const themeName = searchParams.get('theme') || 'default';
  const hideBorder = searchParams.get('hide_border') === 'true';
  const borderRadius = parseInt(searchParams.get('border_radius') || '10');

  let theme = getStreakTheme(themeName);

  // Allow individual colour overrides via query params
  const colourOverrides: Partial<StreakTheme> = {};
  const tryColour = (param: string, key: keyof StreakTheme) => {
    const raw = searchParams.get(param)?.replace('#', '') ?? '';
    if (isValidHexColor(raw)) colourOverrides[key] = raw;
  };

  tryColour('background', 'bg');
  tryColour('fire', 'fire');
  tryColour('ring', 'ring');
  tryColour('currStreakNum', 'currStreak');
  tryColour('sideNums', 'sideNums');
  tryColour('sideLabels', 'sideLabels');
  tryColour('dates', 'dates');

  if (Object.keys(colourOverrides).length > 0) {
    theme = { ...theme, ...colourOverrides };
  }

  const token = process.env.GITHUB_TOKEN;

  if (token) {
    try {
      const calendar = await fetchContributionCalendar(username, token);
      const streakStats = calculateStreakStats(calendar);
      const svg = generateStreakSvg(streakStats, theme, { hideBorder, borderRadius });

      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch {
      return new NextResponse(
        `<svg width="495" height="120" xmlns="http://www.w3.org/2000/svg">
          <rect width="495" height="120" fill="#${theme.bg}" rx="10"/>
          <text x="247.5" y="50" text-anchor="middle" fill="#${theme.text}"
            font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="14">
            Error fetching streak for @${escapeXml(username)}
          </text>
          <text x="247.5" y="75" text-anchor="middle" fill="#${theme.text}"
            font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12" opacity="0.7">
            User may not exist or API rate limit exceeded
          </text>
        </svg>`,
        {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=300',
          },
        },
      );
    }
  } else {
    return new NextResponse(
      `<svg width="495" height="120" xmlns="http://www.w3.org/2000/svg">
        <rect width="495" height="120" fill="#${theme.bg}" rx="10" stroke="#${theme.border}"/>
        <text x="247.5" y="45" text-anchor="middle" fill="#${theme.currStreak}"
          font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="14" font-weight="600">
          GitHub Token Required
        </text>
        <text x="247.5" y="70" text-anchor="middle" fill="#${theme.text}"
          font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12">
          Set GITHUB_TOKEN environment variable
        </text>
        <text x="247.5" y="90" text-anchor="middle" fill="#${theme.text}"
          font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="11" opacity="0.7">
          to fetch real streak for @${escapeXml(username)}
        </text>
      </svg>`,
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=60',
        },
      },
    );
  }
}
