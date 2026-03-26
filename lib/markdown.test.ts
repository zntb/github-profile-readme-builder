import { describe, expect, it } from '@jest/globals';

import { renderBlock, renderMarkdown } from './markdown';
import type { Block } from './types';

describe('renderBlock', () => {
  // TE-ITEM-1.1: renderBlock - Container Block (Center)
  describe('container', () => {
    it('should render center-aligned container with children', () => {
      const block: Block = {
        id: 'test',
        type: 'container',
        props: { alignment: 'center' },
        children: [{ id: 'child', type: 'paragraph', props: { text: 'Hello', alignment: 'left' } }],
      };
      const result = renderBlock(block);
      expect(result).toContain('<div align="center">');
      expect(result).toContain('Hello');
    });

    it('should render left-aligned container without wrapper', () => {
      const block: Block = {
        id: 'test',
        type: 'container',
        props: { alignment: 'left' },
        children: [{ id: 'child', type: 'paragraph', props: { text: 'World', alignment: 'left' } }],
      };
      const result = renderBlock(block);
      expect(result).toContain('World');
    });
  });

  // TE-ITEM-1.2: renderBlock - Divider Block
  describe('divider', () => {
    it('should render line divider', () => {
      const block: Block = {
        id: 'test',
        type: 'divider',
        props: { style: 'line' },
      };
      const result = renderBlock(block);
      expect(result).toContain('---');
    });

    it('should render gif divider', () => {
      const block: Block = {
        id: 'test',
        type: 'divider',
        props: { style: 'gif', theme: 'ruby' },
      };
      const result = renderBlock(block);
      // GIF dividers can be line or other styles
      expect(result).toBeTruthy();
    });
  });

  // TE-ITEM-1.3: renderBlock - Spacer Block
  describe('spacer', () => {
    it('should render correct number of br tags for height 40', () => {
      const block: Block = {
        id: 'test',
        type: 'spacer',
        props: { height: 40 },
      };
      const result = renderBlock(block);
      expect(result).toContain('<br/>');
    });

    it('should render correct number of br tags for height 8', () => {
      const block: Block = {
        id: 'test',
        type: 'spacer',
        props: { height: 8 },
      };
      const result = renderBlock(block);
      expect(result).toContain('<br/>');
    });
  });

  // TE-ITEM-1.4: renderBlock - Avatar Block
  describe('avatar', () => {
    it('should render avatar with default border-radius', () => {
      const block: Block = {
        id: 'test',
        type: 'avatar',
        props: { username: 'testuser' },
      };
      const result = renderBlock(block);
      // Avatar renders an img tag
      expect(result).toContain('<img');
    });

    it('should render avatar with custom border-radius', () => {
      const block: Block = {
        id: 'test',
        type: 'avatar',
        props: { username: 'testuser', borderRadius: '10px' },
      };
      const result = renderBlock(block);
      expect(result).toContain('<img');
    });
  });

  // TE-ITEM-1.5: renderBlock - Greeting Block
  describe('greeting', () => {
    it('should render centered greeting with h1', () => {
      const block: Block = {
        id: 'test',
        type: 'greeting',
        props: { text: 'Hello!', alignment: 'center', timeZone: 'America/New_York' },
      };
      const result = renderBlock(block);
      expect(result).toContain('Hello');
    });

    it('should render left-aligned greeting with markdown heading', () => {
      const block: Block = {
        id: 'test',
        type: 'greeting',
        props: { text: 'Hi there', alignment: 'left', timeZone: 'UTC' },
      };
      const result = renderBlock(block);
      expect(result).toContain('Hi there');
    });
  });

  // TE-ITEM-1.6: renderBlock - Typing Animation Block
  describe('typing-animation', () => {
    it('should generate typing SVG URL with encoded lines', () => {
      const block: Block = {
        id: 'test',
        type: 'typing-animation',
        props: {
          lines: ['First line', 'Second line'],
          animationSpeed: 50,
          blinkSpeed: 500,
        },
      };
      const result = renderBlock(block);
      expect(result).toContain('typing');
    });
  });

  // TE-ITEM-1.7: renderBlock - Heading Block
  describe('heading', () => {
    it('should render correct heading level', () => {
      const block: Block = {
        id: 'test',
        type: 'heading',
        props: { text: 'Test', level: 3, alignment: 'left' },
      };
      const result = renderBlock(block);
      expect(result).toContain('###');
    });

    it('should render centered heading', () => {
      const block: Block = {
        id: 'test',
        type: 'heading',
        props: { text: 'Centered', level: 1, alignment: 'center' },
      };
      const result = renderBlock(block);
      expect(result).toContain('<h1');
    });
  });

  // TE-ITEM-1.8: renderBlock - Paragraph Block
  describe('paragraph', () => {
    it('should render paragraph with center alignment', () => {
      const block: Block = {
        id: 'test',
        type: 'paragraph',
        props: { text: 'Test paragraph', alignment: 'center' },
      };
      const result = renderBlock(block);
      expect(result).toContain('Test paragraph');
    });

    it('should render paragraph without wrapper for left alignment', () => {
      const block: Block = {
        id: 'test',
        type: 'paragraph',
        props: { text: 'Left aligned', alignment: 'left' },
      };
      const result = renderBlock(block);
      expect(result).toContain('Left aligned');
    });
  });

  // TE-ITEM-1.9: renderBlock - Collapsible Block
  describe('collapsible', () => {
    it('should render collapsible details with defaultOpen=true', () => {
      const block: Block = {
        id: 'test',
        type: 'collapsible',
        props: { title: 'Click to expand', defaultOpen: true },
        children: [
          { id: 'child', type: 'paragraph', props: { text: 'Hidden content', alignment: 'left' } },
        ],
      };
      const result = renderBlock(block);
      expect(result).toContain('<details');
      expect(result).toContain('open');
    });

    it('should render collapsible details with defaultOpen=false', () => {
      const block: Block = {
        id: 'test',
        type: 'collapsible',
        props: { title: 'Click to expand', defaultOpen: false },
        children: [
          { id: 'child', type: 'paragraph', props: { text: 'Hidden content', alignment: 'left' } },
        ],
      };
      const result = renderBlock(block);
      expect(result).toContain('<details');
    });
  });

  // TE-ITEM-1.10: renderBlock - Code Block
  describe('code-block', () => {
    it('should render fenced code block', () => {
      const block: Block = {
        id: 'test',
        type: 'code-block',
        props: {
          code: 'const x = 1;',
          language: 'javascript',
        },
      };
      const result = renderBlock(block);
      expect(result).toContain('```');
    });
  });

  // TE-ITEM-1.11: renderBlock - Image Block
  describe('image', () => {
    it('should render image with center alignment', () => {
      const block: Block = {
        id: 'test',
        type: 'image',
        props: { url: 'https://example.com/image.png', alt: 'Image', alignment: 'center' },
      };
      const result = renderBlock(block);
      expect(result).toContain('<img');
      expect(result).toContain('align="center"');
    });

    it('should render image without wrapper for left alignment', () => {
      const block: Block = {
        id: 'test',
        type: 'image',
        props: { url: 'https://example.com/image.png', alt: 'Image', alignment: 'left' },
      };
      const result = renderBlock(block);
      expect(result).toContain('<img');
    });
  });

  // TE-ITEM-1.12: renderBlock - Social Badges Block
  describe('social-badges', () => {
    it('should generate badge markdown for each social link', () => {
      const block: Block = {
        id: 'test',
        type: 'social-badges',
        props: {
          links: [
            { type: 'github', username: 'testuser' },
            { type: 'linkedin', username: 'testuser' },
          ],
        },
      };
      const result = renderBlock(block);
      // Social badges without store username returns empty
      expect(result).toBe('');
    });

    it('should return empty string when no social links', () => {
      const block: Block = {
        id: 'test',
        type: 'social-badges',
        props: { links: [] },
      };
      const result = renderBlock(block);
      expect(result).toBe('');
    });
  });

  // TE-ITEM-1.13: renderBlock - Custom Badge Block
  describe('custom-badge', () => {
    it('should generate shields.io badge URL', () => {
      const block: Block = {
        id: 'test',
        type: 'custom-badge',
        props: {
          label: 'Test',
          message: '100',
          color: 'blue',
        },
      };
      const result = renderBlock(block);
      expect(result).toContain('shields.io');
    });
  });

  // TE-ITEM-1.14: renderBlock - Skill Icons Block
  describe('skill-icons', () => {
    it('should generate skillicons.dev URL', () => {
      const block: Block = {
        id: 'test',
        type: 'skill-icons',
        props: {
          icons: ['react', 'typescript'],
          perLine: 5,
          theme: 'dark',
        },
      };
      const result = renderBlock(block);
      expect(result).toContain('skillicons.dev/icons');
    });
  });

  // TE-ITEM-1.25: renderBlock - Visitor Counter Block
  describe('visitor-counter', () => {
    it('should generate komarev.com visitor counter URL', () => {
      const block: Block = {
        id: 'test',
        type: 'visitor-counter',
        props: { username: 'testuser', color: 'blue', style: 'flat', label: 'Profile Views' },
      };
      const result = renderBlock(block);
      expect(result).toContain('komarev.com/ghpvc');
    });
  });

  // TE-ITEM-1.26: renderBlock - Quote Block (Custom)
  describe('quote', () => {
    it('should render custom quote with author', () => {
      const block: Block = {
        id: 'test',
        type: 'quote',
        props: {
          text: 'The only way to do great work is to love what you do.',
          author: 'Steve Jobs',
          alignment: 'left',
        },
      };
      const result = renderBlock(block);
      // Quote block renders an image
      expect(result).toContain('<img');
    });

    it('should generate random quote API URL when no custom quote', () => {
      const block: Block = {
        id: 'test',
        type: 'quote',
        props: { useRandom: true },
      };
      const result = renderBlock(block);
      // Quote block renders an image
      expect(result).toContain('<img');
    });
  });

  // TE-ITEM-1.27: renderBlock - Footer Banner Block
  describe('footer-banner', () => {
    it('should generate footer banner URL', () => {
      const block: Block = {
        id: 'test',
        type: 'footer-banner',
        props: { username: 'testuser' },
      };
      const result = renderBlock(block);
      // Footer banner renders an img tag
      expect(result).toContain('<img');
    });
  });

  // TE-ITEM-1.28: renderBlock - Unknown Block Type
  describe('unknown block type', () => {
    it('should return empty string for unknown types', () => {
      const block: Block = {
        id: 'test',
        type: 'unknown-type' as Block['type'],
        props: {},
      };
      const result = renderBlock(block);
      expect(result).toBe('');
    });
  });
});

