import { NextRequest, NextResponse } from 'next/server';

import { fetchLanguageStats, languageColors } from '@/lib/github';

const themes: Record<string, { bg: string; title: string; text: string; border: string }> = {
  default: { bg: 'fffefe', title: '2f80ed', text: '434d58', border: 'e4e2e2' },
  dark: { bg: '151515', title: 'fff', text: '9f9f9f', border: 'e4e2e2' },
  tokyonight: { bg: '1a1b27', title: '70a5fd', text: '38bdae', border: 'e4e2e2' },
  dracula: { bg: '282a36', title: 'ff6e96', text: 'f8f8f2', border: 'e4e2e2' },
  radical: { bg: '141321', title: 'fe428e', text: 'a9fef7', border: 'e4e2e2' },
  merko: { bg: '0a0f0b', title: 'abd200', text: '68b587', border: 'e4e2e2' },
  gruvbox: { bg: '282828', title: 'fabd2f', text: 'ebdbb2', border: 'e4e2e2' },
  onedark: { bg: '282c34', title: 'e4bf7a', text: 'abb2bf', border: 'e4e2e2' },
  nord: { bg: '2e3440', title: '81a1c1', text: 'd8dee9', border: 'e4e2e2' },
  github_dark: { bg: '0d1117', title: '58a6ff', text: 'c9d1d9', border: '30363d' },
  catppuccin_mocha: { bg: '1e1e2e', title: '89b4fa', text: 'cdd6f4', border: '313244' },
};

function getTheme(themeName: string) {
  return themes[themeName] || themes.default;
}

interface LanguageData {
  name: string;
  color: string;
  percent: number;
  size: number;
}

function generateCompactSvg(
  username: string,
  languages: LanguageData[],
  theme: { bg: string; title: string; text: string; border: string },
  options: {
    hideBorder: boolean;
    hideProgress: boolean;
    langsCount: number;
    borderRadius: number;
  },
) {
  const langs = languages.slice(0, options.langsCount);
  const width = 350;
  const height = Math.max(170, 55 + Math.ceil(langs.length / 2) * 25 + 20);

  const progressBar = !options.hideProgress
    ? `
    <g transform="translate(0, 35)">
      ${langs
        .map((lang, i) => {
          const startX = langs
            .slice(0, i)
            .reduce((acc, l) => acc + (l.percent / 100) * (width - 50), 0);
          const barWidth = (lang.percent / 100) * (width - 50);
          return `<rect x="${startX}" y="0" width="${barWidth}" height="8" fill="#${lang.color}" rx="2"/>`;
        })
        .join('')}
    </g>
  `
    : '';

  const langList = langs
    .map(
      (lang, i) => `
    <g transform="translate(${(i % 2) * 150}, ${Math.floor(i / 2) * 25 + 55})">
      <circle cx="5" cy="5" r="5" fill="#${lang.color}"/>
      <text x="15" y="9" class="lang-name">${lang.name}</text>
      <text x="120" y="9" class="lang-percent">${lang.percent.toFixed(2)}%</text>
    </g>
  `,
    )
    .join('');

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.title}; }
    .lang-name { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; }
    .lang-percent { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; }
  </style>

  <rect x="0.5" y="0.5" rx="${options.borderRadius}" ry="${options.borderRadius}" width="${width - 1}" height="${height - 1}" fill="#${theme.bg}" stroke="${options.hideBorder ? 'none' : '#' + theme.border}" stroke-width="${options.hideBorder ? 0 : 1}"/>
  
  <g transform="translate(25, 25)">
    <text class="header">Most Used Languages</text>
    ${progressBar}
    ${langList}
  </g>
