import type { Block, BlockType } from './types';

// Weight definitions for different quality factors
interface QualityWeights {
  blocks: number;
  content: number;
  variety: number;
  visualBalance: number;
}

const DEFAULT_WEIGHTS: QualityWeights = {
  blocks: 25,
  content: 30,
  variety: 25,
  visualBalance: 20,
};

// Block categories for variety scoring
const BLOCK_CATEGORIES_MAP: Record<BlockType, string> = {
  divider: 'layout',
  spacer: 'layout',
  'capsule-header': 'hero',
  avatar: 'hero',
  greeting: 'hero',
  'typing-animation': 'hero',
  heading: 'content',
  paragraph: 'content',
  collapsible: 'content',
  'code-block': 'content',
  image: 'media',
  gif: 'media',
  'social-badges': 'social',
  'custom-badge': 'social',
  'skill-icons': 'tech',
  'stats-row': 'github-stats',
  'stats-card': 'github-stats',
  'top-languages': 'github-stats',
  'streak-stats': 'github-stats',
  'activity-graph': 'github-stats',
  trophies: 'github-stats',
  'wakatime-stats': 'github-stats',
  'visitor-counter': 'advanced',
  quote: 'advanced',
  'footer-banner': 'advanced',
  'support-link': 'advanced',
};

// Content fields that should be filled
const CONTENT_FIELDS: Record<BlockType, string[]> = {
  divider: [],
  spacer: [],
  'capsule-header': ['text'],
  avatar: ['imageUrl'],
  greeting: ['text'],
  'typing-animation': ['lines'],
  heading: ['text'],
  paragraph: ['text'],
  collapsible: ['title'],
  'code-block': ['code'],
  image: ['url', 'alt'],
  gif: ['url', 'alt'],
  'social-badges': ['linkedin', 'twitter', 'github', 'email'],
  'custom-badge': ['label', 'message'],
  'skill-icons': ['icons'],
  'stats-row': [],
  'stats-card': ['username'],
  'top-languages': ['username'],
  'streak-stats': ['username'],
  'activity-graph': ['username'],
  trophies: ['username'],
  'wakatime-stats': ['username'],
  'visitor-counter': ['username'],
  quote: ['quote'],
  'footer-banner': ['text'],
  'support-link': [],
};

// Scoring thresholds
const SCORING_THRESHOLDS = {
  minBlocks: 5,
  goodBlocks: 10,
  excellentBlocks: 15,
  minCategories: 2,
  goodCategories: 4,
  excellentCategories: 6,
  minContentFill: 0.6,
  goodContentFill: 0.8,
  excellentContentFill: 0.95,
};