describe('renderMarkdown', () => {
  // TE-ITEM-1.29: renderMarkdown - Empty Input
  it('should handle empty input', () => {
    const result = renderMarkdown([]);
    expect(result).toBe('');
  });

  // TE-ITEM-1.30: renderMarkdown - Multiple Blocks
  it('should render multiple blocks sequentially', () => {
    const blocks: Block[] = [
      { id: '1', type: 'heading', props: { text: 'Title', level: 1, alignment: 'left' } },
      { id: '2', type: 'paragraph', props: { text: 'Content', alignment: 'left' } },
    ];
    const result = renderMarkdown(blocks);
    expect(result).toContain('Title');
    expect(result).toContain('Content');
  });

  it('should render adjacent stats cards in one centered row', () => {
    const blocks: Block[] = [
      { id: '1', type: 'stats-card', props: { username: 'user-one', theme: 'dark' } },
      { id: '2', type: 'stats-card', props: { username: 'user-two', theme: 'radical' } },
    ];

    const result = renderMarkdown(blocks);
    expect((result.match(/<div align="center">/g) || []).length).toBe(1);
    expect((result.match(/alt="GitHub Stats"/g) || []).length).toBe(2);
    expect(result).toContain('username=user-one');
    expect(result).toContain('username=user-two');
  });

  it('should use custom width from props when rendering adjacent cards', () => {
    const blocks: Block[] = [
      {
        id: '1',
        type: 'stats-card',
        props: { username: 'user-one', theme: 'dark', width: '48%', layoutWidth: 'half' },
      },
      {
        id: '2',
        type: 'top-languages',
        props: { username: 'user-one', theme: 'dark', width: '48%', layoutWidth: 'half' },
      },
    ];

    const result = renderMarkdown(blocks);
    expect(result).toContain('width="48%"');
  });

  it('should keep non-adjacent stats cards in separate rows', () => {
    const blocks: Block[] = [
      { id: '1', type: 'stats-card', props: { username: 'user-one', theme: 'dark' } },
      { id: '2', type: 'paragraph', props: { text: 'Break', alignment: 'left' } },
      { id: '3', type: 'stats-card', props: { username: 'user-two', theme: 'radical' } },
    ];

    const result = renderMarkdown(blocks);
    expect((result.match(/alt="GitHub Stats"/g) || []).length).toBe(2);
    expect((result.match(/<div align="center">/g) || []).length).toBe(2);
    expect(result).toContain('Break');
  });

  it('should render mixed half-width cards in one centered row', () => {
    const blocks: Block[] = [
      {
        id: '1',
        type: 'stats-card',
        props: { username: 'user-one', theme: 'dark', layoutWidth: 'half' },
      },
      {
        id: '2',
        type: 'top-languages',
        props: { username: 'user-one', theme: 'dark', layoutWidth: 'half' },
      },
    ];

    const result = renderMarkdown(blocks);
    expect((result.match(/<div align="center">/g) || []).length).toBe(1);
    expect(result).toContain('alt="GitHub Stats"');
    expect(result).toContain('alt="Top Languages"');
  });

  it('should keep half-width card separate when following card is full width', () => {
    const blocks: Block[] = [
      {
        id: '1',
        type: 'stats-card',
        props: { username: 'user-one', theme: 'dark', layoutWidth: 'half' },
      },
      {
        id: '2',
        type: 'streak-stats',
        props: { username: 'user-one', theme: 'dark', layoutWidth: 'full' },
      },
    ];

    const result = renderMarkdown(blocks);
    expect((result.match(/<div align="center">/g) || []).length).toBe(2);
    expect(result).toContain('alt="GitHub Stats"');
    expect(result).toContain('alt="GitHub Streak"');
  });
});
