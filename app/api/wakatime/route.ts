import { NextRequest, NextResponse } from 'next/server';

import { getWakatimeTheme, type WakatimeTheme } from '@/lib/themes';
import { escapeSvg } from '@/lib/utils';

function generateErrorSvg(
  username: string,
  theme: WakatimeTheme,
  options: { hideBorder: boolean; borderRadius: number },
) {
  const width = 540;
  const height = 200;
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" rx="${options.borderRadius}" ry="${options.borderRadius}" width="${width}" height="${height}" fill="#${theme.bg}" />
  <text x="50%" y="50%" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, sans-serif" font-size="14">
    Error fetching stats for @${escapeSvg(username)}
  </text>
</svg>`;
}

interface WakatimePublicData {
  data: {
    human_readable_total?: string;
    human_readable_range?: string;
    languages: Array<{
      name: string;
      percent: number;
      text: string;
    }>;
  };
}

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Markdown: '#083fa1',
  Python: '#3572A5',
  JSON: '#292929',
  Solidity: '#AA6746',
  Bash: '#858585',
  YAML: '#cb171e',
  CSS: '#663399',
  Prisma: '#0c344b',
  Text: '#858585',
  Other: '#858585',
  HTML: '#e34c26',
  'Git Config': '#F44D27',
  Docker: '#858585',
  Rust: '#dea584',
  Makefile: '#427819',
  TSConfig: '#858585',
  TOML: '#9c4221',
  SQL: '#e38c00',
  'Nginx configuration file': '#858585',
  MDX: '#fcb32c',
  Git: '#858585',
  Diff: '#858585',
  XML: '#0060ac',
  SCSS: '#c6538c',
  CSV: '#237346',
  Batchfile: '#C1F12E',
  INI: '#d1dbe0',
  PowerShell: '#012456',
  Nim: '#ffc200',
  Perl: '#0298c3',
  EJS: '#a91e50',
};

function getLanguageColor(name: string): string {
  return languageColors[name] || '#858585';
}

function isValidWakatimeUsername(username: string): boolean {
  // WakaTime usernames typically contain alphanumeric characters, hyphens, and underscores
  // Must be 1-50 characters, start with alphanumeric
  const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,49}$/;
  return usernameRegex.test(username);
}

// Validate hex color to prevent XSS in SVG output
function isValidHexColor(color: string): boolean {
  // Must be 3 or 6 hex characters (without the # prefix)
  const hexColorRegex = /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/;
  return hexColorRegex.test(color);
}

// Sanitize theme colors to prevent XSS
function sanitizeWakatimeTheme(theme: WakatimeTheme): WakatimeTheme {
  return {
    bg: isValidHexColor(theme.bg) ? theme.bg : 'ffffff',
    text: isValidHexColor(theme.text) ? theme.text : '434d58',
    title: isValidHexColor(theme.title) ? theme.title : '151515',
    progress: isValidHexColor(theme.progress) ? theme.progress : '378dff',
    progressBg: isValidHexColor(theme.progressBg) ? theme.progressBg : 'e4e2e2',
    border: isValidHexColor(theme.border) ? theme.border : 'e4e2e2',
  };
}

async function fetchPublicWakatimeStats(username: string): Promise<WakatimePublicData | null> {
  try {
    // Validate username to prevent SSRF attacks
    if (!isValidWakatimeUsername(username)) {
      return null;
    }
    const response = await fetch(`https://wakatime.com/api/v1/users/${username}/stats/all_time`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

function generateWakatimeSvg(
  stats: WakatimePublicData,
  username: string,
  theme: WakatimeTheme,
  options: { borderRadius: number },
) {
  const { data } = stats;
  const languages = data.languages || [];
  const topLanguages = languages.slice(0, 40); // Show up to 40 languages

  const rowCount = Math.ceil(topLanguages.length / 2);
  const rowHeight = 25; // Compact spacing like the image
  const cardPadding = 30;
  const headerHeight = 140; // Space for Title and Badge
  const cardInternalHeader = 60; // Space for "Weekly Breakdown" title + progress bar

  const width = 540;
  const cardWidth = 490;
  const cardHeight = cardInternalHeader + rowCount * rowHeight + cardPadding;
  const totalHeight = headerHeight + cardHeight + 20;

  const totalTime = data.human_readable_total || '0 hrs 0 mins';
  const range = data.human_readable_range || 'JUL 28 2024'; // Using your requested static/placeholder date

  let svgContent = '';

  // 1. Centered Header Section
  svgContent += `
    <text x="50%" y="40" text-anchor="middle" font-family="Segoe UI, Ubuntu, sans-serif" font-weight="700" font-size="22" fill="#fff">
      📈 Development Metrics Since <tspan fill="#36cdff">${escapeSvg(range.toUpperCase())}</tspan>
    </text>

    <!-- Wakatime Badge -->
    <g transform="translate(${(width - 260) / 2}, 70)">
      <rect width="110" height="32" rx="4" fill="#3e3e3e" />
      <text x="55" y="21" text-anchor="middle" font-family="Segoe UI, sans-serif" font-weight="600" font-size="11" fill="#fff" style="letter-spacing: 1.5px">WAKATIME</text>
      <rect x="110" width="150" height="32" rx="4" fill="#008dd1" />
      <text x="185" y="21" text-anchor="middle" font-family="Segoe UI, sans-serif" font-weight="800" font-size="13" fill="#fff">${escapeSvg(totalTime.toUpperCase())}</text>
    </g>
  `;

  // 2. Main Card Container (Centered)
  const cardX = (width - cardWidth) / 2;
  const cardY = headerHeight;

  svgContent += `<g transform="translate(${cardX}, ${cardY})">
    <rect width="${cardWidth}" height="${cardHeight}" rx="${options.borderRadius}" fill="#161b22" />

    <text x="25" y="40" font-family="Segoe UI, sans-serif" font-weight="600" font-size="20" fill="#70a5fd">
      Weekly Development Breakdown
    </text>

    <!-- Progress Bar -->
    <svg x="25" y="60" width="${cardWidth - 50}" height="10">
      <mask id="bar-mask"><rect width="100%" height="10" rx="5" fill="white"/></mask>
      <g mask="url(#bar-mask)">`;

  let currentBarX = 0;
  const barWidth = cardWidth - 50;
  topLanguages.slice(0, 15).forEach((lang) => {
    const w = (lang.percent / 100) * barWidth;
    if (w > 0.5) {
      svgContent += `<rect x="${currentBarX}" width="${w + 0.5}" height="10" fill="${getLanguageColor(lang.name)}"/>`;
      currentBarX += w;
    }
  });
  // Fill remainder if any
  if (currentBarX < barWidth) {
    svgContent += `<rect x="${currentBarX}" width="${barWidth - currentBarX}" height="10" fill="#30363d"/>`;
  }

  svgContent += `</g></svg>`;

  // 3. Language List (Two Columns)
  const leftCol = topLanguages.filter((_, i) => i % 2 === 0);
  const rightCol = topLanguages.filter((_, i) => i % 2 === 1);

  const listStartY = 95;

  leftCol.forEach((lang, i) => {
    const y = listStartY + i * rowHeight;
    svgContent += `
    <g transform="translate(25, ${y})">
      <circle cx="6" cy="6" r="6" fill="${getLanguageColor(lang.name)}"/>
      <text x="22" y="10" font-family="Segoe UI, sans-serif" font-size="12" fill="#8b949e">
        <tspan fill="#58a6ff">${escapeSvg(lang.name)}</tspan> - ${escapeSvg(lang.text)}
      </text>
    </g>`;
  });

  rightCol.forEach((lang, i) => {
    const y = listStartY + i * rowHeight;
    svgContent += `
    <g transform="translate(260, ${y})">
      <circle cx="6" cy="6" r="6" fill="${getLanguageColor(lang.name)}"/>
      <text x="22" y="10" font-family="Segoe UI, sans-serif" font-size="12" fill="#8b949e">
        <tspan fill="#58a6ff">${escapeSvg(lang.name)}</tspan> - ${escapeSvg(lang.text)}
      </text>
    </g>`;
  });

  svgContent += `</g>`;

  return `<svg width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#0d1117" />
    ${svgContent}
  </svg>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  if (!username) return new NextResponse('Username is required', { status: 400 });

  const theme = sanitizeWakatimeTheme(getWakatimeTheme(searchParams.get('theme') || 'default'));
  const rawBorderRadius = searchParams.get('border_radius');
  // Validate border_radius to prevent XSS through SVG attributes
  const borderRadius =
    rawBorderRadius !== null ? Math.min(Math.max(parseInt(rawBorderRadius, 10) || 10, 0), 100) : 10;
  const options = { borderRadius };

  try {
    const stats = await fetchPublicWakatimeStats(username);
    if (!stats) {
      return new NextResponse(
        generateErrorSvg(username, theme, { hideBorder: false, borderRadius: 10 }),
        {
          headers: { 'Content-Type': 'image/svg+xml' },
        },
      );
    }

    const svg = generateWakatimeSvg(stats, username, theme, options);
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
