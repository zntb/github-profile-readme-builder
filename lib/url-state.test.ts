import { describe, expect, it } from '@jest/globals';

import type { Block, BlockType } from './types';
import { decodeStateFromUrl, encodeStateToUrl, generateId } from './url-state';

describe('url-state', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });

    it('should generate IDs with block- prefix', () => {
      const id = generateId();
      expect(id).toMatch(/^block-/);
    });
  });

  describe('encodeStateToUrl', () => {
    it('should encode empty blocks array', () => {
      const result = encodeStateToUrl([], 'testuser');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should encode blocks and username', () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'heading' as BlockType,
          props: { text: 'Hello', level: 1, alignment: 'left' },
        },
      ];
      const result = encodeStateToUrl(blocks, 'testuser');
      expect(result).toBeTruthy();
    });

    it('should produce URL-safe string', () => {
      const result = encodeStateToUrl([], 'testuser');
      // Should not contain + or / characters (base64 URL-safe)
      expect(result).not.toMatch(/[+/]/);
    });

    it('should handle special characters in username', () => {
      const result = encodeStateToUrl([], 'user-name_123');
      expect(result).toBeTruthy();
    });
  });

  describe('decodeStateFromUrl', () => {
    it('should decode valid encoded string', () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'heading' as BlockType,
          props: { text: 'Hello', level: 1, alignment: 'left' },
        },
      ];
      const encoded = encodeStateToUrl(blocks, 'testuser');
      const result = decodeStateFromUrl(encoded);

      expect(result).not.toBeNull();
      expect(result?.username).toBe('testuser');
      expect(result?.blocks).toHaveLength(1);
      expect(result?.blocks[0].type).toBe('heading');
    });

    it('should return null for empty string', () => {
      const result = decodeStateFromUrl('');
      expect(result).toBeNull();
    });

    it('should return null for invalid base64', () => {
      const result = decodeStateFromUrl('not-valid-base64!!!');
      expect(result).toBeNull();
    });

    it('should return null for corrupted data', () => {
      // First create valid data, then corrupt it
      const encoded = encodeStateToUrl([], 'testuser');
      const corrupted = encoded.slice(0, -5) + 'xxxxx';
      const result = decodeStateFromUrl(corrupted);
      expect(result).toBeNull();
    });

    it('should return null for missing blocks array', () => {
      // Manually create a valid base64 string with missing blocks
      const state = { u: 'testuser' };
      const json = JSON.stringify(state);
      const base64 = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      const result = decodeStateFromUrl(base64);
      expect(result).toBeNull();
    });
  });

  describe('encode/decode roundtrip', () => {
    it('should preserve data through encode/decode cycle', () => {
      const originalBlocks: Block[] = [
        {
          id: 'block-1',
          type: 'heading' as BlockType,
          props: { text: 'Hello', level: 1, alignment: 'left' },
        },
        {
          id: 'block-2',
          type: 'paragraph' as BlockType,
          props: { text: 'World', alignment: 'left' },
        },
        { id: 'block-3', type: 'spacer' as BlockType, props: { height: 20 } },
      ];
      const username = 'testuser';

      const encoded = encodeStateToUrl(originalBlocks, username);
      const decoded = decodeStateFromUrl(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded?.username).toBe(username);
      expect(decoded?.blocks).toHaveLength(3);
      expect(decoded?.blocks[0].props.text).toBe('Hello');
      expect(decoded?.blocks[1].props.text).toBe('World');
    });

    it('should handle complex nested objects in props', () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'stats-row' as BlockType,
          props: {
            stats: [
              { label: 'Stars', value: '100', icon: '⭐' },
              { label: 'Forks', value: '50', icon: '🍴' },
            ],
          },
        },
      ];

      const encoded = encodeStateToUrl(blocks, 'testuser');
      const decoded = decodeStateFromUrl(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded?.blocks[0].props.stats).toHaveLength(2);
    });
  });
});
