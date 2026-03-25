// GitHub API utility functions

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  size: number;
}

export interface GitHubStats {
  totalStars: number;
  totalForks: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalReviews: number;
  contributedTo: number;
  followers: number;
  publicRepos: number;
}

export interface LanguageStats {
  [language: string]: number;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: Array<{
    contributionDays: ContributionDay[];
  }>;
}

async function fetchGitHub(endpoint: string, token?: string): Promise<Response> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`https://api.github.com${endpoint}`, { headers });
}

async function fetchGitHubGraphQL(
  query: string,
  variables: Record<string, unknown>,
  token: string,
): Promise<unknown> {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL API error: ${response.status}`);
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  return data.data;
}

export async function fetchUserProfile(username: string, token?: string): Promise<GitHubUser> {
  const response = await fetchGitHub(`/users/${username}`, token);

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }

  return response.json();
}

export async function fetchUserRepos(username: string, token?: string): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetchGitHub(
      `/users/${username}/repos?per_page=${perPage}&page=${page}&type=owner`,
      token,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch repos: ${response.status}`);
    }

    const repos: GitHubRepo[] = await response.json();
    allRepos.push(...repos);

    if (repos.length < perPage) break;
    page++;

    // Limit to 10 pages (1000 repos max)
    if (page > 10) break;
  }

  return allRepos;
}

export async function fetchUserStats(username: string, token: string): Promise<GitHubStats> {
  const query = `
    query($username: String!) {
      user(login: $username) {
        followers {
          totalCount
        }
        repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
          totalCount
          nodes {
            stargazerCount
            forkCount
          }
        }
        pullRequests(first: 1) {
          totalCount
        }
        issues(first: 1) {
          totalCount
        }
        repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
          totalCount
        }
        contributionsCollection {
          totalCommitContributions
          restrictedContributionsCount
          totalPullRequestReviewContributions
        }
      }
    }
  `;

  interface GraphQLResponse {
    user: {
      followers: { totalCount: number };
      repositories: {
        totalCount: number;
        nodes: Array<{ stargazerCount: number; forkCount: number }>;
      };
      pullRequests: { totalCount: number };
      issues: { totalCount: number };
      repositoriesContributedTo: { totalCount: number };
      contributionsCollection: {
        totalCommitContributions: number;
        restrictedContributionsCount: number;
        totalPullRequestReviewContributions: number;
      };
    };
  }

  const data = (await fetchGitHubGraphQL(query, { username }, token)) as GraphQLResponse;

  const repos = data.user.repositories.nodes;
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazerCount, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forkCount, 0);

  return {
    totalStars,
    totalForks,
    totalCommits:
      data.user.contributionsCollection.totalCommitContributions +
      data.user.contributionsCollection.restrictedContributionsCount,
    totalPRs: data.user.pullRequests.totalCount,
    totalIssues: data.user.issues.totalCount,
    totalReviews: data.user.contributionsCollection.totalPullRequestReviewContributions,
    contributedTo: data.user.repositoriesContributedTo.totalCount,
    followers: data.user.followers.totalCount,
    publicRepos: data.user.repositories.totalCount,
  };
}

export async function fetchLanguageStats(username: string, token: string): Promise<LanguageStats> {
  const query = `
    query($username: String!) {
      user(login: $username) {
        repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes {
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
          }
        }
      }
    }
  `;

  interface GraphQLResponse {
    user: {
      repositories: {
        nodes: Array<{
          languages: {
            edges: Array<{
              size: number;
              node: { name: string; color: string | null };
            }>;
          };
        }>;
      };
    };
  }

  const data = (await fetchGitHubGraphQL(query, { username }, token)) as GraphQLResponse;

  const languageMap: LanguageStats = {};

  for (const repo of data.user.repositories.nodes) {
    for (const edge of repo.languages.edges) {
      const lang = edge.node.name;
      languageMap[lang] = (languageMap[lang] || 0) + edge.size;
    }
  }

  return languageMap;
}

