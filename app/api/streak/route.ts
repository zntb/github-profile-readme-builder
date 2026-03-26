import { NextRequest, NextResponse } from 'next/server';

import { calculateStreakStats, fetchContributionCalendar } from '@/lib/github';
import { getStreakTheme, type StreakTheme } from '@/lib/themes';

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
  const width = 495;
  const height = 230;

  const { currentStreak, longestStreak, totalContributions } = streakStats;

  // Column centers
  const leftCX = 82;
  const midCX = 247;
  const rightCX = 412;

  // Ring dimensions - slightly adjusted to be more centered
  const ringCY = 105;
  const ringR = 40;
  const circumference = +(2 * Math.PI * ringR).toFixed(2);
  const progress = longestStreak > 0 ? currentStreak / longestStreak : 0;
  const dashOffset = +(circumference * (1 - progress)).toFixed(2);
  const ringTop = ringCY - ringR; // y=65
  const ringBottom = ringCY + ringR; // y=145

  // Flame icon: 20x20, positioned above ring top
  const flameSize = 20;
  const flameX = midCX - flameSize / 2;
  const flameY = ringTop - flameSize - 8; // Increased gap to 8px

  // Centre column text - increased spacing to prevent overlap
  const currNumY = ringCY + 11; // Centered visually inside ring
  const centLabelY = ringBottom + 28; // Moved further down from ring bottom (was 20)
  const centDateY = centLabelY + 18; // Increased vertical gap between label and date (was 16)

  // Side columns - balanced with the centre column
  const sideNumY = 100;
  const sideLabelY = 125;
  const sideDateY = 148; // Increased spacing for side elements too

  const currentYear = new Date().getFullYear();

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .side-num   { font: 800 22px 'Segoe UI', Ubuntu, Sans-Serif; }
    .curr-num   { font: 800 28px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.currStreak}; }
    .stat-label { font: 600 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; }
    .date-label { font: 400 10px  'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.dates}; }
  </style>

  <rect x="0.5" y="0.5"
    rx="${options.borderRadius}" ry="${options.borderRadius}"
    width="${width - 1}" height="${height - 1}"
    fill="#${theme.bg}"
    stroke="${options.hideBorder ? 'none' : '#' + theme.border}"
    stroke-width="${options.hideBorder ? 0 : 1}"/>

  <line x1="165" y1="15" x2="165" y2="${height - 15}" stroke="#${theme.border}" stroke-width="1" stroke-opacity="0.3"/>
  <line x1="330" y1="15" x2="330" y2="${height - 15}" stroke="#${theme.border}" stroke-width="1" stroke-opacity="0.3"/>

  <!-- Left: Total Contributions -->
  <text x="${leftCX}" y="${sideNumY}"   text-anchor="middle" class="side-num"   fill="#${theme.sideNums}">${totalContributions.toLocaleString()}</text>
  <text x="${leftCX}" y="${sideLabelY}" text-anchor="middle" class="stat-label">Total Contributions</text>
  <text x="${leftCX}" y="${sideDateY}"  text-anchor="middle" class="date-label">Jan 1, ${currentYear} - Present</text>

  <!-- Centre: flame icon -->
  <svg x="${flameX}" y="${flameY}" width="${flameSize}" height="${flameSize}" viewBox="0 0 24 24" fill="none">
    <path d="M12 23a7.5 7.5 0 0 1-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.773.5 1.604.5 2.47A7.5 7.5 0 0 1 12 23z" fill="#${theme.fire}"/>
  </svg>

  <!-- Centre: ring track -->
  <circle cx="${midCX}" cy="${ringCY}" r="${ringR}"
    fill="none" stroke="#${theme.ring}" stroke-width="5" stroke-opacity="0.2"/>

  <!-- Centre: ring progress arc -->
  <circle cx="${midCX}" cy="${ringCY}" r="${ringR}"
    fill="none" stroke="#${theme.ring}" stroke-width="5"
    stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
    stroke-linecap="round"
    transform="rotate(-90 ${midCX} ${ringCY})"/>

  <!-- Centre: streak number (inside ring) -->
  <text x="${midCX}" y="${currNumY}" text-anchor="middle" class="curr-num">${currentStreak}</text>

  <!-- Centre: label and date (below ring, fixed spacing) -->
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
    theme = { ...theme, bg: searchParams.get('background')!.replace('#', '') };
  }
  if (searchParams.get('fire')) {
    theme = { ...theme, fire: searchParams.get('fire')!.replace('#', '') };
  }
  if (searchParams.get('ring')) {
    theme = { ...theme, ring: searchParams.get('ring')!.replace('#', '') };
  }
  if (searchParams.get('currStreakNum')) {
    theme = { ...theme, currStreak: searchParams.get('currStreakNum')!.replace('#', '') };
  }
  if (searchParams.get('sideNums')) {
    theme = { ...theme, sideNums: searchParams.get('sideNums')!.replace('#', '') };
  }
  if (searchParams.get('sideLabels')) {
    theme = { ...theme, sideLabels: searchParams.get('sideLabels')!.replace('#', '') };
  }
  if (searchParams.get('dates')) {
    theme = { ...theme, dates: searchParams.get('dates')!.replace('#', '') };
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
        `<svg width="495" height="120" xmlns="http://www.w3.org/2000/svg">
          <rect width="495" height="120" fill="#${theme.bg}" rx="10"/>
          <text x="247.5" y="50" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="14">
            Error fetching streak for @${username}
          </text>
          <text x="247.5" y="75" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12" opacity="0.7">
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
        <text x="247.5" y="45" text-anchor="middle" fill="#${theme.currStreak}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="14" font-weight="600">
          GitHub Token Required
        </text>
        <text x="247.5" y="70" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12">
          Set GITHUB_TOKEN environment variable
        </text>
        <text x="247.5" y="90" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="11" opacity="0.7">
          to fetch real streak for @${username}
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
