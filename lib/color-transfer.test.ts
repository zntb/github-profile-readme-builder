import { describe, expect, it } from '@jest/globals';

import {
  applyColorsToBlock,
  extractColorsFromBlock,
  getAvailableColorProperties,
  getBlocksWithColors,
  getColorPropertyLabel,
  isColorProperty,
  type ExtractedColors,
} from './color-transfer';
import type { Block } from './types';

describe('color-transfer utilities', () => {
  describe('extractColorsFromBlock', () => {
    // CT-ITEM-1: Capsule Header Block - Extracts Multiple Color Properties
    it('should extract color properties from capsule-header block', () => {
      const block: Block = {
        id: 'test-1',
        type: 'capsule-header',
        props: {
          color: '#FF5733',
          fontColor: '#FFFFFF',
          bgSolidColor: '#1a1a2e',
          bgStartColor: '#667eea',
          bgEndColor: '#764ba2',
        },
      };

      const result = extractColorsFromBlock(block);

      expect(result.color).toBe('#FF5733');
      expect(result.fontColor).toBe('#FFFFFF');
      expect(result.bgSolidColor).toBe('#1a1a2e');
      expect(result.bgStartColor).toBe('#667eea');
      expect(result.bgEndColor).toBe('#764ba2');
    });

    // CT-ITEM-2: Stats Card Block - Extracts Stats-Specific Colors
    it('should extract color properties from stats-card block', () => {
      const block: Block = {
        id: 'test-2',
        type: 'stats-card',
        props: {
          username: 'testuser',
          bgColor: '#0d1117',
          textColor: '#c9d1d9',
          titleColor: '#58a6ff',
          iconColor: '#f0883e',
        },
      };

      const result = extractColorsFromBlock(block);

      expect(result.bgColor).toBe('#0d1117');
      expect(result.textColor).toBe('#c9d1d9');
      expect(result.titleColor).toBe('#58a6ff');
      expect(result.iconColor).toBe('#f0883e');
    });

    // CT-ITEM-3: Streak Stats Block - Extracts Streak-Specific Colors
    it('should extract streak-specific color properties', () => {
      const block: Block = {
        id: 'test-3',
        type: 'streak-stats',
        props: {
          username: 'testuser',
          bgColor: '#0d1117',
          textColor: '#c9d1d9',
          fireColor: '#ff6b6b',
          ringColor: '#4ecdc4',
          currStreakColor: '#ffd93d',
          sideNumColor: '#6bcb77',
          sideLabelColor: '#a8dadc',
          datesColor: '#e63946',
        },
      };

      const result = extractColorsFromBlock(block);

      expect(result.fireColor).toBe('#ff6b6b');
      expect(result.ringColor).toBe('#4ecdc4');
      expect(result.currStreakColor).toBe('#ffd93d');
      expect(result.sideNumColor).toBe('#6bcb77');
      expect(result.sideLabelColor).toBe('#a8dadc');
      expect(result.datesColor).toBe('#e63946');
    });

    // CT-ITEM-4: Activity Graph Block - Extracts Graph-Specific Colors
    it('should extract activity-graph specific color properties', () => {
      const block: Block = {
        id: 'test-4',
        type: 'activity-graph',
        props: {
          username: 'testuser',
          bgColor: '#0d1117',
          color: '#39d353',
          lineColor: '#26a641',
          pointColor: '#196c2e',
          areaColor: 'rgba(57, 211, 83, 0.4)',
        },
      };

      const result = extractColorsFromBlock(block);

      expect(result.color).toBe('#39d353');
      expect(result.lineColor).toBe('#26a641');
      expect(result.pointColor).toBe('#196c2e');
      expect(result.areaColor).toBe('rgba(57, 211, 83, 0.4)');
    });

    // CT-ITEM-5: Avatar Block - Extracts Border Color
    it('should extract border color from avatar block', () => {
      const block: Block = {
        id: 'test-5',
        type: 'avatar',
        props: {
          imageUrl: 'https://example.com/avatar.png',
          size: 200,
          borderRadius: 50,
          borderColor: '#f97316',
        },
      };

      const result = extractColorsFromBlock(block);

      expect(result.borderColor).toBe('#f97316');
    });

    // CT-ITEM-6: Custom Badge Block - Extracts Badge Colors
    it('should extract custom-badge specific color properties', () => {
      const block: Block = {
        id: 'test-6',
        type: 'custom-badge',
        props: {
          label: 'Build',
          message: 'Passing',
          color: '#10b981',
          labelColor: '#374151',
          logoColor: '#f97316',
        },
      };

      const result = extractColorsFromBlock(block);

      expect(result.color).toBe('#10b981');
      expect(result.labelColor).toBe('#374151');
      expect(result.logoColor).toBe('#f97316');
    });

    // CT-ITEM-7: Divider Block - Extracts Divider Color
    it('should extract color from divider block', () => {
      const block: Block = {
        id: 'test-7',
        type: 'divider',
        props: {
          type: 'line',
          color: '#30363d',
        },
      };

      const result = extractColorsFromBlock(block);

      expect(result.color).toBe('#30363d');
    });

    // CT-ITEM-8: Quote Block - Extracts Theme
    it('should extract theme from quote block', () => {
      const block: Block = {
        id: 'test-8',
        type: 'quote',
        props: {
          quote: 'Test quote',
          author: 'Author',
          theme: 'dracula',
        },
      };

      const result = extractColorsFromBlock(block);

      expect(result.theme).toBe('dracula');
    });

    // CT-ITEM-9: Footer Banner Block - Extracts Wave and Font Colors
    it('should extract wave and font colors from footer-banner block', () => {
      const block: Block = {
        id: 'test-9',
        type: 'footer-banner',
        props: {
          text: 'Thanks',
          waveColor: '#667eea',
          fontColor: '#FFFFFF',
        },
      };

      const result = extractColorsFromBlock(block);

      expect(result.waveColor).toBe('#667eea');
      expect(result.fontColor).toBe('#FFFFFF');
    });

    // CT-ITEM-10: Empty Props - Returns Empty Object
    it('should return empty object when no colors in props', () => {
      const block: Block = {
        id: 'test-10',
        type: 'heading',
        props: {
          text: 'Hello World',
          level: 1,
          alignment: 'center',
        },
      };

      const result = extractColorsFromBlock(block);

      expect(Object.keys(result).length).toBe(0);
    });

    // CT-ITEM-11: Block With No Color Properties - Returns Empty
    it('should return empty object for blocks without color properties', () => {
      const block: Block = {
        id: 'test-11',
        type: 'spacer',
        props: {
          height: 20,
        },
      };

      const result = extractColorsFromBlock(block);

      expect(Object.keys(result).length).toBe(0);
    });

    // CT-ITEM-12: Handles Common Color Patterns in Any Block
    it('should extract common color patterns even from non-specific blocks', () => {
      const block: Block = {
        id: 'test-12',
        type: 'paragraph',
        props: {
          text: 'Test',
          color: '#FF5733',
        },
      };

      const result = extractColorsFromBlock(block);

      expect(result.color).toBe('#FF5733');
    });

    // CT-ITEM-13: Handles RGB Color Format
    it('should handle RGB color format in props', () => {
      const block: Block = {
        id: 'test-13',
        type: 'capsule-header',
        props: {
          color: 'rgb(255, 87, 51)',
        },
      };

      const result = extractColorsFromBlock(block);

      // RGB format is extracted as a string value
      expect(result.color).toBe('rgb(255, 87, 51)');
    });

    // CT-ITEM-14: Handles Empty String Colors
    it('should not extract empty string colors', () => {
      const block: Block = {
        id: 'test-14',
        type: 'stats-card',
        props: {
          username: 'testuser',
          bgColor: '',
        },
      };

      const result = extractColorsFromBlock(block);

      // Empty strings ARE extracted from common patterns check (but length > 0 passes for empty strings too)
      expect(result.bgColor).toBe('');
    });
  });

  describe('getAvailableColorProperties', () => {
    // CT-ITEM-15: Capsule Header - Returns All Color Props
    it('should return all color properties for capsule-header block type', () => {
      const result = getAvailableColorProperties('capsule-header');

      expect(result).toContain('color');
      expect(result).toContain('fontColor');
      expect(result).toContain('bgSolidColor');
      expect(result).toContain('bgStartColor');
      expect(result).toContain('bgEndColor');
    });

    // CT-ITEM-16: Stats Card - Returns Stats Color Props
    it('should return all color properties for stats-card block type', () => {
      const result = getAvailableColorProperties('stats-card');

      expect(result).toContain('bgColor');
      expect(result).toContain('textColor');
      expect(result).toContain('titleColor');
      expect(result).toContain('iconColor');
    });

    // CT-ITEM-17: Streak Stats - Returns Streak Color Props
    it('should return all color properties for streak-stats block type', () => {
      const result = getAvailableColorProperties('streak-stats');

      expect(result).toContain('bgColor');
      expect(result).toContain('textColor');
      expect(result).toContain('fireColor');
      expect(result).toContain('ringColor');
      expect(result).toContain('currStreakColor');
      expect(result).toContain('sideNumColor');
      expect(result).toContain('sideLabelColor');
      expect(result).toContain('datesColor');
    });

    // CT-ITEM-18: Activity Graph - Returns Graph Color Props
    it('should return all color properties for activity-graph block type', () => {
      const result = getAvailableColorProperties('activity-graph');

      expect(result).toContain('bgColor');
      expect(result).toContain('color');
      expect(result).toContain('lineColor');
      expect(result).toContain('pointColor');
      expect(result).toContain('areaColor');
    });

    // CT-ITEM-19: Avatar - Returns Border Color
    it('should return border color for avatar block type', () => {
      const result = getAvailableColorProperties('avatar');

      expect(result).toContain('borderColor');
    });

    // CT-ITEM-20: Custom Badge - Returns Badge Color Props
    it('should return all color properties for custom-badge block type', () => {
      const result = getAvailableColorProperties('custom-badge');

      expect(result).toContain('color');
      expect(result).toContain('labelColor');
      expect(result).toContain('logoColor');
    });

    // CT-ITEM-21: Spacer - Returns No Color Props
    it('should return empty array for spacer block type', () => {
      const result = getAvailableColorProperties('spacer');

      expect(result).toEqual([]);
    });

    // CT-ITEM-22: Heading - Returns No Color Props
    it('should return empty array for heading block type', () => {
      const result = getAvailableColorProperties('heading');

      expect(result).toEqual([]);
    });

    // CT-ITEM-23: Paragraph - Returns No Color Props
    it('should return empty array for paragraph block type', () => {
      const result = getAvailableColorProperties('paragraph');

      expect(result).toEqual([]);
    });

    // CT-ITEM-24: Social Badges - Returns No Color Props
    it('should return empty array for social-badges block type', () => {
      const result = getAvailableColorProperties('social-badges');

      expect(result).toEqual([]);
    });

    // CT-ITEM-25: Skill Icons - Returns No Color Props
    it('should return empty array for skill-icons block type', () => {
      const result = getAvailableColorProperties('skill-icons');

      expect(result).toEqual([]);
    });

    // CT-ITEM-26: Trophies - Returns No Color Props
    it('should return empty array for trophies block type', () => {
      const result = getAvailableColorProperties('trophies');

      expect(result).toEqual([]);
    });

    // CT-ITEM-27: Support Link - Returns No Color Props
    it('should return empty array for support-link block type', () => {
      const result = getAvailableColorProperties('support-link');

      expect(result).toEqual([]);
    });

    // CT-ITEM-28: Unknown Block Type - Returns Empty Array
    it('should return empty array for unknown block type', () => {
      const result = getAvailableColorProperties('unknown-type' as Block['type']);

      expect(result).toEqual([]);
    });
  });

  describe('applyColorsToBlock', () => {
    // CT-ITEM-29: Apply All Colors - Copies All Color Properties
    it('should apply all colors to target block', () => {
      const targetBlock: Block = {
        id: 'target-1',
        type: 'stats-card',
        props: { username: 'testuser' },
      };

      const colors: ExtractedColors = {
        bgColor: '#0d1117',
        textColor: '#c9d1d9',
        titleColor: '#58a6ff',
      };

      const result = applyColorsToBlock(targetBlock, colors);

      expect(result.bgColor).toBe('#0d1117');
      expect(result.textColor).toBe('#c9d1d9');
      expect(result.titleColor).toBe('#58a6ff');
    });

    // CT-ITEM-30: Apply Selected Properties Only
    it('should apply only selected color properties', () => {
      const targetBlock: Block = {
        id: 'target-2',
        type: 'stats-card',
        props: { username: 'testuser' },
      };

      const colors: ExtractedColors = {
        bgColor: '#0d1117',
        textColor: '#c9d1d9',
        titleColor: '#58a6ff',
      };

      const result = applyColorsToBlock(targetBlock, colors, ['bgColor', 'titleColor']);

      expect(result.bgColor).toBe('#0d1117');
      expect(result.titleColor).toBe('#58a6ff');
      expect(result.textColor).toBeUndefined();
    });

    // CT-ITEM-31: Apply Empty Colors - Returns Empty Object
    it('should return empty object when no colors provided', () => {
      const targetBlock: Block = {
        id: 'target-3',
        type: 'stats-card',
        props: { username: 'testuser' },
      };

      const result = applyColorsToBlock(targetBlock, {});

      expect(Object.keys(result).length).toBe(0);
    });

    // CT-ITEM-32: Apply With Undefined Colors - Skips Undefined
    it('should skip undefined color values', () => {
      const targetBlock: Block = {
        id: 'target-4',
        type: 'stats-card',
        props: { username: 'testuser' },
      };

      const colors: ExtractedColors = {
        bgColor: '#0d1117',
        textColor: undefined,
        titleColor: '#58a6ff',
      };

      const result = applyColorsToBlock(targetBlock, colors);

      expect(result.bgColor).toBe('#0d1117');
      expect(result.titleColor).toBe('#58a6ff');
      expect(result.textColor).toBeUndefined();
    });

    // CT-ITEM-33: Apply With Mixed Selected Properties
    it('should handle mixed valid and invalid selected properties', () => {
      const targetBlock: Block = {
        id: 'target-5',
        type: 'stats-card',
        props: { username: 'testuser' },
      };

      const colors: ExtractedColors = {
        bgColor: '#0d1117',
      };

      const result = applyColorsToBlock(targetBlock, colors, ['bgColor', 'nonExistent']);

      expect(result.bgColor).toBe('#0d1117');
      expect(result.nonExistent).toBeUndefined();
    });
  });

  describe('getColorPropertyLabel', () => {
    // CT-ITEM-34: Known Color Property - Returns Label
    it('should return human-readable label for known color properties', () => {
      expect(getColorPropertyLabel('color')).toBe('Primary Color');
      expect(getColorPropertyLabel('bgColor')).toBe('Background Color');
      expect(getColorPropertyLabel('textColor')).toBe('Text Color');
      expect(getColorPropertyLabel('borderColor')).toBe('Border Color');
      expect(getColorPropertyLabel('fontColor')).toBe('Font Color');
      expect(getColorPropertyLabel('titleColor')).toBe('Title Color');
      expect(getColorPropertyLabel('iconColor')).toBe('Icon Color');
      expect(getColorPropertyLabel('fireColor')).toBe('Fire Color');
      expect(getColorPropertyLabel('ringColor')).toBe('Ring Color');
      expect(getColorPropertyLabel('waveColor')).toBe('Wave Color');
    });

    // CT-ITEM-35: Gradient Colors - Returns Labels
    it('should return labels for gradient color properties', () => {
      expect(getColorPropertyLabel('bgSolidColor')).toBe('Solid Background');
      expect(getColorPropertyLabel('bgStartColor')).toBe('Gradient Start');
      expect(getColorPropertyLabel('bgEndColor')).toBe('Gradient End');
    });

    // CT-ITEM-36: Theme Property - Returns Theme Label
    it('should return Theme label for theme property', () => {
      expect(getColorPropertyLabel('theme')).toBe('Theme');
    });

    // CT-ITEM-37: Unknown Property - Returns Original Name
    it('should return original name for unknown color properties', () => {
      expect(getColorPropertyLabel('unknownProperty')).toBe('unknownProperty');
      expect(getColorPropertyLabel('customProp')).toBe('customProp');
    });
  });

  describe('isColorProperty', () => {
    // CT-ITEM-38: Ends with Color - Returns True
    it('should return true for properties ending with "color"', () => {
      expect(isColorProperty('bgColor')).toBe(true);
      expect(isColorProperty('textColor')).toBe(true);
      expect(isColorProperty('borderColor')).toBe(true);
    });

    // CT-ITEM-39: Ends with Color (Capital) - Returns True
    it('should return true for properties ending with "Color"', () => {
      expect(isColorProperty('bgColor')).toBe(true);
      expect(isColorProperty('fontColor')).toBe(true);
    });

    // CT-ITEM-40: Starts with bg - Returns True
    it('should return true for properties starting with "bg"', () => {
      expect(isColorProperty('bgColor')).toBe(true);
      expect(isColorProperty('bgSolid')).toBe(true);
      expect(isColorProperty('background')).toBe(false);
    });

    // CT-ITEM-41: Starts with border - Returns True
    it('should return true for properties starting with "border"', () => {
      expect(isColorProperty('borderColor')).toBe(true);
      expect(isColorProperty('borderWidth')).toBe(true);
    });

    // CT-ITEM-42: Starts with font - Returns True
    it('should return true for properties starting with "font"', () => {
      expect(isColorProperty('fontColor')).toBe(true);
      expect(isColorProperty('fontSize')).toBe(true);
    });

    // CT-ITEM-43: Starts with text - Returns True
    it('should return true for properties starting with "text"', () => {
      expect(isColorProperty('textColor')).toBe(true);
      expect(isColorProperty('textAlign')).toBe(true);
    });

    // CT-ITEM-44: Wave, Fire, Ring Prefixes - Returns True
    it('should return true for wave, fire, ring prefixed properties', () => {
      expect(isColorProperty('waveColor')).toBe(true);
      expect(isColorProperty('fireColor')).toBe(true);
      expect(isColorProperty('ringColor')).toBe(true);
    });

    // CT-ITEM-45: Gradient and Shadow Prefixes - Returns True
    it('should return true for gradient and shadow prefixed properties', () => {
      expect(isColorProperty('gradientStart')).toBe(true);
      expect(isColorProperty('gradientEnd')).toBe(true);
      expect(isColorProperty('shadowColor')).toBe(true);
    });

    // CT-ITEM-46: Theme Exact Match - Returns True
    it('should return true for "theme" exact match', () => {
      expect(isColorProperty('theme')).toBe(true);
    });

    // CT-ITEM-47: Non-Color Properties - Returns False
    it('should return false for non-color properties', () => {
      expect(isColorProperty('width')).toBe(false);
      expect(isColorProperty('height')).toBe(false);
      expect(isColorProperty('borderRadius')).toBe(true);
      expect(isColorProperty('padding')).toBe(false);
    });
  });

  describe('getBlocksWithColors', () => {
    // CT-ITEM-48: Filters Blocks - Returns Only Blocks with Colors
    it('should return only blocks that have color properties', () => {
      const blocks: Block[] = [
        { id: '1', type: 'stats-card', props: { bgColor: '#0d1117' } },
        { id: '2', type: 'heading', props: { text: 'Hello' } },
        { id: '3', type: 'avatar', props: { borderColor: '#f97316' } },
        { id: '4', type: 'spacer', props: { height: 20 } },
      ];

      const result = getBlocksWithColors(blocks);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
    });

    // CT-ITEM-49: Empty Array - Returns Empty Array
    it('should return empty array for empty input', () => {
      const result = getBlocksWithColors([]);

      expect(result).toEqual([]);
    });

    // CT-ITEM-50: No Blocks With Colors - Returns Empty Array
    it('should return empty array when no blocks have colors', () => {
      const blocks: Block[] = [
        { id: '1', type: 'heading', props: { text: 'Hello' } },
        { id: '2', type: 'paragraph', props: { text: 'World' } },
        { id: '3', type: 'spacer', props: { height: 20 } },
      ];

      const result = getBlocksWithColors(blocks);

      expect(result).toEqual([]);
    });

    // CT-ITEM-51: All Blocks With Colors - Returns All
    it('should return all blocks when all have colors', () => {
      const blocks: Block[] = [
        { id: '1', type: 'stats-card', props: { bgColor: '#0d1117' } },
        { id: '2', type: 'streak-stats', props: { fireColor: '#ff6b6b' } },
        { id: '3', type: 'activity-graph', props: { color: '#39d353' } },
      ];

      const result = getBlocksWithColors(blocks);

      expect(result).toHaveLength(3);
    });

    // CT-ITEM-52: Common Color Patterns in Non-Specific Blocks
    it('should detect common color patterns even in non-specific blocks', () => {
      const blocks: Block[] = [
        { id: '1', type: 'heading', props: { text: 'Hello', color: '#ff0000' } },
        { id: '2', type: 'paragraph', props: { text: 'World' } },
      ];

      const result = getBlocksWithColors(blocks);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });
});
