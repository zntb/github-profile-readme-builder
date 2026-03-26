import { NextRequest, NextResponse } from 'next/server';

import { calculateStreakStats, fetchContributionCalendar } from '@/lib/github';

const themes: Record<
  string,
  {
    bg: string;
    text: string;
    fire: string;
    ring: string;
    currStreak: string;
    sideNums: string;
    sideLabels: string;
    dates: string;
    border: string;
  }
> = {
  default: {
    bg: 'fffefe',
    text: '434d58',
    fire: 'f5700c',
    ring: '4c71f2',
    currStreak: '151515',
    sideNums: '434d58',
    sideLabels: '434d58',
    dates: '434d58',
    border: 'e4e2e2',
  },
  dark: {
    bg: '151515',
    text: '9f9f9f',
    fire: 'f5700c',
    ring: '79ff97',
    currStreak: 'fff',
    sideNums: '9f9f9f',
    sideLabels: '9f9f9f',
    dates: '9f9f9f',
    border: 'e4e2e2',
  },
  tokyonight: {
    bg: '1a1b27',
    text: '38bdae',
    fire: 'bf91f3',
    ring: '70a5fd',
    currStreak: '70a5fd',
    sideNums: 'bf91f3',
    sideLabels: '38bdae',
    dates: '38bdae',
    border: 'e4e2e2',
  },
  dracula: {
    bg: '282a36',
    text: 'f8f8f2',
    fire: 'ffb86c',
    ring: 'ff6e96',
    currStreak: 'ff6e96',
    sideNums: 'bd93f9',
    sideLabels: 'f8f8f2',
    dates: 'f8f8f2',
    border: 'e4e2e2',
  },
  radical: {
    bg: '141321',
    text: 'a9fef7',
    fire: 'f8d847',
    ring: 'fe428e',
    currStreak: 'fe428e',
    sideNums: 'f8d847',
    sideLabels: 'a9fef7',
    dates: 'a9fef7',
    border: 'e4e2e2',
  },
  github_dark: {
    bg: '0d1117',
    text: 'c9d1d9',
    fire: 'f5700c',
    ring: '58a6ff',
    currStreak: '58a6ff',
    sideNums: '1f6feb',
    sideLabels: 'c9d1d9',
    dates: 'c9d1d9',
    border: '30363d',
  },
  catppuccin_mocha: {
    bg: '1e1e2e',
    text: 'cdd6f4',
    fire: 'fab387',
    ring: '89b4fa',
    currStreak: '89b4fa',
    sideNums: '94e2d5',
    sideLabels: 'cdd6f4',
    dates: 'cdd6f4',
    border: '313244',
  },
};

