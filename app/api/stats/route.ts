import { NextRequest, NextResponse } from 'next/server';

import { calculateRank, fetchUserStats, type GitHubStats } from '@/lib/github';
import { getStatsTheme } from '@/lib/themes';
import { escapeSvg } from '@/lib/utils';

/**
 * Validate that a string is a valid hex color (3 or 6 characters).
 */
function isValidHexColor(color: string): boolean {
  return /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(color);
}

/**
 * Sanitize a color value for use in SVG - strips any non-hex characters.
 * This provides defense in depth against XSS by ensuring only valid hex
 * characters can ever appear in color attributes.
 */
function sanitizeColor(color: string): string {
  return color.replace(/[^0-9a-fA-F]/g, '');
}

function formatCompact(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toString();
}

// ---------------------------------------------------------------------------
// Icon helpers (16×16 GitHub Octicons) — used by the standard layout
// ---------------------------------------------------------------------------
type IconEntry = { d: string; fillRule?: 'nonzero' | 'evenodd' };

const STAT_ICON_PATHS: Record<string, IconEntry[]> = {
  star: [
    {
      d: 'M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z',
    },
  ],
  commit: [
    {
      d: 'M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z',
    },
  ],
  pr: [
    {
      d: 'M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z',
    },
  ],
  issue: [
    { d: 'M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' },
    {
      d: 'M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z',
      fillRule: 'evenodd',
    },
  ],
  repo: [
    {
      d: 'M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z',
      fillRule: 'evenodd',
    },
  ],
};

function makeStatIcon(name: string, x: number, y: number, color: string): string {
  const paths = STAT_ICON_PATHS[name] ?? [];
  const pathsHtml = paths
    .map((p) => `<path fill="#${color}" fill-rule="${p.fillRule ?? 'nonzero'}" d="${p.d}"/>`)
    .join('');
  return `<svg x="${x}" y="${y}" width="16" height="16" viewBox="0 0 16 16">${pathsHtml}</svg>`;
}

