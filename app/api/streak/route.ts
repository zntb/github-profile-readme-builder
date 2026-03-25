import { NextRequest, NextResponse } from 'next/server';

import { fetchContributionCalendar, calculateStreakStats } from '@/lib/github';

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

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; }
    .stat-value { font: 800 28px 'Segoe UI', Ubuntu, Sans-Serif; }
    .stat-label { font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; }
    .date-range { font: 400 10px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.dates}; }
  </style>

  <rect x="0.5" y="0.5" rx="${options.borderRadius}" ry="${options.borderRadius}" width="${width - 1}" height="${height - 1}" fill="#${theme.bg}" stroke="${options.hideBorder ? 'none' : '#' + theme.border}" stroke-width="${options.hideBorder ? 0 : 1}"/>

  <!-- Total Contributions -->
  <g transform="translate(50, 50)">
    <text class="stat-value" fill="#${theme.sideNums}" text-anchor="middle" x="45" y="30">${totalContributions.toLocaleString()}</text>
    <text class="stat-label" text-anchor="middle" x="45" y="50">Total Contributions</text>
    <text class="date-range" text-anchor="middle" x="45" y="68">Jan 1, ${new Date().getFullYear()} - Present</text>
  </g>

  <!-- Current Streak -->
  <g transform="translate(200, 35)">
    <svg x="25" y="-5" width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path d="M12 23a7.5 7.5 0 0 1-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.773.5 1.604.5 2.47A7.5 7.5 0 0 1 12 23z" fill="#${theme.fire}"/>
    </svg>
    <text class="stat-value" fill="#${theme.currStreak}" text-anchor="middle" x="45" y="65">${currentStreak}</text>
    <text class="stat-label" text-anchor="middle" x="45" y="85">Current Streak</text>
    <text class="date-range" text-anchor="middle" x="45" y="103">${formatDate(streakStats.currentStreakStart)} - ${formatDate(streakStats.currentStreakEnd)}</text>
    
    <!-- Ring -->
    <circle cx="45" cy="52" r="45" stroke="#${theme.ring}" stroke-width="5" fill="none" stroke-opacity="0.2"/>
    <circle cx="45" cy="52" r="45" stroke="#${theme.ring}" stroke-width="5" fill="none" stroke-dasharray="283" stroke-dashoffset="${longestStreak > 0 ? 283 - (currentStreak / longestStreak) * 283 : 283}" transform="rotate(-90 45 52)"/>
  </g>

  <!-- Longest Streak -->
  <g transform="translate(360, 50)">
    <text class="stat-value" fill="#${theme.sideNums}" text-anchor="middle" x="45" y="30">${longestStreak}</text>
    <text class="stat-label" text-anchor="middle" x="45" y="50">Longest Streak</text>
    <text class="date-range" text-anchor="middle" x="45" y="68">${formatDate(streakStats.longestStreakStart)} - ${formatDate(streakStats.longestStreakEnd)}</text>
  </g>
</svg>
  `.trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const username = searchParams.get('username') || 'github';
  const themeName = searchParams.get('theme') || 'default';
  const hideBorder = searchParams.get('hide_border') === 'true';
  const borderRadius = parseInt(searchParams.get('border_radius') || '10');

  let theme = getTheme(themeName);

  // Override colors if provided
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
    theme = {
      ...theme,
      currStreak: searchParams.get('currStreakNum')!.replace('#', ''),
    };
  }
  if (searchParams.get('sideNums')) {
    theme = { ...theme, sideNums: searchParams.get('sideNums')!.replace('#', '') };
  }
  if (searchParams.get('sideLabels')) {
    theme = {
      ...theme,
      sideLabels: searchParams.get('sideLabels')!.replace('#', ''),
    };
  }
  if (searchParams.get('dates')) {
    theme = { ...theme, dates: searchParams.get('dates')!.replace('#', '') };
  }

  const token = process.env.GITHUB_TOKEN;

  if (token) {
    try {
      const calendar = await fetchContributionCalendar(username, token);
      const streakStats = calculateStreakStats(calendar);

      const svg = generateStreakSvg(username, streakStats, theme, {
        hideBorder,
        borderRadius,
      });

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
