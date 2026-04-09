// Color extraction and transfer utilities for blocks

import type { Block, BlockType } from './types';

/**
 * Represents extracted color properties from a block
 */
export interface ExtractedColors {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderStyle?: string;
  shadowColor?: string;
  accentColor?: string;
  secondaryColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  iconColor?: string;
  titleColor?: string;
  fireColor?: string;
  ringColor?: string;
  currStreakColor?: string;
  sideNumColor?: string;
  sideLabelColor?: string;
  datesColor?: string;
  lineColor?: string;
  pointColor?: string;
  areaColor?: string;
  waveColor?: string;
  fontColor?: string;
  labelColor?: string;
  logoColor?: string;
  color?: string;
  theme?: string;
  [key: string]: string | undefined;
}

/**
 * Mapping of block types to their color property names
 * This helps identify which color properties are available for each block type
 */
const BLOCK_COLOR_PROPERTIES: Record<BlockType, string[]> = {
  'capsule-header': ['color', 'fontColor', 'bgSolidColor', 'bgStartColor', 'bgEndColor'],
  avatar: ['borderColor'],
  greeting: [],
  'typing-animation': ['color'],
  heading: [],
  paragraph: [],
  collapsible: [],
  'code-block': [],
  image: [],
  gif: [],
  'social-badges': [],
  'custom-badge': ['color', 'labelColor', 'logoColor'],
  'skill-icons': [],
  'stats-card': ['bgColor', 'textColor', 'titleColor', 'iconColor'],
  'stats-row': [],
  'top-languages': ['bgColor', 'textColor', 'titleColor'],
  'streak-stats': [
    'bgColor',
    'textColor',
    'fireColor',
    'ringColor',
    'currStreakColor',
    'sideNumColor',
    'sideLabelColor',
    'datesColor',
  ],
  'activity-graph': ['bgColor', 'color', 'lineColor', 'pointColor', 'areaColor'],
  trophies: [],
  'visitor-counter': ['color'],
  quote: ['theme'],
  'footer-banner': ['waveColor', 'fontColor'],
  divider: ['color'],
  spacer: [],
  'support-link': [],
};

/**
 * Common color property patterns that might exist in block props
 * These are checked in addition to block-specific properties
 */
const COMMON_COLOR_PATTERNS = [
  'color',
  'bgColor',
  'textColor',
  'borderColor',
  'fontColor',
  'backgroundColor',
  'secondaryColor',
  'accentColor',
  'labelColor',
  'titleColor',
  'iconColor',
  'logoColor',
  'waveColor',
  'fireColor',
  'ringColor',
  'currStreakColor',
  'sideNumColor',
  'sideLabelColor',
  'datesColor',
  'lineColor',
  'pointColor',
  'areaColor',
  'bgSolidColor',
  'bgStartColor',
  'bgEndColor',
  'theme',
];

/**
 * Extracts all color properties from a block
 * @param block The block to extract colors from
 * @returns Object containing all color properties with their values
 */
export function extractColorsFromBlock(block: Block): ExtractedColors {
  const colors: ExtractedColors = {};
  const props = block.props;

  // Check block-specific color properties first
  const blockSpecificColors = BLOCK_COLOR_PROPERTIES[block.type] || [];

  for (const colorProp of blockSpecificColors) {
    if (props[colorProp] !== undefined) {
      colors[colorProp] = props[colorProp] as string;
    }
  }

  // Also check common color patterns that might exist
  for (const pattern of COMMON_COLOR_PATTERNS) {
    if (props[pattern] !== undefined && colors[pattern] === undefined) {
      // Only add if it's a valid color value (not empty string, not undefined)
      const value = props[pattern];
      if (typeof value === 'string' && value.length > 0) {
        colors[pattern] = value;
      }
    }
  }

  return colors;
}

/**
 * Gets available color properties for a specific block type
 * @param blockType The type of block
 * @returns Array of color property names that can be extracted
 */
export function getAvailableColorProperties(blockType: BlockType): string[] {
  const specific = BLOCK_COLOR_PROPERTIES[blockType] || [];
  return [...specific];
}

/**
 * Applies extracted colors to a target block
 * @param targetBlock The block to apply colors to
 * @param colors The colors to apply
 * @param selectedProperties Optional array of specific properties to apply (if not provided, applies all)
 * @returns Updated block props
 */
export function applyColorsToBlock(
  targetBlock: Block,
  colors: ExtractedColors,
  selectedProperties?: string[],
): Record<string, unknown> {
  const updatedProps: Record<string, unknown> = {};

  // Determine which properties to apply
  const propertiesToApply = selectedProperties || Object.keys(colors);

  for (const prop of propertiesToApply) {
    if (colors[prop] !== undefined) {
      updatedProps[prop] = colors[prop];
    }
  }

  return updatedProps;
}

/**
 * Gets a human-readable label for a color property
 * @param propertyName The property name
 * @returns Human-readable label
 */
export function getColorPropertyLabel(propertyName: string): string {
  const labels: Record<string, string> = {
    color: 'Primary Color',
    bgColor: 'Background Color',
    textColor: 'Text Color',
    borderColor: 'Border Color',
    fontColor: 'Font Color',
    backgroundColor: 'Background Color',
    secondaryColor: 'Secondary Color',
    accentColor: 'Accent Color',
    labelColor: 'Label Color',
    titleColor: 'Title Color',
    iconColor: 'Icon Color',
    logoColor: 'Logo Color',
    waveColor: 'Wave Color',
    fireColor: 'Fire Color',
    ringColor: 'Ring Color',
    currStreakColor: 'Current Streak Color',
    sideNumColor: 'Side Number Color',
    sideLabelColor: 'Side Label Color',
    datesColor: 'Dates Color',
    lineColor: 'Line Color',
    pointColor: 'Point Color',
    areaColor: 'Area Color',
    bgSolidColor: 'Solid Background',
    bgStartColor: 'Gradient Start',
    bgEndColor: 'Gradient End',
    theme: 'Theme',
    shadowColor: 'Shadow Color',
    gradientStart: 'Gradient Start',
    gradientEnd: 'Gradient End',
  };

  return labels[propertyName] || propertyName;
}

/**
 * Checks if a property name is a color-related property
 * @param propertyName The property name to check
 * @returns true if it's a color property
 */
export function isColorProperty(propertyName: string): boolean {
  const colorPatterns: RegExp[] = [
    /color$/i,
    /Color$/,
    /^bg/i,
    /^border/i,
    /^font/i,
    /^text/i,
    /^wave/i,
    /^fire/i,
    /^ring/i,
    /^gradient/i,
    /^shadow/i,
  ];

  const exactMatches = ['theme'];

  return (
    colorPatterns.some((pattern) => pattern.test(propertyName)) ||
    exactMatches.includes(propertyName)
  );
}

/**
 * Gets blocks that can receive color transfers (blocks with color properties)
 * @param blocks Array of blocks
 * @returns Array of blocks that have color properties
 */
export function getBlocksWithColors(blocks: Block[]): Block[] {
  return blocks.filter((block) => {
    const colors = extractColorsFromBlock(block);
    return Object.keys(colors).length > 0;
  });
}