export async function fetchContributionCalendar(
  username: string,
  token: string,
): Promise<ContributionCalendar> {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  interface GraphQLResponse {
    user: {
      contributionsCollection: {
        contributionCalendar: ContributionCalendar;
      };
    };
  }

  const data = (await fetchGitHubGraphQL(query, { username }, token)) as GraphQLResponse;
  return data.user.contributionsCollection.contributionCalendar;
}

export function calculateStreakStats(calendar: ContributionCalendar): {
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  currentStreakStart: Date | null;
  currentStreakEnd: Date | null;
  longestStreakStart: Date | null;
  longestStreakEnd: Date | null;
} {
  const days: ContributionDay[] = [];
  for (const week of calendar.weeks) {
    days.push(...week.contributionDays);
  }

  // Sort by date
  days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  let currentStreakStart: Date | null = null;
  let currentStreakEnd: Date | null = null;
  let longestStreakStart: Date | null = null;
  let longestStreakEnd: Date | null = null;
  let tempStreakStart: Date | null = null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const dayDate = new Date(day.date);

    if (day.contributionCount > 0) {
      if (tempStreak === 0) {
        tempStreakStart = dayDate;
      }
      tempStreak++;

      // Check if this streak reaches today or yesterday (current streak)
      const diffFromToday = Math.floor(
        (today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffFromToday <= 1) {
        currentStreak = tempStreak;
        currentStreakStart = tempStreakStart;
        currentStreakEnd = dayDate;
      }
    } else {
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
        longestStreakStart = tempStreakStart;
        longestStreakEnd = days[i - 1] ? new Date(days[i - 1].date) : null;
      }
      tempStreak = 0;
      tempStreakStart = null;
    }
  }

  // Check final streak
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
    longestStreakStart = tempStreakStart;
    longestStreakEnd = days[days.length - 1] ? new Date(days[days.length - 1].date) : null;
  }

  return {
    currentStreak,
    longestStreak,
    totalContributions: calendar.totalContributions,
    currentStreakStart,
    currentStreakEnd,
    longestStreakStart,
    longestStreakEnd,
  };
}

export function calculateRank(stats: GitHubStats): string {
  const score =
    stats.totalCommits * 0.25 +
    stats.totalPRs * 0.5 +
    stats.totalIssues * 0.25 +
    stats.totalReviews * 0.25 +
    stats.totalStars * 1 +
    stats.followers * 0.5 +
    stats.contributedTo * 0.25;

  if (score >= 10000) return 'S+';
  if (score >= 5000) return 'S';
  if (score >= 2500) return 'A++';
  if (score >= 1000) return 'A+';
  if (score >= 500) return 'A';
  if (score >= 250) return 'B+';
  if (score >= 100) return 'B';
  return 'C';
}

export const languageColors: Record<string, string> = {
  JavaScript: 'f1e05a',
  TypeScript: '3178c6',
  Python: '3572A5',
  Java: 'b07219',
  'C++': 'f34b7d',
  C: '555555',
  'C#': '178600',
  Go: '00ADD8',
  Rust: 'dea584',
  Ruby: '701516',
  PHP: '4F5D95',
  Swift: 'F05138',
  Kotlin: 'A97BFF',
  Scala: 'c22d40',
  Dart: '00B4AB',
  Shell: '89e051',
  HTML: 'e34c26',
  CSS: '563d7c',
  SCSS: 'c6538c',
  Vue: '41b883',
  Svelte: 'ff3e00',
  Elixir: '6e4a7e',
  Haskell: '5e5086',
  Lua: '000080',
  R: '198CE7',
  Julia: 'a270ba',
  Perl: '0298c3',
  Clojure: 'db5855',
  'Objective-C': '438eff',
  Dockerfile: '384d54',
  Makefile: '427819',
  PowerShell: '012456',
  Vim: '199f4b',
};
