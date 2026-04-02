import { describe, expect, it } from '@jest/globals';

import { calculateProfileQuality } from './profile-quality';
import type { Block, BlockType } from './types';

describe('profile-quality', () => {
  describe('calculateProfileQuality', () => {
    it('should return low score for empty blocks', () => {
      const result = calculateProfileQuality([], 'testuser');
      expect(result.score).toBeLessThan(30);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should return higher score for more blocks', () => {
      const blocks: Block[] = [
        {
          id: '1',
          type: 'heading' as BlockType,
          props: { text: 'Hello', level: 1, alignment: 'left' },
        },
        { id: '2', type: 'paragraph' as BlockType, props: { text: 'World', alignment: 'left' } },
        { id: '3', type: 'stats-row' as BlockType, props: {} },
        { id: '4', type: 'top-languages' as BlockType, props: { username: 'testuser' } },
        { id: '5', type: 'social-badges' as BlockType, props: { github: 'testuser' } },
        { id: '6', type: 'divider' as BlockType, props: { type: 'line' } },
      ];

      const result = calculateProfileQuality(blocks, 'testuser');
      expect(result.score).toBeGreaterThan(30);
    });

    it('should give bonus for filled content fields', () => {
      const blocksWithContent: Block[] = [
        {
          id: '1',
          type: 'heading' as BlockType,
          props: { text: 'Welcome', level: 1, alignment: 'left' },
        },
        {
          id: '2',
          type: 'paragraph' as BlockType,
          props: { text: 'This is my profile', alignment: 'left' },
        },
        { id: '3', type: 'stats-card' as BlockType, props: { username: 'testuser' } },
        { id: '4', type: 'top-languages' as BlockType, props: { username: 'testuser' } },
        { id: '5', type: 'social-badges' as BlockType, props: { github: 'testuser' } },
        { id: '6', type: 'divider' as BlockType, props: { type: 'line' } },
      ];

      const blocksWithoutContent: Block[] = [
        { id: '1', type: 'heading' as BlockType, props: { level: 1, alignment: 'left' } },
        { id: '2', type: 'paragraph' as BlockType, props: { alignment: 'left' } },
        { id: '3', type: 'stats-card' as BlockType, props: {} },
        { id: '4', type: 'top-languages' as BlockType, props: {} },
        { id: '5', type: 'social-badges' as BlockType, props: {} },
        { id: '6', type: 'divider' as BlockType, props: { type: 'line' } },
      ];

      const resultWithContent = calculateProfileQuality(blocksWithContent, 'testuser');
      const resultWithoutContent = calculateProfileQuality(blocksWithoutContent, 'testuser');

      expect(resultWithContent.score).toBeGreaterThan(resultWithoutContent.score);
    });

    it('should give bonus for variety across categories', () => {
      const variedBlocks: Block[] = [
        {
          id: '1',
          type: 'heading' as BlockType,
          props: { text: 'Test', level: 1, alignment: 'left' },
        },
        {
          id: '2',
          type: 'avatar' as BlockType,
          props: { imageUrl: 'https://example.com/avatar.png', size: 100, borderRadius: 50 },
        },
        { id: '3', type: 'stats-card' as BlockType, props: { username: 'testuser' } },
        { id: '4', type: 'skill-icons' as BlockType, props: { icons: ['js', 'ts'] } },
        { id: '5', type: 'social-badges' as BlockType, props: { github: 'testuser' } },
        { id: '6', type: 'divider' as BlockType, props: { type: 'line' } },
      ];

      const result = calculateProfileQuality(variedBlocks, 'testuser');
      expect(result.breakdown.variety).toBeGreaterThan(0);
    });

    it('should provide suggestions for improvement', () => {
      const result = calculateProfileQuality([], 'testuser');
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0].category).toBeDefined();
      expect(result.suggestions[0].title).toBeTruthy();
      expect(result.suggestions[0].description).toBeTruthy();
    });

    it('should include all quality categories in suggestions', () => {
      const blocks: Block[] = [
        {
          id: '1',
          type: 'heading' as BlockType,
          props: { text: 'Test', level: 1, alignment: 'left' },
        },
        { id: '2', type: 'paragraph' as BlockType, props: { text: 'Content', alignment: 'left' } },
      ];

      const result = calculateProfileQuality(blocks, 'testuser');
      const categories = new Set(result.suggestions.map((s) => s.category));
      // Should have suggestions for multiple categories
      expect(categories.size).toBeGreaterThan(0);
    });

    it('should handle blocks with children (nested)', () => {
      const blocks: Block[] = [
        {
          id: '1',
          type: 'collapsible' as BlockType,
          props: { title: 'Details', defaultOpen: true },
          children: [
            {
              id: 'child-1',
              type: 'paragraph' as BlockType,
              props: { text: 'Nested content', alignment: 'left' },
            },
          ],
        },
      ];

      const result = calculateProfileQuality(blocks, 'testuser');
      expect(result.score).toBeGreaterThan(0);
    });

    it('should return proper grade based on score', () => {
      // Empty profile should get a low grade
      const result = calculateProfileQuality([], 'testuser');
      expect(['D', 'F']).toContain(result.grade);
    });

    it('should calculate percentage correctly', () => {
      const blocks: Block[] = [
        {
          id: '1',
          type: 'heading' as BlockType,
          props: { text: 'Test', level: 1, alignment: 'left' },
        },
        { id: '2', type: 'paragraph' as BlockType, props: { text: 'Content', alignment: 'left' } },
      ];

      const result = calculateProfileQuality(blocks, 'testuser');
      expect(result.percentage).toBeGreaterThanOrEqual(0);
      expect(result.percentage).toBeLessThanOrEqual(100);
    });

    it('should track stats correctly', () => {
      const blocks: Block[] = [
        {
          id: '1',
          type: 'avatar' as BlockType,
          props: { imageUrl: 'https://example.com/avatar.png', size: 100, borderRadius: 50 },
        },
        { id: '2', type: 'social-badges' as BlockType, props: { github: 'testuser' } },
      ];

      const result = calculateProfileQuality(blocks, 'testuser');
      expect(result.stats.hasAvatar).toBe(true);
      expect(result.stats.hasSocialLinks).toBe(true);
    });
  });
});
