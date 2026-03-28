import { NextRequest, NextResponse } from 'next/server';

import { fetchUserStats, type GitHubStats } from '@/lib/github';

const themes: Record<
  string,
  { bg: string; title: string; text: string; trophy: string; frame: string }
> = {
  default: {
    bg: 'ffffff',
    title: '1a1b27',
    text: '434d58',
    trophy: 'ffc000',
    frame: '000000',
  },
  tokyonight: {
    bg: '1a1b27',
    title: '70a5fd',
    text: '38bdae',
    trophy: 'bf91f3',
    frame: '70a5fd',
  },
  dracula: {
    bg: '282a36',
    title: 'ff6e96',
    text: 'f8f8f2',
    trophy: 'ffb86c',
    frame: 'bd93f9',
  },
  radical: {
    bg: '141321',
    title: 'fe428e',
    text: 'a9fef7',
    trophy: 'f8d847',
    frame: 'fe428e',
  },
  onedark: {
    bg: '282c34',
    title: 'e4bf7a',
    text: 'abb2bf',
    trophy: 'e4bf7a',
    frame: '8eb573',
  },
  nord: {
    bg: '2e3440',
    title: '81a1c1',
    text: 'd8dee9',
    trophy: 'ebcb8b',
    frame: '88c0d0',
  },
  github_dark: {
    bg: '0d1117',
    title: '58a6ff',
    text: 'c9d1d9',
    trophy: 'f5700c',
    frame: '1f6feb',
  },
  catppuccin_mocha: {
    bg: '1e1e2e',
    title: '89b4fa',
    text: 'cdd6f4',
    trophy: 'f9e2af',
    frame: '94e2d5',
  },
};

interface Trophy {
  name: string;
  rank: string;
  icon: string;
}

function calculateTrophies(stats: GitHubStats): Trophy[] {
  const trophies: Trophy[] = [];

  // Stars Trophy
  const starsRank =
    stats.totalStars >= 10000
      ? 'SSS'
      : stats.totalStars >= 5000
        ? 'SS'
        : stats.totalStars >= 1000
          ? 'S'
          : stats.totalStars >= 500
            ? 'AA'
            : stats.totalStars >= 100
              ? 'A'
              : stats.totalStars >= 50
                ? 'B'
                : 'C';
  trophies.push({ name: 'Stars', rank: starsRank, icon: 'star' });

  // Commits Trophy
  const commitsRank =
    stats.totalCommits >= 10000
      ? 'SSS'
      : stats.totalCommits >= 5000
        ? 'SS'
        : stats.totalCommits >= 1000
          ? 'S'
          : stats.totalCommits >= 500
            ? 'AA'
            : stats.totalCommits >= 200
              ? 'A'
              : stats.totalCommits >= 100
                ? 'B'
                : 'C';
  trophies.push({ name: 'Commits', rank: commitsRank, icon: 'git-commit' });

  // Followers Trophy
  const followersRank =
    stats.followers >= 5000
      ? 'SSS'
      : stats.followers >= 1000
        ? 'SS'
        : stats.followers >= 500
          ? 'S'
          : stats.followers >= 100
            ? 'AA'
            : stats.followers >= 50
              ? 'A'
              : stats.followers >= 10
                ? 'B'
                : 'C';
  trophies.push({ name: 'Followers', rank: followersRank, icon: 'users' });

  // PRs Trophy
  const prsRank =
    stats.totalPRs >= 1000
      ? 'SSS'
      : stats.totalPRs >= 500
        ? 'SS'
        : stats.totalPRs >= 200
          ? 'S'
          : stats.totalPRs >= 100
            ? 'AA'
            : stats.totalPRs >= 50
              ? 'A'
              : stats.totalPRs >= 20
                ? 'B'
                : 'C';
  trophies.push({ name: 'PRs', rank: prsRank, icon: 'git-pull-request' });

  // Issues Trophy
  const issuesRank =
    stats.totalIssues >= 500
      ? 'SSS'
      : stats.totalIssues >= 200
        ? 'SS'
        : stats.totalIssues >= 100
          ? 'S'
          : stats.totalIssues >= 50
            ? 'AA'
            : stats.totalIssues >= 20
              ? 'A'
              : stats.totalIssues >= 10
                ? 'B'
                : 'C';
  trophies.push({ name: 'Issues', rank: issuesRank, icon: 'alert-circle' });

  // Repos Trophy
  const reposRank =
    stats.publicRepos >= 200
      ? 'SSS'
      : stats.publicRepos >= 100
        ? 'SS'
        : stats.publicRepos >= 50
          ? 'S'
          : stats.publicRepos >= 30
            ? 'AA'
            : stats.publicRepos >= 20
              ? 'A'
              : stats.publicRepos >= 10
                ? 'B'
                : 'C';
  trophies.push({ name: 'Repos', rank: reposRank, icon: 'repo' });

  // Reviews Trophy
  const reviewsRank =
    stats.totalReviews >= 500
      ? 'SSS'
      : stats.totalReviews >= 200
        ? 'SS'
        : stats.totalReviews >= 100
          ? 'S'
          : stats.totalReviews >= 50
            ? 'AA'
            : stats.totalReviews >= 20
              ? 'A'
              : stats.totalReviews >= 10
                ? 'B'
                : 'C';
  trophies.push({ name: 'Reviews', rank: reviewsRank, icon: 'code-review' });

  // Contributed To Trophy
  const contributedRank =
    stats.contributedTo >= 100
      ? 'SSS'
      : stats.contributedTo >= 50
        ? 'SS'
        : stats.contributedTo >= 30
          ? 'S'
          : stats.contributedTo >= 20
            ? 'AA'
            : stats.contributedTo >= 10
              ? 'A'
              : stats.contributedTo >= 5
                ? 'B'
                : 'C';
  trophies.push({
    name: 'Contributed',
    rank: contributedRank,
    icon: 'comment-discussion',
  });

  return trophies;
}