function getTheme(themeName: string) {
  return themes[themeName] || themes.default;
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
  username: string,
  streakStats: {
    currentStreak: number;
    longestStreak: number;
    totalContributions: number;
    currentStreakStart: Date | null;
    currentStreakEnd: Date | null;
    longestStreakStart: Date | null;
    longestStreakEnd: Date | null;
  },
  theme: {
    bg: string;
    text: string;
    fire: string;
    ring: string;
    currStreak: string;
    sideNums: string;
    sideLabels: string;
    dates: string;
    border: string;
  },
  options: { hideBorder: boolean; borderRadius: number },
) {
  const width = 495;
  const height = 195;

  const { currentStreak, longestStreak, totalContributions } = streakStats;

  // ── Layout constants ──────────────────────────────────────────────────────
  // Three equal sections separated at x=165 and x=330
  const leftCX = 82; // centre of left section  (0–165)
  const midCX = 247; // centre of middle section (165–330)
  const rightCX = 413; // centre of right section  (330–495)

  // Ring geometry (centre section)
  const ringCY = 91;
  const ringR = 38;
  const circumference = +(2 * Math.PI * ringR).toFixed(2);
  const progress = longestStreak > 0 ? currentStreak / longestStreak : 0;
  const dashOffset = +(circumference * (1 - progress)).toFixed(2);

  // Flame icon positioned just above the ring with a small gap
  const flameSize = 20;
  const flameX = midCX - flameSize / 2;
  const flameY = ringCY - ringR - flameSize - 4; // 4 px gap between flame bottom and ring top

  // Text positions relative to ring bottom
  const ringBottom = ringCY + ringR;
  const labelY = ringBottom + 18;
  const dateY = ringBottom + 33;

  // Side-section text positions (vertically centred in the card)
  const sideNumY = 72;
  const sideLabelY = 92;
  const sideDateY = 108;

  const currentYear = new Date().getFullYear();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _username = username; // kept for future use (e.g. title text)

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .side-num   { font: 800 22px 'Segoe UI', Ubuntu, Sans-Serif; }
    .curr-num   { font: 800 28px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.currStreak}; }
    .stat-label { font: 600 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; }
    .date-label { font: 400 10px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.dates}; }
  </style>

  <!-- Background -->
  <rect x="0.5" y="0.5"
    rx="${options.borderRadius}" ry="${options.borderRadius}"
    width="${width - 1}" height="${height - 1}"
    fill="#${theme.bg}"
    stroke="${options.hideBorder ? 'none' : '#' + theme.border}"
    stroke-width="${options.hideBorder ? 0 : 1}"/>

  <!-- Section dividers -->
  <line x1="165" y1="12"  x2="165" y2="183" stroke="#${theme.border}" stroke-width="1" stroke-opacity="0.5"/>
  <line x1="330" y1="12"  x2="330" y2="183" stroke="#${theme.border}" stroke-width="1" stroke-opacity="0.5"/>

  <!-- ── LEFT: Total Contributions ── -->
  <text x="${leftCX}" y="${sideNumY}"   text-anchor="middle" class="side-num"   fill="#${theme.sideNums}">${totalContributions.toLocaleString()}</text>
  <text x="${leftCX}" y="${sideLabelY}" text-anchor="middle" class="stat-label">Total Contributions</text>
  <text x="${leftCX}" y="${sideDateY}"  text-anchor="middle" class="date-label">Jan 1, ${currentYear} - Present</text>

  <!-- ── CENTRE: Current Streak ── -->

  <!-- Flame icon (centred above ring) -->
  <svg x="${flameX}" y="${flameY}" width="${flameSize}" height="${flameSize}" viewBox="0 0 24 24" fill="none">
    <path d="M12 23a7.5 7.5 0 0 1-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.773.5 1.604.5 2.47A7.5 7.5 0 0 1 12 23z" fill="#${theme.fire}"/>
  </svg>

  <!-- Ring: dim background track -->
  <circle
    cx="${midCX}" cy="${ringCY}" r="${ringR}"
    fill="none"
    stroke="#${theme.ring}" stroke-width="5" stroke-opacity="0.2"/>

  <!-- Ring: progress arc -->
  <circle
    cx="${midCX}" cy="${ringCY}" r="${ringR}"
    fill="none"
    stroke="#${theme.ring}" stroke-width="5"
    stroke-dasharray="${circumference}"
    stroke-dashoffset="${dashOffset}"
    stroke-linecap="round"
    transform="rotate(-90 ${midCX} ${ringCY})"/>

  <!-- Current streak number (inside ring) -->
  <text x="${midCX}" y="${ringCY + 10}" text-anchor="middle" class="curr-num">${currentStreak}</text>

  <!-- Label and date BELOW the ring -->
  <text x="${midCX}" y="${labelY}" text-anchor="middle" class="stat-label">Current Streak</text>
  <text x="${midCX}" y="${dateY}"  text-anchor="middle" class="date-label">${formatDate(streakStats.currentStreakStart)} - ${formatDate(streakStats.currentStreakEnd)}</text>

  <!-- ── RIGHT: Longest Streak ── -->
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

  let theme = getTheme(themeName);

  // Override colours if provided
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

      const svg = generateStreakSvg(username, streakStats, theme, { hideBorder, borderRadius });

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
