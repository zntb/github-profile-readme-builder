import { NextRequest, NextResponse } from 'next/server';

import { calculateRank, fetchUserStats, type GitHubStats } from '@/lib/github';
import { getStatsTheme } from '@/lib/themes';

function generateStatsSvg(
  username: string,
  stats: GitHubStats,
  rank: string,
  theme: { bg: string; title: string; text: string; icon: string; border: string },
  options: {
    showIcons: boolean;
    hideBorder: boolean;
    hideTitle: boolean;
    hideRank: boolean;
    borderRadius: number;
  },
): string {
  const width = 350;
  const height = 145;

  // GitHub icon paths for different stats
  const icons = {
    stars:
      '<path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>',
    commits:
      '<path d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"/>',
    prs: '<path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>',
    issues:
      '<path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/><path fill-rule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/>',
    contributed:
      '<path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>',
    forks:
      '<path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>',
  };

  const iconSvg = (x: number, y: number, path: string, delay: number = 0): string =>
    options.showIcons
      ? `<svg x="${x}" y="${y}" width="16" height="16" viewBox="0 0 16 16" fill="#${theme.icon}" class="icon" style="animation-delay: ${delay}ms">${path}</svg>`
      : '';

  // Calculate rank percentage for the circular progress
  const getRankProgress = (rankStr: string): number => {
    const rankMatch = rankStr.match(/(\d+)/);
    if (rankMatch) {
      const rankNum = parseInt(rankMatch[1], 10);
      // Higher rank number = higher percentage (max 99)
      return (Math.min(99, Math.max(1, 100 - rankNum)) / 100) * 188.4;
    }
    return 50;
  };

  const rankProgress = getRankProgress(rank);

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#${theme.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#${theme.bg};stop-opacity:0.95" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    .header {
      font: 600 18px 'Inter', 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.title};
      animation: fadeInSlide 0.8s ease-out forwards;
      opacity: 0;
    }
    .stat {
      font: 500 11px 'Inter', 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.text};
    }
    .stat-value {
      font: 700 13px 'Inter', 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.title};
    }
    .stagger-1 { opacity: 0; animation: fadeInSlide 0.4s ease-out forwards; animation-delay: 0.1s; }
    .stagger-2 { opacity: 0; animation: fadeInSlide 0.4s ease-out forwards; animation-delay: 0.2s; }
    .stagger-3 { opacity: 0; animation: fadeInSlide 0.4s ease-out forwards; animation-delay: 0.3s; }
    .stagger-4 { opacity: 0; animation: fadeInSlide 0.4s ease-out forwards; animation-delay: 0.4s; }
    .stagger-5 { opacity: 0; animation: fadeInSlide 0.4s ease-out forwards; animation-delay: 0.5s; }
    .rank-text {
      font: 700 14px 'Inter', 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.icon};
    }
    .rank-label {
      font: 500 8px 'Inter', 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.text};
      opacity: 0.7;
    }
    .rank-circle {
      stroke: #${theme.icon};
      fill: none;
      stroke-width: 6;
      stroke-linecap: round;
      animation: rankProgress 1.5s ease-out forwards;
      stroke-dashoffset: 188.4;
    }
    .rank-circle-inner {
      stroke: #${theme.icon};
      stroke-opacity: 0.15;
      fill: none;
      stroke-width: 6;
    }
    @keyframes fadeInSlide {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes rankProgress {
      from { stroke-dashoffset: 188.4; }
      to { stroke-dashoffset: ${188.4 - rankProgress}; }
    }
    .icon {
      animation: iconPop 0.3s ease-out forwards;
      opacity: 0;
      transform-origin: center;
    }
    @keyframes iconPop {
      from {
        opacity: 0;
        transform: scale(0.5);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    .hover-highlight:hover {
      opacity: 0.8;
    }
  </style>

  <rect x="0.5" y="0.5" rx="${options.borderRadius}" ry="${options.borderRadius}" width="${width - 1}" height="${height - 1}" fill="url(#cardGradient)" stroke="${options.hideBorder ? 'none' : '#' + theme.border}" stroke-width="${options.hideBorder ? 0 : 1}" class="hover-highlight"/>

  ${!options.hideTitle ? `<text x="25" y="28" class="header">${username}'s GitHub Stats</text>` : ''}

  <!-- Stats Row 1: Stars & Commits -->
  <g transform="translate(20, ${options.hideTitle ? 30 : 45})">
    ${iconSvg(0, -2, icons.stars, 100)}
    <text class="stat stagger-1" x="${options.showIcons ? 20 : 0}" y="12">Stars:</text>
    <text class="stat-value stagger-1" x="65" y="12">${stats.totalStars.toLocaleString()}</text>
  </g>

  <g transform="translate(135, ${options.hideTitle ? 30 : 45})">
    ${iconSvg(0, -2, icons.commits, 200)}
    <text class="stat stagger-2" x="${options.showIcons ? 20 : 0}" y="12">Commits:</text>
    <text class="stat-value stagger-2" x="75" y="12">${stats.totalCommits.toLocaleString()}</text>
  </g>

  <!-- Stats Row 2: PRs & Issues -->
  <g transform="translate(20, ${options.hideTitle ? 65 : 80})">
    ${iconSvg(0, -2, icons.prs, 300)}
    <text class="stat stagger-3" x="${options.showIcons ? 20 : 0}" y="12">PRs:</text>
    <text class="stat-value stagger-3" x="65" y="12">${stats.totalPRs.toLocaleString()}</text>
  </g>

  <g transform="translate(135, ${options.hideTitle ? 65 : 80})">
    ${iconSvg(0, -2, icons.issues, 400)}
    <text class="stat stagger-4" x="${options.showIcons ? 20 : 0}" y="12">Issues:</text>
    <text class="stat-value stagger-4" x="70" y="12">${stats.totalIssues.toLocaleString()}</text>
  </g>

  <!-- Stats Row 3: Contributed to -->
  <g transform="translate(20, ${options.hideTitle ? 100 : 115})">
    ${iconSvg(0, -2, icons.contributed, 500)}
    <text class="stat stagger-5" x="${options.showIcons ? 20 : 0}" y="12">Contrib:</text>
    <text class="stat-value stagger-5" x="70" y="12">${stats.contributedTo.toLocaleString()}</text>
  </g>

  ${
    !options.hideRank
      ? `
  <g transform="translate(285, ${options.hideTitle ? 45 : 60})" class="rank-group">
    <circle class="rank-circle-inner" cx="0" cy="0" r="24"/>
    <circle class="rank-circle" cx="0" cy="0" r="24" stroke-dasharray="150.8" transform="rotate(-90)"/>
    <text x="0" y="4" text-anchor="middle" class="rank-text">${rank}</text>
    <text x="0" y="14" text-anchor="middle" class="rank-label">RANK</text>
  </g>
  `
      : ''
  }
</svg>
  `.trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const username = searchParams.get('username') || 'github';
  const themeName = searchParams.get('theme') || 'default';
  const showIcons = searchParams.get('show_icons') !== 'false';
  const hideBorder = searchParams.get('hide_border') === 'true';
  const hideTitle = searchParams.get('hide_title') === 'true';
  const hideRank = searchParams.get('hide_rank') === 'true';
  const borderRadius = parseInt(searchParams.get('border_radius') || '10', 10);

  const theme = getStatsTheme(themeName);

  // Override theme colors if provided
  if (searchParams.get('bg_color')) {
    theme.bg = searchParams.get('bg_color')!.replace('#', '');
  }
  if (searchParams.get('text_color')) {
    theme.text = searchParams.get('text_color')!.replace('#', '');
  }
  if (searchParams.get('title_color')) {
    theme.title = searchParams.get('title_color')!.replace('#', '');
  }
  if (searchParams.get('icon_color')) {
    theme.icon = searchParams.get('icon_color')!.replace('#', '');
  }

  const token = process.env.GITHUB_TOKEN;

  console.log('[Stats API] Token exists:', !!token);
  console.log('[Stats API] Username:', username);

  let stats: GitHubStats;
  let rank: string;

  if (token) {
    try {
      console.log('[Stats API] Fetching stats for:', username);
      stats = await fetchUserStats(username, token);
      rank = calculateRank(stats);
      console.log('[Stats API] Stats fetched successfully:', JSON.stringify(stats));
    } catch (error) {
      console.error('[Stats API] Error fetching GitHub stats:', error);
      // Return error SVG
      return new NextResponse(
        `<svg width="350" height="80" xmlns="http://www.w3.org/2000/svg">
          <rect width="350" height="80" fill="#${theme.bg}" rx="10"/>
          <text x="175" y="35" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12">
            Error fetching stats for @${username}
          </text>
          <text x="175" y="55" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="10" opacity="0.7">
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
    // No token - return message asking to set up token
    return new NextResponse(
      `<svg width="330" height="80" xmlns="http://www.w3.org/2000/svg">
        <rect width="330" height="80" fill="#${theme.bg}" rx="10" stroke="#${theme.border}"/>
        <text x="165" y="30" text-anchor="middle" fill="#${theme.title}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12" font-weight="600">
          GitHub Token Required
        </text>
        <text x="165" y="50" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="10">
          Set GITHUB_TOKEN environment variable
        </text>
        <text x="165" y="65" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="9" opacity="0.7">
          to fetch real stats for @${username}
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

  const svg = generateStatsSvg(username, stats, rank, theme, {
    showIcons,
    hideBorder,
    hideTitle,
    hideRank,
    borderRadius,
  });

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