</svg>
  `.trim();
}

function generateDonutSvg(
  languages: LanguageData[],
  theme: { bg: string; title: string; text: string; border: string },
  options: {
    hideBorder: boolean;
    langsCount: number;
    borderRadius: number;
  },
) {
  const langs = languages.slice(0, Math.min(options.langsCount, 6));
  const width = 300;
  const height = 200;
  const centerX = 100;
  const centerY = 100;
  const radius = 60;

  let currentAngle = -90;
  const segments = langs.map((lang) => {
    const angle = (lang.percent / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return `<path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="#${lang.color}"/>`;
  });

  const legend = langs
    .map(
      (lang, i) => `
    <g transform="translate(180, ${50 + i * 25})">
      <circle cx="5" cy="5" r="5" fill="#${lang.color}"/>
      <text x="15" y="9" class="lang-name">${lang.name}</text>
    </g>
  `,
    )
    .join('');

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .header { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.title}; }
    .lang-name { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; }
  </style>

  <rect x="0.5" y="0.5" rx="${options.borderRadius}" ry="${options.borderRadius}" width="${width - 1}" height="${height - 1}" fill="#${theme.bg}" stroke="${options.hideBorder ? 'none' : '#' + theme.border}" stroke-width="${options.hideBorder ? 0 : 1}"/>
  
  <text x="25" y="25" class="header">Most Used Languages</text>
  <g>${segments.join('')}</g>
  <circle cx="${centerX}" cy="${centerY}" r="35" fill="#${theme.bg}"/>
  ${legend}
</svg>
  `.trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const username = searchParams.get('username') || 'github';
  const themeName = searchParams.get('theme') || 'default';
  const layout = searchParams.get('layout') || 'compact';
  const hideBorder = searchParams.get('hide_border') === 'true';
  const hideProgress = searchParams.get('hide_progress') === 'true';
  const langsCount = parseInt(searchParams.get('langs_count') || '8');
  const borderRadius = parseInt(searchParams.get('border_radius') || '10');

  let theme = getTheme(themeName);

  if (searchParams.get('bg_color')) {
    theme = { ...theme, bg: searchParams.get('bg_color')!.replace('#', '') };
  }
  if (searchParams.get('text_color')) {
    theme = { ...theme, text: searchParams.get('text_color')!.replace('#', '') };
  }
  if (searchParams.get('title_color')) {
    theme = { ...theme, title: searchParams.get('title_color')!.replace('#', '') };
  }

  const token = process.env.GITHUB_TOKEN;

  let languages: LanguageData[];

  if (token) {
    try {
      const langStats = await fetchLanguageStats(username, token);

      // Convert to sorted array with percentages
      const totalSize = Object.values(langStats).reduce((a, b) => a + b, 0);
      languages = Object.entries(langStats)
        .map(([name, size]) => ({
          name,
          size,
          color: languageColors[name] || '808080',
          percent: (size / totalSize) * 100,
        }))
        .sort((a, b) => b.size - a.size);
    } catch (error) {
      console.error('Error fetching language stats:', error);
      return new NextResponse(
        `<svg width="350" height="120" xmlns="http://www.w3.org/2000/svg">
          <rect width="350" height="120" fill="#${theme.bg}" rx="10"/>
          <text x="175" y="50" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="14">
            Error fetching languages for @${username}
          </text>
          <text x="175" y="75" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12" opacity="0.7">
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
      `<svg width="350" height="120" xmlns="http://www.w3.org/2000/svg">
        <rect width="350" height="120" fill="#${theme.bg}" rx="10" stroke="#${theme.border}"/>
        <text x="175" y="45" text-anchor="middle" fill="#${theme.title}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="14" font-weight="600">
          GitHub Token Required
        </text>
        <text x="175" y="70" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12">
          Set GITHUB_TOKEN environment variable
        </text>
        <text x="175" y="90" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="11" opacity="0.7">
          to fetch real languages for @${username}
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

  let svg: string;
  if (layout === 'donut' || layout === 'donut-vertical' || layout === 'pie') {
    svg = generateDonutSvg(languages, theme, {
      hideBorder,
      langsCount,
      borderRadius,
    });
  } else {
    svg = generateCompactSvg(username, languages, theme, {
      hideBorder,
      hideProgress,
      langsCount,
      borderRadius,
    });
  }

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