// ---------------------------------------------------------------------------
// Standard layout — list-style, 495×195, matches the classic GitHub stats look
// ---------------------------------------------------------------------------
function generateStandardStatsSvg(
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
  const width = 495;
  const height = 195;

  const statItems = [
    { icon: 'star', label: 'Total Stars Earned:', value: formatCompact(stats.totalStars) },
    {
      icon: 'commit',
      label: 'Total Commits (last year):',
      value: formatCompact(stats.totalCommits),
    },
    { icon: 'pr', label: 'Total PRs:', value: formatCompact(stats.totalPRs) },
    { icon: 'issue', label: 'Total Issues:', value: formatCompact(stats.totalIssues) },
    {
      icon: 'repo',
      label: 'Contributed to (last year):',
      value: formatCompact(stats.contributedTo),
    },
  ];

  // ── Rank ring ───────────────────────────────────────────────────────────
  const rankCX = 430;
  const rankCY = Math.round(height / 2);
  const rankR = 38;
  const circumference = +(2 * Math.PI * rankR).toFixed(2);

  const rankProgressMap: Record<string, number> = {
    'S+': 1.0,
    S: 0.9,
    'A++': 0.8,
    'A+': 0.7,
    A: 0.55,
    'B+': 0.45,
    B: 0.3,
    C: 0.15,
  };
  const progress = rankProgressMap[rank] ?? 0.5;
  const dashOffset = +(circumference * (1 - progress)).toFixed(2);

  // ── Title section ───────────────────────────────────────────────────────
  const titleH = options.hideTitle ? 0 : 50;

  const titleSection = options.hideTitle
    ? ''
    : `
    ${options.showIcons ? makeStatIcon('star', 25, 18, theme.icon) : ''}
    <text x="${options.showIcons ? 46 : 25}" y="32" class="std-header">${escapeSvg(username)}'s GitHub Stats</text>
    <line x1="25" y1="46" x2="${width - 25}" y2="46" stroke="#${theme.border}" stroke-width="1" stroke-opacity="0.5"/>
  `;

  // ── Stat rows ───────────────────────────────────────────────────────────
  const statsStartY = titleH + 14;
  const statsEndY = height - 10;
  const rowH = (statsEndY - statsStartY) / statItems.length;
  // Right edge of the value column — stays clear of the rank ring
  const statsRightX = options.hideRank ? width - 30 : 316;

  const statRows = statItems
    .map((item, i) => {
      const rowMidY = statsStartY + i * rowH + rowH / 2;
      const textY = Math.round(rowMidY + 4);
      const iconY = Math.round(rowMidY - 8);
      const labelX = options.showIcons ? 46 : 25;
      return `
      ${options.showIcons ? makeStatIcon(item.icon, 25, iconY, theme.icon) : ''}
      <text x="${labelX}" y="${textY}" class="std-label">${item.label}</text>
      <text x="${statsRightX}" y="${textY}" class="std-value" text-anchor="end">${item.value}</text>`;
    })
    .join('');

  // ── Rank section ────────────────────────────────────────────────────────
  const rankSection = options.hideRank
    ? ''
    : `
    <!-- rank ring track -->
    <circle cx="${rankCX}" cy="${rankCY}" r="${rankR}"
      fill="none" stroke="#${theme.icon}" stroke-width="5" stroke-opacity="0.2"/>
    <!-- rank ring progress -->
    <circle cx="${rankCX}" cy="${rankCY}" r="${rankR}"
      fill="none" stroke="#${theme.title}" stroke-width="5" stroke-linecap="round"
      stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
      transform="rotate(-90 ${rankCX} ${rankCY})"/>
    <text x="${rankCX}" y="${rankCY - rankR - 6}" text-anchor="middle" class="std-rank-label">RANK</text>
    <text x="${rankCX}" y="${rankCY + 10}"        text-anchor="middle" class="std-rank-text">${rank}</text>`;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .std-header     { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.title}; }
    .std-label      { font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text};  }
    .std-value      { font: 700 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text};  }
    .std-rank-label { font: 600 10px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; opacity: 0.7; letter-spacing: 1px; }
    .std-rank-text  { font: 800 24px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text};  }
  </style>

  <rect x="0.5" y="0.5" rx="${options.borderRadius}" ry="${options.borderRadius}"
    width="${width - 1}" height="${height - 1}"
    fill="#${theme.bg}"
    stroke="${options.hideBorder ? 'none' : '#' + theme.border}"
    stroke-width="${options.hideBorder ? 0 : 1}"/>

  ${titleSection}
  ${statRows}
  ${rankSection}