function getTheme(themeName: string) {
  return themes[themeName] || themes.default;
}

function generateTrophySvg(
  trophies: Trophy[],
  theme: { bg: string; title: string; text: string; trophy: string; frame: string },
  options: {
    column: number;
    row: number;
    marginW: number;
    marginH: number;
    noFrame: boolean;
    noBg: boolean;
  },
) {
  const trophyWidth = 80;
  const trophyHeight = 90;
  const { column, row, marginW, marginH } = options;

  const totalTrophies = Math.min(column * row, trophies.length);
  const displayTrophies = trophies.slice(0, totalTrophies);

  const width = column * trophyWidth + (column - 1) * marginW + 40;
  const height = row * trophyHeight + (row - 1) * marginH + 20;

  const rankColors: Record<string, string> = {
    SSS: 'ff0000',
    SS: 'ff4500',
    S: 'ffa500',
    AA: 'ffd700',
    A: 'c0c0c0',
    B: 'cd7f32',
    C: '808080',
  };

  const trophyCards = displayTrophies
    .map((trophy, i) => {
      const col = i % column;
      const rowIdx = Math.floor(i / column);
      const x = 20 + col * (trophyWidth + marginW);
      const y = 10 + rowIdx * (trophyHeight + marginH);

      return `
      <g transform="translate(${x}, ${y})">
        ${!options.noFrame ? `<rect x="0" y="0" width="${trophyWidth}" height="${trophyHeight}" rx="6" fill="${options.noBg ? 'none' : '#' + theme.bg}" stroke="#${theme.frame}" stroke-width="1"/>` : ''}

        <!-- Trophy -->
        <g transform="translate(${trophyWidth / 2}, 35)">
          <path transform="translate(-15, -18)" d="M15 4 L19 11 L26 11 L20 16 L23 24 L15 19 L7 24 L10 16 L4 11 L11 11 Z" fill="#${rankColors[trophy.rank] || theme.trophy}"/>
        </g>

        <text x="${trophyWidth / 2}" y="55" text-anchor="middle" class="trophy-title">${trophy.name}</text>
        <text x="${trophyWidth / 2}" y="70" text-anchor="middle" class="trophy-rank" fill="#${rankColors[trophy.rank] || theme.trophy}">${trophy.rank}</text>
      </g>
    `;
    })
    .join('');

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .trophy-title { font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.title}; }
    .trophy-rank { font: 800 16px 'Segoe UI', Ubuntu, Sans-Serif; }
  </style>

  ${!options.noBg ? `<rect x="0" y="0" width="${width}" height="${height}" fill="#${theme.bg}" rx="10"/>` : ''}

  ${trophyCards}
</svg>
  `.trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const username = searchParams.get('username') || 'github';
  const themeName = searchParams.get('theme') || 'default';
  const column = parseInt(searchParams.get('column') || '4');
  const row = parseInt(searchParams.get('row') || '2');
  const marginW = parseInt(searchParams.get('margin_w') || '15');
  const marginH = parseInt(searchParams.get('margin_h') || '15');
  const noFrame = searchParams.get('no_frame') === 'true';
  const noBg = searchParams.get('no_bg') === 'true';

  const theme = getTheme(themeName);
  const token = process.env.GITHUB_TOKEN;

  if (token) {
    try {
      const stats = await fetchUserStats(username, token);
      const trophies = calculateTrophies(stats);

      const svg = generateTrophySvg(trophies, theme, {
        column,
        row,
        marginW,
        marginH,
        noFrame,
        noBg,
      });

      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch {
      return new NextResponse(
        `<svg width="495" height="120" xmlns="http://www.w3.org/2000/svg">
          <rect width="495" height="120" fill="#${theme.bg}" rx="10"/>
          <text x="247.5" y="50" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="14">
            Error fetching trophies for @${username}
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
        <rect width="495" height="120" fill="#${theme.bg}" rx="10" stroke="#${theme.frame}"/>
        <text x="247.5" y="45" text-anchor="middle" fill="#${theme.title}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="14" font-weight="600">
          GitHub Token Required
        </text>
        <text x="247.5" y="70" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12">
          Set GITHUB_TOKEN environment variable
        </text>
        <text x="247.5" y="90" text-anchor="middle" fill="#${theme.text}" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="11" opacity="0.7">
          to fetch real trophies for @${username}
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