export interface QualitySuggestion {
  category: 'blocks' | 'content' | 'variety' | 'visualBalance';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ProfileQualityResult {
  score: number;
  maxScore: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  breakdown: {
    blocks: number;
    content: number;
    variety: number;
    visualBalance: number;
  };
  suggestions: QualitySuggestion[];
  stats: {
    totalBlocks: number;
    filledContentFields: number;
    totalContentFields: number;
    uniqueCategories: number;
    hasUsername: boolean;
    hasAvatar: boolean;
    hasSocialLinks: boolean;
    hasGitHubStats: boolean;
  };
}

/**
 * Calculate the quality score for a GitHub profile
 */
export function calculateProfileQuality(
  blocks: Block[],
  username: string,
  weights: QualityWeights = DEFAULT_WEIGHTS,
): ProfileQualityResult {
  const stats = analyzeBlocks(blocks, username);
  const breakdown = calculateBreakdown(stats, weights);
  const suggestions = generateSuggestions(stats, breakdown);

  const totalScore =
    breakdown.blocks + breakdown.content + breakdown.variety + breakdown.visualBalance;
  const maxScore = weights.blocks + weights.content + weights.variety + weights.visualBalance;
  const percentage = Math.round((totalScore / maxScore) * 100);
  const grade = calculateGrade(percentage);

  return {
    score: totalScore,
    maxScore,
    percentage,
    grade,
    breakdown,
    suggestions,
    stats,
  };
}

/**
 * Analyze blocks and extract quality metrics
 */
function analyzeBlocks(blocks: Block[], username: string): ProfileQualityResult['stats'] {
  // Flatten all blocks including nested ones
  const flatBlocks = flattenBlocks(blocks);

  // Count total blocks
  const totalBlocks = flatBlocks.length;

  // Analyze content fields
  let filledContentFields = 0;
  let totalContentFields = 0;

  for (const block of flatBlocks) {
    const fields = CONTENT_FIELDS[block.type] || [];
    for (const field of fields) {
      totalContentFields++;
      const value = block.props[field];
      if (value !== undefined && value !== null && value !== '') {
        // Check if it's an array and has items
        if (Array.isArray(value) && value.length > 0) {
          filledContentFields++;
        } else if (typeof value === 'string' && value.trim() !== '') {
          filledContentFields++;
        }
      }
    }
  }

  // Count unique categories
  const categories = new Set<string>();
  for (const block of flatBlocks) {
    const category = BLOCK_CATEGORIES_MAP[block.type];
    if (category) {
      categories.add(category);
    }
  }
  const uniqueCategories = categories.size;

  // Check for specific elements
  const hasUsername = username.trim().length > 0;
  const hasAvatar = flatBlocks.some((b) => b.type === 'avatar');
  const hasSocialLinks = flatBlocks.some((b) => b.type === 'social-badges');
  const hasGitHubStats = flatBlocks.some(
    (b) =>
      b.type === 'stats-card' ||
      b.type === 'stats-row' ||
      b.type === 'top-languages' ||
      b.type === 'streak-stats' ||
      b.type === 'activity-graph' ||
      b.type === 'trophies' ||
      b.type === 'wakatime-stats',
  );

  return {
    totalBlocks,
    filledContentFields,
    totalContentFields,
    uniqueCategories,
    hasUsername,
    hasAvatar,
    hasSocialLinks,
    hasGitHubStats,
  };
}

/**
 * Flatten nested blocks into a single array
 */
function flattenBlocks(blocks: Block[]): Block[] {
  const result: Block[] = [];

  function traverse(blocksToProcess: Block[]) {
    for (const block of blocksToProcess) {
      result.push(block);
      if (block.children && block.children.length > 0) {
        traverse(block.children);
      }
    }
  }

  traverse(blocks);
  return result;
}

/**
 * Calculate the breakdown of scores for each category
 */
function calculateBreakdown(
  stats: ProfileQualityResult['stats'],
  weights: QualityWeights,
): ProfileQualityResult['breakdown'] {
  // Blocks score (0-100)
  // Strict scoring: few blocks should give very low score
  let blocksScore = 0;
  if (stats.totalBlocks === 0) {
    blocksScore = 0;
  } else if (stats.totalBlocks >= SCORING_THRESHOLDS.excellentBlocks) {
    blocksScore = 100;
  } else if (stats.totalBlocks >= SCORING_THRESHOLDS.goodBlocks) {
    // Interpolate between good (10) and excellent (15)
    blocksScore =
      70 +
      (30 * (stats.totalBlocks - SCORING_THRESHOLDS.minBlocks)) /
        (SCORING_THRESHOLDS.goodBlocks - SCORING_THRESHOLDS.minBlocks);
  } else if (stats.totalBlocks >= SCORING_THRESHOLDS.minBlocks) {
    // Interpolate between min (5) and good (10)
    blocksScore = (70 * (stats.totalBlocks - 1)) / (SCORING_THRESHOLDS.minBlocks - 1);
  } else {
    // Very few blocks - give a low score (exponential decay)
    blocksScore = Math.max(0, 30 - (5 - stats.totalBlocks) * 15);
  }
  blocksScore = Math.min(100, Math.max(0, Math.round(blocksScore)));

  // Content score (0-100)
  let contentScore = 0;
  const contentFillRatio =
    stats.totalContentFields > 0 ? stats.filledContentFields / stats.totalContentFields : 0;

  if (contentFillRatio >= SCORING_THRESHOLDS.excellentContentFill) {
    contentScore = 100;
  } else if (contentFillRatio >= SCORING_THRESHOLDS.goodContentFill) {
    contentScore =
      70 +
      (30 * (contentFillRatio - SCORING_THRESHOLDS.minContentFill)) /
        (SCORING_THRESHOLDS.goodContentFill - SCORING_THRESHOLDS.minContentFill);
  } else if (contentFillRatio >= SCORING_THRESHOLDS.minContentFill) {
    contentScore = (70 * contentFillRatio) / SCORING_THRESHOLDS.minContentFill;
  } else {
    contentScore = (70 * contentFillRatio) / Math.max(0.01, SCORING_THRESHOLDS.minContentFill);
  }
  contentScore = Math.min(100, Math.round(contentScore));

  // Bonus for having key elements
  if (stats.hasUsername) contentScore = Math.min(100, contentScore + 10);
  if (stats.hasAvatar) contentScore = Math.min(100, contentScore + 5);
  if (stats.hasSocialLinks) contentScore = Math.min(100, contentScore + 5);

  // Variety score (0-100)
  // Stricter: 1 category should give a very low score
  let varietyScore = 0;
  if (stats.uniqueCategories === 0) {
    varietyScore = 0;
  } else if (stats.uniqueCategories >= SCORING_THRESHOLDS.excellentCategories) {
    varietyScore = 100;
  } else if (stats.uniqueCategories >= SCORING_THRESHOLDS.goodCategories) {
    varietyScore =
      50 +
      (50 * (stats.uniqueCategories - SCORING_THRESHOLDS.minCategories)) /
        (SCORING_THRESHOLDS.goodCategories - SCORING_THRESHOLDS.minCategories);
  } else if (stats.uniqueCategories >= SCORING_THRESHOLDS.minCategories) {
    // 2 categories: should give around 30-40 points
    varietyScore =
      25 + (25 * (stats.uniqueCategories - 1)) / (SCORING_THRESHOLDS.minCategories - 1);
  } else {
    // Only 1 category: very low score (exponential decay)
    varietyScore = Math.max(0, 20 - (2 - stats.uniqueCategories) * 15);
  }
  varietyScore = Math.min(100, Math.max(0, Math.round(varietyScore)));

  // Visual balance score (0-100)
  // Stricter: base should be lower, need more elements for good score
  let visualBalanceScore = 20; // Lower base score

  // Bonuses require having actual elements
  if (stats.totalBlocks >= 3) visualBalanceScore += 10;
  if (stats.totalBlocks >= 5) visualBalanceScore += 10;
  if (stats.totalBlocks >= 10) visualBalanceScore += 10;
  if (stats.uniqueCategories >= 3) visualBalanceScore += 15;
  if (stats.uniqueCategories >= 5) visualBalanceScore += 15;
  if (stats.hasGitHubStats) visualBalanceScore += 10;
  if (stats.hasSocialLinks) visualBalanceScore += 10;
  if (stats.hasAvatar) visualBalanceScore += 5;
  if (stats.hasUsername) visualBalanceScore += 5;

  visualBalanceScore = Math.min(100, Math.max(0, visualBalanceScore));

  return {
    blocks: Math.round((blocksScore * weights.blocks) / 100),
    content: Math.round((contentScore * weights.content) / 100),
    variety: Math.round((varietyScore * weights.variety) / 100),
    visualBalance: Math.round((visualBalanceScore * weights.visualBalance) / 100),
  };
}

/**
 * Generate suggestions for improving the profile
 */
function generateSuggestions(
  stats: ProfileQualityResult['stats'],
  breakdown: ProfileQualityResult['breakdown'],
): QualitySuggestion[] {
  const suggestions: QualitySuggestion[] = [];

  // Block quantity suggestions
  if (stats.totalBlocks < SCORING_THRESHOLDS.minBlocks) {
    suggestions.push({
      category: 'blocks',
      title: 'Add more blocks',
      description: `Your profile only has ${stats.totalBlocks} block(s). Add at least ${SCORING_THRESHOLDS.minBlocks} blocks for a complete profile.`,
      priority: 'high',
    });
  } else if (
    stats.totalBlocks < SCORING_THRESHOLDS.goodBlocks &&
    breakdown.blocks < weightsToPercent(breakdown.blocks, DEFAULT_WEIGHTS.blocks)
  ) {
    suggestions.push({
      category: 'blocks',
      title: 'Expand your profile',
      description: `Consider adding more blocks (aim for ${SCORING_THRESHOLDS.goodBlocks}+) to make your profile more comprehensive.`,
      priority: 'medium',
    });
  }

  // Username suggestions
  if (!stats.hasUsername) {
    suggestions.push({
      category: 'content',
      title: 'Set your GitHub username',
      description:
        'Enter your GitHub username in the header to enable stats widgets and make your profile personalized.',
      priority: 'high',
    });
  }

  // Avatar suggestions
  if (!stats.hasAvatar) {
    suggestions.push({
      category: 'visualBalance',
      title: 'Add an avatar',
      description:
        'Add an avatar block to personalize your profile with your GitHub profile picture.',
      priority: 'medium',
    });
  }

  // Social links suggestions
  if (!stats.hasSocialLinks) {
    suggestions.push({
      category: 'content',
      title: 'Add social links',
      description:
        'Add social badges to connect your LinkedIn, Twitter, portfolio, or other social profiles.',
      priority: 'medium',
    });
  }

  // GitHub stats suggestions
  if (!stats.hasGitHubStats) {
    suggestions.push({
      category: 'variety',
      title: 'Add GitHub stats',
      description:
        'Include stats cards, streak stats, top languages, or activity graph to showcase your contributions.',
      priority: 'high',
    });
  }

  // Variety suggestions
  if (stats.uniqueCategories < SCORING_THRESHOLDS.minCategories) {
    suggestions.push({
      category: 'variety',
      title: 'Add more variety',
      description: `Your profile only has blocks from ${stats.uniqueCategories} category(ies). Add blocks from different categories like Hero, Content, Media, Social, and GitHub Stats.`,
      priority: 'medium',
    });
  }

  // Content fill suggestions
  const contentFillRatio =
    stats.totalContentFields > 0 ? stats.filledContentFields / stats.totalContentFields : 0;

  if (contentFillRatio < SCORING_THRESHOLDS.minContentFill && stats.totalBlocks > 0) {
    suggestions.push({
      category: 'content',
      title: 'Fill in block content',
      description:
        'Some blocks have empty fields. Fill in all text fields to make your profile complete.',
      priority: 'high',
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return suggestions.slice(0, 5); // Limit to top 5 suggestions
}

/**
 * Helper to calculate percentage from raw score and max
 */
function weightsToPercent(rawScore: number, maxWeight: number): number {
  return Math.round((rawScore / maxWeight) * 100);
}

/**
 * Calculate letter grade from percentage
 */
function calculateGrade(percentage: number): ProfileQualityResult['grade'] {
  if (percentage >= 95) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 75) return 'B+';
  if (percentage >= 65) return 'B';
  if (percentage >= 55) return 'C+';
  if (percentage >= 45) return 'C';
  if (percentage >= 35) return 'D';
  return 'F';
}

/**
 * Get color for the score grade
 */
export function getGradeColor(grade: ProfileQualityResult['grade']): string {
  switch (grade) {
    case 'A+':
    case 'A':
      return 'text-green-500';
    case 'B+':
    case 'B':
      return 'text-lime-500';
    case 'C+':
    case 'C':
      return 'text-yellow-500';
    case 'D':
      return 'text-orange-500';
    case 'F':
      return 'text-red-500';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Get background color for the score grade
 */
export function getGradeBgColor(grade: ProfileQualityResult['grade']): string {
  switch (grade) {
    case 'A+':
    case 'A':
      return 'bg-green-500/10';
    case 'B+':
    case 'B':
      return 'bg-lime-500/10';
    case 'C+':
    case 'C':
      return 'bg-yellow-500/10';
    case 'D':
      return 'bg-orange-500/10';
    case 'F':
      return 'bg-red-500/10';
    default:
      return 'bg-muted';
  }
}