</svg>`.trim();
}

// ---------------------------------------------------------------------------
// Compact layout — original grid-of-cards design, 495×305
// ---------------------------------------------------------------------------
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
  const width = 495;
  // Match the default Top Languages "normal" SVG height when langs_count=8.
  const height = 305;

  const iconSvg = (x: number, y: number, path: string, delay: number = 0): string =>
    options.showIcons
      ? `<svg x="${x}" y="${y}" width="16" height="16" viewBox="0 0 16 16" fill="#${theme.icon}" class="icon" style="animation-delay: ${delay}ms">${path}</svg>`
      : '';

  const currentYear = new Date().getFullYear();

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
    .header { font: 700 20px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.title}; animation: fadeInAnimation 0.8s ease-in-out forwards; }
    .subheader { font: 500 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; opacity: 0.7; }
    .stat-label { font: 500 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; opacity: 0.9; }
    .stat-value { font: 700 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; }
    .stagger { opacity: 0; animation: fadeInAnimation 0.3s ease-in-out forwards; }
    .rank-text { font: 800 26px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; }
    .rank-label { font: 600 10px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; opacity: 0.7; letter-spacing: 1px; }
    .rank-circle { stroke: #${theme.icon}; fill: none; stroke-width: 6; }
    .rank-circle-inner { stroke: #${theme.icon}; stroke-opacity: 0.2; fill: none; stroke-width: 6; }
    .divider { stroke: #${theme.border}; stroke-opacity: 0.7; }
    .stat-card { fill: rgba(255, 255, 255, 0.04); stroke: #${theme.border}; stroke-opacity: 0.4; }
    @keyframes fadeInAnimation { from { opacity: 0; } to { opacity: 1; } }
  </style>

  <rect x="0.5" y="0.5" rx="${options.borderRadius}" ry="${options.borderRadius}" width="${width - 1}" height="${height - 1}" fill="url(#cardGradient)" stroke="${options.hideBorder ? 'none' : '#' + theme.border}" stroke-width="${options.hideBorder ? 0 : 1}" class="hover-highlight"/>

  ${
    !options.hideTitle
      ? `<text x="26" y="36" class="header">${escapeSvg(username)}'s GitHub Stats</text>
         <text x="26" y="54" class="subheader">Updated for ${currentYear}</text>
         <line x1="26" y1="66" x2="469" y2="66" class="divider"/>`
      : ''
  }

  <g transform="translate(26, ${options.hideTitle ? 24 : 84})" class="stagger">
    <rect class="stat-card" x="0" y="0" rx="10" ry="10" width="218" height="54" />
    ${iconSvg(14, 18, '<path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>')}
    <text x="${options.showIcons ? 38 : 14}" y="24" class="stat-label">Total Stars</text>
    <text x="${options.showIcons ? 38 : 14}" y="44" class="stat-value">${stats.totalStars.toLocaleString()}</text>
  </g>

  <g transform="translate(251, ${options.hideTitle ? 24 : 84})" class="stagger">
    <rect class="stat-card" x="0" y="0" rx="10" ry="10" width="218" height="54" />
    ${iconSvg(14, 18, '<path d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"/>')}
    <text x="${options.showIcons ? 38 : 14}" y="24" class="stat-label">Commits (${currentYear})</text>
    <text x="${options.showIcons ? 38 : 14}" y="44" class="stat-value">${stats.totalCommits.toLocaleString()}</text>
  </g>

  <g transform="translate(26, ${options.hideTitle ? 88 : 148})" class="stagger">
    <rect class="stat-card" x="0" y="0" rx="10" ry="10" width="218" height="54" />
    ${iconSvg(14, 18, '<path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>')}
    <text x="${options.showIcons ? 38 : 14}" y="24" class="stat-label">Pull Requests</text>
    <text x="${options.showIcons ? 38 : 14}" y="44" class="stat-value">${stats.totalPRs.toLocaleString()}</text>
  </g>

  <g transform="translate(251, ${options.hideTitle ? 88 : 148})" class="stagger">
    <rect class="stat-card" x="0" y="0" rx="10" ry="10" width="218" height="54" />
    ${iconSvg(14, 18, '<path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/><path fill-rule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/>')}
    <text x="${options.showIcons ? 38 : 14}" y="24" class="stat-label">Issues</text>
    <text x="${options.showIcons ? 38 : 14}" y="44" class="stat-value">${stats.totalIssues.toLocaleString()}</text>
  </g>

  <g transform="translate(26, ${options.hideTitle ? 152 : 212})" class="stagger">
    <rect class="stat-card" x="0" y="0" rx="10" ry="10" width="218" height="54" />
    ${iconSvg(14, 18, '<path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>')}
    <text x="${options.showIcons ? 38 : 14}" y="24" class="stat-label">Contributed To</text>
    <text x="${options.showIcons ? 38 : 14}" y="44" class="stat-value">${stats.contributedTo.toLocaleString()}</text>
  </g>

  ${
    !options.hideRank
      ? `
  <g transform="translate(360, ${options.hideTitle ? 179 : 239})">
    <circle class="rank-circle-inner" cx="0" cy="0" r="40"/>
    <circle class="rank-circle" cx="0" cy="0" r="40" stroke-dasharray="251.2" stroke-dashoffset="50" transform="rotate(-90)"/>
    <text x="0" y="-50" text-anchor="middle" class="rank-label">RANK</text>
    <text x="0" y="8" text-anchor="middle" class="rank-text">${rank}</text>
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
  const layout = (searchParams.get('layout') ?? 'standard') as 'standard' | 'compact';
  const showIcons = searchParams.get('show_icons') !== 'false';
  const hideBorder = searchParams.get('hide_border') === 'true';
  const hideTitle = searchParams.get('hide_title') === 'true';
  const hideRank = searchParams.get('hide_rank') === 'true';
  const borderRadius = parseInt(searchParams.get('border_radius') || '10', 10);

  const theme = getStatsTheme(themeName);

  // Per-request colour overrides (with validation and sanitization)
  const bgColor = searchParams.get('bg_color');
  if (bgColor) {
    const sanitized = sanitizeColor(bgColor.replace('#', ''));
    if (isValidHexColor(sanitized)) {
      theme.bg = sanitized;
    }
  }
  const textColor = searchParams.get('text_color');
  if (textColor) {
    const sanitized = sanitizeColor(textColor.replace('#', ''));
    if (isValidHexColor(sanitized)) {
      theme.text = sanitized;
    }
  }
  const titleColor = searchParams.get('title_color');
  if (titleColor) {
    const sanitized = sanitizeColor(titleColor.replace('#', ''));
    if (isValidHexColor(sanitized)) {
      theme.title = sanitized;
    }
  }
  const iconColor = searchParams.get('icon_color');
  if (iconColor) {
    const sanitized = sanitizeColor(iconColor.replace('#', ''));
    if (isValidHexColor(sanitized)) {
      theme.icon = sanitized;
    }
  }

  const token = process.env.GITHUB_TOKEN;

  let stats: GitHubStats;
  let rank: string;

  if (token) {
    try {
      stats = await fetchUserStats(username, token);
      rank = calculateRank(stats);
    } catch {
      const errW = layout === 'standard' ? 495 : 350;
      const errH = layout === 'standard' ? 195 : 80;
      const escapedUsername = escapeSvg(username);
      return new NextResponse(
        `<svg width="${errW}" height="${errH}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${errW}" height="${errH}" fill="#${theme.bg}" rx="10"/>
          <text x="${errW / 2}" y="${errH / 2 - 8}" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12">
            Error fetching stats for @${escapedUsername}
          </text>
          <text x="${errW / 2}" y="${errH / 2 + 12}" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="10" opacity="0.7">
            User may not exist or API rate limit exceeded
          </text>
        </svg>`,
        { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=300' } },
      );
    }
  } else {
    const noTokW = layout === 'standard' ? 495 : 330;
    const noTokH = layout === 'standard' ? 195 : 80;
    return new NextResponse(
      `<svg width="${noTokW}" height="${noTokH}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${noTokW}" height="${noTokH}" fill="#${theme.bg}" rx="10" stroke="#${theme.border}"/>
        <text x="${noTokW / 2}" y="${noTokH / 2 - 18}" text-anchor="middle" fill="#${theme.title}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12" font-weight="600">
          GitHub Token Required
        </text>
        <text x="${noTokW / 2}" y="${noTokH / 2 + 2}" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="10">
          Set GITHUB_TOKEN environment variable
        </text>
        <text x="${noTokW / 2}" y="${noTokH / 2 + 18}" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="9" opacity="0.7">
          to fetch real stats for @${escapeSvg(username)}
        </text>
      </svg>`,
      { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=60' } },
    );
  }

  const svgOptions = { showIcons, hideBorder, hideTitle, hideRank, borderRadius };

  const svg =
    layout === 'compact'
      ? generateStatsSvg(username, stats, rank, theme, svgOptions)
      : generateStandardStatsSvg(username, stats, rank, theme, svgOptions);

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
