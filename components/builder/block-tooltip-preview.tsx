'use client';

import { BlockType } from '@/lib/types';

// Block descriptions for tooltips
const BLOCK_DESCRIPTIONS: Record<BlockType, string> = {
  // Layout
  divider: 'Visual separator between sections with customizable line or GIF',
  spacer: 'Add vertical spacing between blocks',
  // Hero
  'capsule-header': 'Eye-catching animated header with waving or typing effect',
  avatar: 'Display your profile picture with customizable border and size',
  greeting: 'Personalized greeting with emoji and alignment options',
  'typing-animation': 'Multi-line typing animation for dynamic text display',
  // Content
  heading: 'Section headings (H1-H6) with emoji support',
  paragraph: 'Rich text paragraphs with alignment options',
  collapsible: 'Expandable/collapsible content section',
  'code-block': 'Syntax-highlighted code snippet with language selection',
  // Media
  image: 'Responsive images with custom dimensions and border radius',
  gif: 'Animated GIF with width and alignment control',
  // Social
  'social-badges': 'Share your social links (GitHub, LinkedIn, Twitter, etc.)',
  'custom-badge': 'Create custom badges with Shields.io',
  // Tech Stack
  'skill-icons': 'Display your tech stack using skill icons',
  // GitHub Stats
  'stats-row': 'Side-by-side layout for two stats cards',
  'stats-card': 'GitHub user statistics (stars, commits, PRs, etc.)',
  'top-languages': 'Most used programming languages breakdown',
  'streak-stats': 'GitHub contribution streak visualization',
  'activity-graph': 'Yearly contribution activity heatmap',
  trophies: 'GitHub achievements and trophies showcase',
  'wakatime-stats': 'Wakatime coding statistics and time tracking',
  // Advanced
  'visitor-counter': 'Profile views counter with customizable style',
  quote: 'Display quotes with themed styling',
  'footer-banner': 'Attractive footer with wave animation',
  'support-link': 'Support links (Buy Me a Coffee, Ko-fi, etc.)',
};

// Preview component for each block type
export function BlockTooltipPreview({ type }: { type: BlockType }) {
  const renderPreview = () => {
    switch (type) {
      case 'divider':
        return (
          <div className="w-full h-3 flex items-center justify-center">
            <div className="w-full h-0.5 bg-border rounded-full" />
          </div>
        );

      case 'spacer':
        return (
          <div className="w-full h-8 flex items-center justify-center">
            <div className="w-full h-2 bg-muted/50 rounded" />
          </div>
        );

      case 'capsule-header':
        return (
          <div className="h-8 rounded bg-gradient-to-r from-primary/30 to-accent/30 flex items-center justify-center">
            <span className="text-xs font-bold">Hello!</span>
          </div>
        );

      case 'avatar':
        return (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-primary/20" />
          </div>
        );

      case 'greeting':
        return (
          <div className="text-center">
            <span className="text-lg">👋 Hi, I'm!</span>
          </div>
        );

      case 'typing-animation':
        return (
          <div className="flex items-center gap-1">
            <span className="text-xs">Type...</span>
            <span className="w-1 h-3 bg-primary animate-pulse" />
          </div>
        );

      case 'heading':
        return <h3 className="text-sm font-bold">Section Title</h3>;

      case 'paragraph':
        return <p className="text-xs text-muted-foreground">Content preview...</p>;

      case 'collapsible':
        return (
          <div className="border border-border rounded p-2">
            <div className="text-xs flex items-center gap-1">
              <span>▶</span> Click to expand
            </div>
          </div>
        );

      case 'code-block':
        return (
          <div className="bg-muted p-2 rounded font-mono text-xs">
            <span className="text-primary">const</span> x = 1;
          </div>
        );

      case 'image':
        return (
          <div className="flex justify-center">
            <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
              <span className="text-xs">🖼️</span>
            </div>
          </div>
        );

      case 'gif':
        return (
          <div className="flex justify-center">
            <div className="w-8 h-6 bg-muted rounded animate-pulse" />
          </div>
        );

      case 'social-badges':
        return (
          <div className="flex gap-1 flex-wrap">
            <div className="px-2 py-1 bg-blue-500 rounded text-xs text-white">GH</div>
            <div className="px-2 py-1 bg-blue-600 rounded text-xs text-white">in</div>
            <div className="px-2 py-1 bg-sky-500 rounded text-xs text-white">tw</div>
          </div>
        );

      case 'custom-badge':
        return <div className="px-2 py-1 bg-red-500 rounded text-xs text-white">LABEL</div>;

      case 'skill-icons':
        return (
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-yellow-400 rounded-full" />
            <div className="w-4 h-4 bg-blue-500 rounded-full" />
            <div className="w-4 h-4 bg-green-500 rounded-full" />
          </div>
        );

      case 'stats-row':
        return (
          <div className="flex gap-1 w-full h-full items-center justify-center">
            <div className="flex-1 h-10 bg-primary/30 rounded border border-border" />
            <div className="flex-1 h-10 bg-primary/30 rounded border border-border" />
          </div>
        );

      case 'stats-card':
        return (
          <div className="border border-border rounded p-2">
            <div className="text-xs font-bold">1,234</div>
            <div className="text-[10px] text-muted-foreground">Total Stars</div>
          </div>
        );

      case 'top-languages':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-2 bg-blue-400 rounded" />
              <span className="text-xs">JS 60%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 bg-yellow-400 rounded" />
              <span className="text-xs">TS 30%</span>
            </div>
          </div>
        );

      case 'streak-stats':
        return (
          <div className="flex items-center gap-2">
            <span className="text-orange-500">🔥</span>
            <span className="text-xs font-bold">365 days</span>
          </div>
        );

      case 'wakatime-stats':
        return (
          <div className="flex items-center gap-2">
            <span className="text-blue-500">⏱️</span>
            <span className="text-xs font-bold">12 hrs/day</span>
          </div>
        );

      case 'activity-graph':
        return (
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: 21 }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-sm ${
                  i % 3 === 0 ? 'bg-green-500' : i % 2 === 0 ? 'bg-green-300' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        );

      case 'trophies':
        return (
          <div className="flex gap-1">
            <span>🏆</span>
            <span>⭐</span>
            <span>💎</span>
          </div>
        );

      case 'visitor-counter':
        return (
          <div className="flex items-center gap-1">
            <span className="text-xs">👁️</span>
            <span className="text-xs font-bold">1.2K</span>
          </div>
        );

      case 'quote':
        return (
          <div className="border-l-2 border-primary pl-2">
            <p className="text-xs italic">"Quote here"</p>
          </div>
        );

      case 'footer-banner':
        return (
          <div className="h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
            <span className="text-xs text-white">Thanks!</span>
          </div>
        );

      case 'support-link':
        return (
          <div className="flex items-center gap-1">
            <span className="text-xs">☕</span>
            <span className="text-xs">Support</span>
          </div>
        );

      default:
        return <div className="text-xs text-muted-foreground">Block preview</div>;
    }
  };

  return (
    <div className="w-24 h-16 flex items-center justify-center bg-muted/30 rounded border border-border">
      {renderPreview()}
    </div>
  );
}

export function getBlockDescription(type: BlockType): string {
  return BLOCK_DESCRIPTIONS[type] || 'Add this block to your README';
}
