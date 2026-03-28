import { NextRequest, NextResponse } from 'next/server';

import { fetchLanguageStats, languageColors } from '@/lib/github';
import { getLangTheme } from '@/lib/themes';
import { escapeHtml } from '@/lib/utils';

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
  const width = 495;
  // Two columns: (495 - 50 margin) / 2 = 222 per column
  const colWidth = 222;
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
    <g transform="translate(${(i % 2) * colWidth}, ${Math.floor(i / 2) * 25 + 55})">
      <circle cx="5" cy="5" r="5" fill="#${lang.color}"/>
      <text x="15" y="9" class="lang-name">${lang.name}</text>
      <!-- Position percent at the end of the column and use text-anchor: end -->
      <text x="${colWidth - 10}" y="9" class="lang-percent">${lang.percent.toFixed(1)}%</text>
    </g>
  `,
    )
    .join('');

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.title}; }
    .lang-name { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; }
    .lang-percent {
      font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.text};
      text-anchor: end;
    }
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

// Normal layout - single column with progress bars
function generateNormalSvg(
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
  const width = 495;
  const height = Math.max(170, 45 + langs.length * 30 + 20);

  const langList = langs
    .map(
      (lang, i) => `
    <g transform="translate(0, ${i * 30 + 45})">
      <circle cx="5" cy="5" r="5" fill="#${lang.color}"/>
      <text x="15" y="9" class="lang-name">${lang.name}</text>
      <text x="430" y="9" class="lang-percent">${lang.percent.toFixed(1)}%</text>
      ${!options.hideProgress ? `<rect x="0" y="14" width="${(lang.percent / 100) * 445}" height="6" fill="#${lang.color}" rx="3"/>` : ''}
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
  const langs = languages.slice(0, options.langsCount); // Removed hardcoded limit
  const width = 495;
  // Calculate height: base 100px + (number of langs * line height) + padding
  const height = Math.max(200, 45 + langs.length * 25 + 20);
  const centerX = 120;
  const centerY = height / 2 + 10; // Keep chart centered vertically relative to dynamic height
  const radius = 70;

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
    <g transform="translate(265, ${55 + i * 25})">
      <circle cx="5" cy="5" r="5" fill="#${lang.color}"/>
      <text x="15" y="9" class="lang-name">${lang.name}</text>
      <text x="210" y="9" class="lang-percent">${lang.percent.toFixed(1)}%</text>
    </g>
  `,
    )
    .join('');

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.title}; }
    .lang-name { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; }
    .lang-percent { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; text-anchor: end; }
  </style>

  <rect x="0.5" y="0.5" rx="${options.borderRadius}" ry="${options.borderRadius}" width="${width - 1}" height="${height - 1}" fill="#${theme.bg}" stroke="${options.hideBorder ? 'none' : '#' + theme.border}" stroke-width="${options.hideBorder ? 0 : 1}"/>

  <text x="25" y="35" class="header">Most Used Languages</text>
  <g>${segments.join('')}</g>
  <circle cx="${centerX}" cy="${centerY}" r="40" fill="#${theme.bg}"/>
  ${legend}
</svg>
  `.trim();
}

// Donut Vertical - centered with legend below
function generateDonutVerticalSvg(
  languages: LanguageData[],
  theme: { bg: string; title: string; text: string; border: string },
  options: {
    hideBorder: boolean;
    langsCount: number;
    borderRadius: number;
  },
) {
  const langs = languages.slice(0, options.langsCount); // Removed hardcoded limit
  const width = 400;
  // Chart area is ~200px, legend is 20px per item
  const height = 210 + langs.length * 20 + 30;
  const centerX = 200;
  const centerY = 110;
  const radius = 70;

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
    <g transform="translate(80, ${210 + i * 20})">
      <circle cx="5" cy="5" r="5" fill="#${lang.color}"/>
      <text x="15" y="9" class="lang-name">${lang.name}</text>
      <text x="240" y="9" class="lang-percent">${lang.percent.toFixed(1)}%</text>
    </g>
  `,
    )
    .join('');

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.title}; }
    .lang-name { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; }
    .lang-percent { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; text-anchor: end; }
  </style>

  <rect x="0.5" y="0.5" rx="${options.borderRadius}" ry="${options.borderRadius}" width="${width - 1}" height="${height - 1}" fill="#${theme.bg}" stroke="${options.hideBorder ? 'none' : '#' + theme.border}" stroke-width="${options.hideBorder ? 0 : 1}"/>

  <text x="200" y="35" text-anchor="middle" class="header">Most Used Languages</text>
  <g>${segments.join('')}</g>
  <circle cx="${centerX}" cy="${centerY}" r="40" fill="#${theme.bg}"/>
  ${legend}
</svg>
  `.trim();
}

// Pie chart - full circle pie with legend
function generatePieSvg(
  languages: LanguageData[],
  theme: { bg: string; title: string; text: string; border: string },
  options: {
    hideBorder: boolean;
    langsCount: number;
    borderRadius: number;
  },
) {
  const langs = languages.slice(0, options.langsCount); // Removed hardcoded limit
  const width = 495;
  const height = Math.max(220, 45 + langs.length * 25 + 20);
  const centerX = 120;
  const centerY = height / 2 + 10;
  const radius = 75;

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
    <g transform="translate(265, ${55 + i * 25})">
      <rect x="0" y="0" width="10" height="10" rx="2" fill="#${lang.color}"/>
      <text x="18" y="10" class="lang-name">${lang.name}</text>
      <text x="210" y="10" class="lang-percent">${lang.percent.toFixed(1)}%</text>
    </g>
  `,
    )
    .join('');

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.title}; }
    .lang-name { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; }
    .lang-percent { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text}; text-anchor: end; }
  </style>

  <rect x="0.5" y="0.5" rx="${options.borderRadius}" ry="${options.borderRadius}" width="${width - 1}" height="${height - 1}" fill="#${theme.bg}" stroke="${options.hideBorder ? 'none' : '#' + theme.border}" stroke-width="${options.hideBorder ? 0 : 1}"/>

  <text x="25" y="35" class="header">Most Used Languages</text>
  <g>${segments.join('')}</g>
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

  let theme = getLangTheme(themeName);

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
    } catch {
      return new NextResponse(
        `<svg width="495" height="120" xmlns="http://www.w3.org/2000/svg">
          <rect width="495" height="120" fill="#${theme.bg}" rx="10"/>
          <text x="247.5" y="50" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="14">
            Error fetching languages for @${escapeHtml(username)}
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
        <text x="247.5" y="45" text-anchor="middle" fill="#${theme.title}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="14" font-weight="600">
          GitHub Token Required
        </text>
        <text x="247.5" y="70" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12">
          Set GITHUB_TOKEN environment variable
        </text>
        <text x="247.5" y="90" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="11" opacity="0.7">
          to fetch real languages for @${escapeHtml(username)}
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
  if (layout === 'normal') {
    svg = generateNormalSvg(username, languages, theme, {
      hideBorder,
      hideProgress,
      langsCount,
      borderRadius,
    });
  } else if (layout === 'donut') {
    svg = generateDonutSvg(languages, theme, {
      hideBorder,
      langsCount,
      borderRadius,
    });
  } else if (layout === 'donut-vertical') {
    svg = generateDonutVerticalSvg(languages, theme, {
      hideBorder,
      langsCount,
      borderRadius,
    });
  } else if (layout === 'pie') {
    svg = generatePieSvg(languages, theme, {
      hideBorder,
      langsCount,
      borderRadius,
    });
  } else {
    // compact layout (default)
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
