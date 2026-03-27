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
  // We use a virtual width of 1000 for internal calculations.
  // The SVG will scale this 1000 units to 100% of the container width.
  const width = 1000;
  const height = 230;

  // Proportional column centers based on 1000px width
  const divider1X = 333;
  const divider2X = 666;
  const leftCX = 167;
  const midCX = 500;
  const rightCX = 833;

  // Ring/Flame settings (Centered in the 1000px coordinate system)
  const ringCY = 105;
  const ringR = 40;
  const circumference = +(2 * Math.PI * ringR).toFixed(2);
  const { currentStreak, longestStreak, totalContributions } = streakStats;
  const progress = longestStreak > 0 ? currentStreak / longestStreak : 0;
  const dashOffset = +(circumference * (1 - progress)).toFixed(2);

  const flameSize = 24;
  const flameX = midCX - flameSize / 2;
  const flameY = ringCY - ringR - flameSize - 10;

  // Vertical text positions
  const currNumY = ringCY + 11;
  const centLabelY = ringCY + ringR + 30;
  const centDateY = centLabelY + 20;

  const sideNumY = 100;
  const sideLabelY = 125;
  const sideDateY = 148;

  const currentYear = new Date().getFullYear();

  // Note: width="100%" and a viewBox allows it to expand to fill the GitHub container.
  return `<svg width="100%" height="auto" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
  <style>
    .side-num   { font: 800 28px 'Segoe UI', Ubuntu, Sans-Serif; }
    .curr-num   { font: 800 32px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.currStreak}; }
    .stat-label { font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; }
    .date-label { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.dates}; }
  </style>

  <rect x="0.5" y="0.5"
    rx="${options.borderRadius}" ry="${options.borderRadius}"
    width="${width - 1}" height="${height - 1}"
    fill="#${theme.bg}"
    stroke="${options.hideBorder ? 'none' : '#' + theme.border}"
    stroke-width="${options.hideBorder ? 0 : 1}"/>

  <!-- Dividers -->
  <line x1="${divider1X}" y1="25" x2="${divider1X}" y2="${height - 25}" stroke="#${theme.border}" stroke-width="1" stroke-opacity="0.3"/>
  <line x1="${divider2X}" y1="25" x2="${divider2X}" y2="${height - 25}" stroke="#${theme.border}" stroke-width="1" stroke-opacity="0.3"/>

  <!-- Left: Total Contributions -->
  <text x="${leftCX}" y="${sideNumY}"   text-anchor="middle" class="side-num"   fill="#${theme.sideNums}">${totalContributions.toLocaleString()}</text>
  <text x="${leftCX}" y="${sideLabelY}" text-anchor="middle" class="stat-label">Total Contributions</text>
  <text x="${leftCX}" y="${sideDateY}"  text-anchor="middle" class="date-label">Jan 1, ${currentYear} - Present</text>

  <!-- Centre: Flame -->
  <svg x="${flameX}" y="${flameY}" width="${flameSize}" height="${flameSize}" viewBox="0 0 24 24" fill="none">
    <path d="M12 23a7.5 7.5 0 0 1-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.773.5 1.604.5 2.47A7.5 7.5 0 0 1 12 23z" fill="#${theme.fire}"/>
  </svg>

  <!-- Centre: Ring track -->
  <circle cx="${midCX}" cy="${ringCY}" r="${ringR}"
    fill="none" stroke="#${theme.ring}" stroke-width="5" stroke-opacity="0.2"/>

  <!-- Centre: Ring progress arc -->
  <circle cx="${midCX}" cy="${ringCY}" r="${ringR}"
    fill="none" stroke="#${theme.ring}" stroke-width="5"
    stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
    stroke-linecap="round"
    transform="rotate(-90 ${midCX} ${ringCY})"/>

  <!-- Centre: Streak number (inside ring) -->
  <text x="${midCX}" y="${currNumY}" text-anchor="middle" class="curr-num">${currentStreak}</text>

  <!-- Centre: label and date (below ring) -->
  <text x="${midCX}" y="${centLabelY}" text-anchor="middle" class="stat-label">Current Streak</text>
  <text x="${midCX}" y="${centDateY}"  text-anchor="middle" class="date-label">${formatDate(streakStats.currentStreakStart)} - ${formatDate(streakStats.currentStreakEnd)}</text>

  <!-- Right: Longest Streak -->
  <text x="${rightCX}" y="${sideNumY}"   text-anchor="middle" class="side-num"   fill="#${theme.sideNums}">${longestStreak}</text>
  <text x="${rightCX}" y="${sideLabelY}" text-anchor="middle" class="stat-label">Longest Streak</text>
  <text x="${rightCX}" y="${sideDateY}"  text-anchor="middle" class="date-label">${formatDate(streakStats.longestStreakStart)} - ${formatDate(streakStats.longestStreakEnd)}</text>
</svg>`.trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const username = searchParams.get('username') || 'github';
  const themeName = searchParams.get('theme') || 'default';
  const hideBorder = searchParams.get('hide_border') === 'true';
  const borderRadius = parseInt(searchParams.get('border_radius') || '10');

  let theme = getStreakTheme(themeName);

  if (searchParams.get('background')) {
    const bgColor = searchParams.get('background')!.replace('#', '');
    if (isValidHexColor(bgColor)) {
      theme = { ...theme, bg: bgColor };
    }
  }
  if (searchParams.get('fire')) {
    const fireColor = searchParams.get('fire')!.replace('#', '');
    if (isValidHexColor(fireColor)) {
      theme = { ...theme, fire: fireColor };
    }
  }
  if (searchParams.get('ring')) {
    const ringColor = searchParams.get('ring')!.replace('#', '');
    if (isValidHexColor(ringColor)) {
      theme = { ...theme, ring: ringColor };
    }
  }
  if (searchParams.get('currStreakNum')) {
    const currStreakColor = searchParams.get('currStreakNum')!.replace('#', '');
    if (isValidHexColor(currStreakColor)) {
      theme = { ...theme, currStreak: currStreakColor };
    }
  }
  if (searchParams.get('sideNums')) {
    const sideNumsColor = searchParams.get('sideNums')!.replace('#', '');
    if (isValidHexColor(sideNumsColor)) {
      theme = { ...theme, sideNums: sideNumsColor };
    }
  }
  if (searchParams.get('sideLabels')) {
    const sideLabelsColor = searchParams.get('sideLabels')!.replace('#', '');
    if (isValidHexColor(sideLabelsColor)) {
      theme = { ...theme, sideLabels: sideLabelsColor };
    }
  }
  if (searchParams.get('dates')) {
    const datesColor = searchParams.get('dates')!.replace('#', '');
    if (isValidHexColor(datesColor)) {
      theme = { ...theme, dates: datesColor };
    }
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
    } catch (error) {
      console.error('Error fetching streak stats:', error);
      return new NextResponse(
        `<svg width="850" height="120" xmlns="http://www.w3.org/2000/svg">
          <rect width="850" height="120" fill="#${theme.bg}" rx="10"/>
          <text x="425" y="50" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="14">
            Error fetching streak for @${escapeXml(username)}
          </text>
          <text x="425" y="75" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12" opacity="0.7">
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
      `<svg width="850" height="120" xmlns="http://www.w3.org/2000/svg">
        <rect width="850" height="120" fill="#${theme.bg}" rx="10" stroke="#${theme.border}"/>
        <text x="425" y="45" text-anchor="middle" fill="#${theme.currStreak}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="14" font-weight="600">
          GitHub Token Required
        </text>
        <text x="425" y="70" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12">
          Set GITHUB_TOKEN environment variable
        </text>
        <text x="425" y="90" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="11" opacity="0.7">
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
