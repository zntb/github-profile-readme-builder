import { NextRequest, NextResponse } from 'next/server';

import { fetchContributionCalendar } from '@/lib/github';

const themes: Record<
  string,
  {
    bg: string;
    color: string;
    line: string;
    point: string;
    area: string;
    border: string;
  }
> = {
  'tokyo-night': {
    bg: '1a1b27',
    color: '70a5fd',
    line: 'bf91f3',
    point: '70a5fd',
    area: '70a5fd30',
    border: 'e4e2e2',
  },
  dracula: {
    bg: '282a36',
    color: 'ff6e96',
    line: 'bd93f9',
    point: 'ff6e96',
    area: 'ff6e9630',
    border: 'e4e2e2',
  },
  github: {
    bg: 'ffffff',
    color: '24292e',
    line: '2188ff',
    point: '24292e',
    area: '2188ff30',
    border: 'e4e2e2',
  },
  'github-dark': {
    bg: '0d1117',
    color: 'c9d1d9',
    line: '58a6ff',
    point: 'c9d1d9',
    area: '58a6ff30',
    border: '30363d',
  },
  rogue: {
    bg: '172030',
    color: 'a3b09a',
    line: 'b18bb1',
    point: 'a3b09a',
    area: 'b18bb130',
    border: 'e4e2e2',
  },
  merko: {
    bg: '0a0f0b',
    color: 'abd200',
    line: 'b7d364',
    point: 'abd200',
    area: 'abd20030',
    border: 'e4e2e2',
  },
  vue: {
    bg: 'ecf0f1',
    color: '2c3e50',
    line: '41b883',
    point: '2c3e50',
    area: '41b88330',
    border: 'e4e2e2',
  },
  'react-dark': {
    bg: '20232a',
    color: 'ffffff',
    line: '61dafb',
    point: 'ffffff',
    area: '61dafb30',
    border: 'e4e2e2',
  },
  'high-contrast': {
    bg: '000000',
    color: 'ffffff',
    line: '00ff00',
    point: 'ffffff',
    area: '00ff0030',
    border: 'ffffff',
  },
};

function getTheme(themeName: string) {
  return themes[themeName] || themes['tokyo-night'];
}

function generateActivityGraph(
  username: string,
  contributionData: number[],
  theme: {
    bg: string;
    color: string;
    line: string;
    point: string;
    area: string;
    border: string;
  },
  options: { hideBorder: boolean },
) {
  const width = 850;
  const height = 300;
  const graphWidth = width - 100;
  const graphHeight = height - 80;
  const offsetX = 60;
  const offsetY = 40;

  const data = contributionData.slice(-30); // Last 30 days
  const maxValue = Math.max(...data, 1);

  // Generate path
  const points = data.map((value, i) => {
    const x = offsetX + (i / (data.length - 1)) * graphWidth;
    const y = offsetY + graphHeight - (value / maxValue) * graphHeight;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${offsetY + graphHeight} L ${offsetX} ${offsetY + graphHeight} Z`;

  // Generate days labels (last 30 days)
  const today = new Date();
  const dayLabels = [];
  for (let i = 0; i < 30; i += 6) {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - i));
    const label = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const x = offsetX + (i / 29) * graphWidth;
    dayLabels.push(
      `<text x="${x}" y="${offsetY + graphHeight + 25}" class="axis-label" text-anchor="middle">${label}</text>`,
    );
  }

  // Y-axis labels
  const yLabels = [0, Math.ceil(maxValue / 2), maxValue].map((value, i) => {
    const y = offsetY + graphHeight - (i / 2) * graphHeight;
    return `<text x="${offsetX - 10}" y="${y + 4}" class="axis-label" text-anchor="end">${value}</text>`;
  });

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .header { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.color}; }
    .axis-label { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.color}; opacity: 0.7; }
    .area { fill: #${theme.area}; }
    .line { fill: none; stroke: #${theme.line}; stroke-width: 2; }
    .point { fill: #${theme.point}; }
    .grid { stroke: #${theme.color}; stroke-opacity: 0.1; }
  </style>

  <rect x="0.5" y="0.5" rx="10" ry="10" width="${width - 1}" height="${height - 1}" fill="#${theme.bg}" stroke="${options.hideBorder ? 'none' : '#' + theme.border}" stroke-width="${options.hideBorder ? 0 : 1}"/>
  
  <text x="25" y="28" class="header">${username}'s Contribution Graph</text>

  <!-- Grid -->
  ${[0, 0.25, 0.5, 0.75, 1]
    .map((p) => {
      const y = offsetY + graphHeight * (1 - p);
      return `<line x1="${offsetX}" y1="${y}" x2="${offsetX + graphWidth}" y2="${y}" class="grid"/>`;
    })
    .join('')}

  <!-- Area -->
  <path d="${areaPath}" class="area"/>

  <!-- Line -->
  <path d="${linePath}" class="line"/>

  <!-- Points -->
  ${points
    .filter((_, i) => i % 3 === 0)
    .map((p) => `<circle cx="${p.x}" cy="${p.y}" r="4" class="point"/>`)
    .join('')}

  <!-- Axes -->
  ${dayLabels.join('')}
  ${yLabels.join('')}
</svg>
  `.trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const username = searchParams.get('username') || 'github';
  const themeName = searchParams.get('theme') || 'tokyo-night';
  const hideBorder = searchParams.get('hide_border') === 'true';

  let theme = getTheme(themeName);

  if (searchParams.get('bg_color')) {
    theme = { ...theme, bg: searchParams.get('bg_color')!.replace('#', '') };
  }
  if (searchParams.get('color')) {
    theme = { ...theme, color: searchParams.get('color')!.replace('#', '') };
  }
  if (searchParams.get('line')) {
    theme = { ...theme, line: searchParams.get('line')!.replace('#', '') };
  }
  if (searchParams.get('point')) {
    theme = { ...theme, point: searchParams.get('point')!.replace('#', '') };
  }
  if (searchParams.get('area_color')) {
    theme = {
      ...theme,
      area: searchParams.get('area_color')!.replace('#', '') + '30',
    };
  }

  const token = process.env.GITHUB_TOKEN;

  if (token) {
    try {
      const calendar = await fetchContributionCalendar(username, token);

      // Extract daily contributions from the last 30 days
      const allDays: number[] = [];
      for (const week of calendar.weeks) {
        for (const day of week.contributionDays) {
          allDays.push(day.contributionCount);
        }
      }

      const svg = generateActivityGraph(username, allDays, theme, { hideBorder });

      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (error) {
      console.error('Error fetching activity:', error);
      return new NextResponse(
        `<svg width="850" height="120" xmlns="http://www.w3.org/2000/svg">
          <rect width="850" height="120" fill="#${theme.bg}" rx="10"/>
          <text x="425" y="50" text-anchor="middle" fill="#${theme.color}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="14">
            Error fetching activity for @${username}
          </text>
          <text x="425" y="75" text-anchor="middle" fill="#${theme.color}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12" opacity="0.7">
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
        <text x="425" y="45" text-anchor="middle" fill="#${theme.color}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="14" font-weight="600">
          GitHub Token Required
        </text>
        <text x="425" y="70" text-anchor="middle" fill="#${theme.color}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12">
          Set GITHUB_TOKEN environment variable
        </text>
        <text x="425" y="90" text-anchor="middle" fill="#${theme.color}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="11" opacity="0.7">
          to fetch real activity for @${username}
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
