// Block Types for the README Builder

export type BlockType =
  // Layout
  | 'container'
  | 'divider'
  | 'spacer'
  // Hero
  | 'capsule-header'
  | 'avatar'
  | 'greeting'
  | 'typing-animation'
  // Content
  | 'heading'
  | 'paragraph'
  | 'collapsible'
  | 'code-block'
  // Media
  | 'image'
  | 'gif'
  // Social
  | 'social-badges'
  | 'custom-badge'
  // Tech Stack
  | 'skill-icons'
  // GitHub Stats
  | 'stats-card'
  | 'top-languages'
  | 'streak-stats'
  | 'activity-graph'
  | 'trophies'
  // Advanced
  | 'visitor-counter'
  | 'quote'
  | 'footer-banner';

export interface Block {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
  children?: Block[];
}

// Block Props Types
export interface ContainerProps {
  alignment: 'left' | 'center' | 'right';
  direction: 'row' | 'column';
  gap: number;
}

export interface DividerProps {
  type: 'line' | 'gif';
  gifUrl?: string;
  color?: string;
}

export interface SpacerProps {
  height: number;
}

export interface CapsuleHeaderProps {
  text: string;
  type: 'waving' | 'typing' | 'static';
  color: string;
  height: number;
  section: string;
}

export interface AvatarProps {
  imageUrl: string;
  size: number;
  borderRadius: number;
  borderColor?: string;
}

export interface GreetingProps {
  text: string;
  emoji?: string;
  alignment: 'left' | 'center' | 'right';
}

export interface TypingAnimationProps {
  lines: string[];
  color: string;
  width: number;
  height: number;
  speed: number;
}

export interface HeadingProps {
  text: string;
  level: 1 | 2 | 3;
  alignment: 'left' | 'center' | 'right';
  emoji?: string;
}

export interface ParagraphProps {
  text: string;
  alignment: 'left' | 'center' | 'right';
}

export interface CollapsibleProps {
  title: string;
  defaultOpen: boolean;
}

export interface CodeBlockProps {
  code: string;
  language: string;
}

export interface ImageProps {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  alignment: 'left' | 'center' | 'right';
  borderRadius: number;
}

export interface GifProps {
  url: string;
  alt: string;
  width?: number;
  alignment: 'left' | 'center' | 'right';
}

export interface SocialBadgesProps {
  linkedin?: string;
  twitter?: string;
  email?: string;
  portfolio?: string;
  github?: string;
  youtube?: string;
  instagram?: string;
  discord?: string;
  style: 'flat' | 'flat-square' | 'for-the-badge' | 'plastic' | 'social';
}

export interface CustomBadgeProps {
  label: string;
  message: string;
  color: string;
  labelColor?: string;
  style: 'flat' | 'flat-square' | 'for-the-badge' | 'plastic';
  logo?: string;
  logoColor?: string;
}

export interface SkillIconsProps {
  icons: string[];
  perLine: number;
  theme: 'light' | 'dark';
}

export interface StatsCardProps {
  username: string;
  theme: string;
  showIcons: boolean;
  hideBorder: boolean;
  hideTitle: boolean;
  hideRank: boolean;
  bgColor?: string;
  textColor?: string;
  titleColor?: string;
  iconColor?: string;
  borderRadius: number;
}

export interface TopLanguagesProps {
  username: string;
  theme: string;
  layout: 'compact' | 'normal' | 'donut' | 'donut-vertical' | 'pie';
  hideBorder: boolean;
  hideProgress: boolean;
  langs_count: number;
  bgColor?: string;
  textColor?: string;
  titleColor?: string;
  borderRadius: number;
}

export interface StreakStatsProps {
  username: string;
  theme: string;
  hideBorder: boolean;
  borderRadius: number;
  bgColor?: string;
  textColor?: string;
  fireColor?: string;
  ringColor?: string;
  currStreakColor?: string;
  sideNumColor?: string;
  sideLabelColor?: string;
  datesColor?: string;
}

export interface ActivityGraphProps {
  username: string;
  theme: string;
  hideBorder: boolean;
  bgColor?: string;
  color?: string;
  lineColor?: string;
  pointColor?: string;
  areaColor?: string;
}

export interface TrophiesProps {
  username: string;
  theme: string;
  column: number;
  row: number;
  margin_w: number;
  margin_h: number;
  noFrame: boolean;
  noBg: boolean;
}

export interface VisitorCounterProps {
  username: string;
  color: string;
  style: 'flat' | 'flat-square' | 'plastic';
  label: string;
}

export interface QuoteProps {
  quote?: string;
  author?: string;
  theme: string;
  type: 'default' | 'horizontal' | 'vertical';
}

export interface FooterBannerProps {
  text: string;
  waveColor: string;
  fontColor: string;
  height: number;
}

// Theme definitions for stats cards
export const STATS_THEMES = [
  'default',
  'dark',
  'radical',
  'merko',
  'gruvbox',
  'tokyonight',
  'onedark',
  'cobalt',
  'synthwave',
  'highcontrast',
  'dracula',
  'prussian',
  'monokai',
  'vue',
  'vue-dark',
  'shades-of-purple',
  'nightowl',
  'buefy',
  'blue-green',
  'algolia',
  'great-gatsby',
  'darcula',
  'bear',
  'solarized-dark',
  'solarized-light',
  'chartreuse-dark',
  'nord',
  'gotham',
  'material-palenight',
  'graywhite',
  'vision-friendly-dark',
  'ayu-mirage',
  'midnight-purple',
  'calm',
  'flag-india',
  'omni',
  'react',
  'jolly',
  'maroongold',
  'yeblu',
  'blueberry',
  'slateorange',
  'kacho_ga',
  'outrun',
  'ocean_dark',
  'city_lights',
  'github_dark',
  'discord_old_blurple',
  'aura_dark',
  'panda',
  'noctis_minimus',
  'cobalt2',
  'swift',
  'aura',
  'apprentice',
  'moltack',
  'codeSTACKr',
  'rose_pine',
  'catppuccin_latte',
  'catppuccin_mocha',
] as const;

// Popular skill icons
export const SKILL_ICONS = [
  'js',
  'ts',
  'react',
  'nextjs',
  'vue',
  'angular',
  'svelte',
  'nodejs',
  'express',
  'nestjs',
  'python',
  'django',
  'flask',
  'fastapi',
  'java',
  'spring',
  'kotlin',
  'go',
  'rust',
  'c',
  'cpp',
  'cs',
  'php',
  'laravel',
  'ruby',
  'rails',
  'swift',
  'dart',
  'flutter',
  'html',
  'css',
  'sass',
  'tailwind',
  'bootstrap',
  'materialui',
  'mongodb',
  'mysql',
  'postgres',
  'redis',
  'firebase',
  'supabase',
  'aws',
  'gcp',
  'azure',
  'docker',
  'kubernetes',
  'nginx',
  'git',
  'github',
  'gitlab',
  'bitbucket',
  'vscode',
  'vim',
  'figma',
  'xd',
  'ai',
  'ps',
  'pr',
  'blender',
  'linux',
  'bash',
  'powershell',
  'webpack',
  'vite',
  'rollup',
  'graphql',
  'apollo',
  'prisma',
  'sequelize',
  'jest',
  'cypress',
  'selenium',
  'postman',
  'tensorflow',
  'pytorch',
  'sklearn',
  'opencv',
  'electron',
  'tauri',
  'unity',
  'unreal',
] as const;

// Block category definitions
export interface BlockCategory {
  name: string;
  description: string;
  blocks: {
    type: BlockType;
    label: string;
    icon: string;
    defaultProps: Record<string, unknown>;
  }[];
}

export const BLOCK_CATEGORIES: BlockCategory[] = [
  {
    name: 'Layout',
    description: 'Structure your README',
    blocks: [
      {
        type: 'container',
        label: 'Container',
        icon: 'Layout',
        defaultProps: { alignment: 'center', direction: 'column', gap: 16 },
      },
      {
        type: 'divider',
        label: 'Divider',
        icon: 'Minus',
        defaultProps: { type: 'line', color: '#e1e4e8' },
      },
      {
        type: 'spacer',
        label: 'Spacer',
        icon: 'Space',
        defaultProps: { height: 20 },
      },
    ],
  },
  {
    name: 'Hero',
    description: 'Eye-catching headers',
    blocks: [
      {
        type: 'capsule-header',
        label: 'Capsule Header',
        icon: 'Sparkles',
        defaultProps: {
          text: 'Hello World!',
          type: 'waving',
          color: '0:EEFF00,100:a]82DA',
          height: 200,
          section: 'header',
        },
      },
      {
        type: 'avatar',
        label: 'Avatar',
        icon: 'User',
        defaultProps: {
          imageUrl: 'https://github.com/github.png',
          size: 150,
          borderRadius: 50,
        },
      },
      {
        type: 'greeting',
        label: 'Greeting',
        icon: 'Hand',
        defaultProps: {
          text: "Hi, I'm [Your Name]!",
          emoji: '👋',
          alignment: 'center',
        },
      },
      {
        type: 'typing-animation',
        label: 'Typing Animation',
        icon: 'Type',
        defaultProps: {
          lines: ['Full Stack Developer', 'Open Source Enthusiast', 'Tech Blogger'],
          color: '36BCF7',
          width: 435,
          height: 30,
          speed: 50,
        },
      },
    ],
  },
  {
    name: 'Content',
    description: 'Text and code blocks',
    blocks: [
      {
        type: 'heading',
        label: 'Heading',
        icon: 'Heading',
        defaultProps: { text: 'Section Title', level: 2, alignment: 'left' },
      },
      {
        type: 'paragraph',
        label: 'Paragraph',
        icon: 'AlignLeft',
        defaultProps: { text: 'Write your content here...', alignment: 'left' },
      },
      {
        type: 'collapsible',
        label: 'Collapsible',
        icon: 'ChevronDown',
        defaultProps: { title: 'Click to expand', defaultOpen: false },
      },
      {
        type: 'code-block',
        label: 'Code Block',
        icon: 'Code',
        defaultProps: { code: 'console.log("Hello!");', language: 'javascript' },
      },
    ],
  },
  {
    name: 'Media',
    description: 'Images and GIFs',
    blocks: [
      {
        type: 'image',
        label: 'Image',
        icon: 'Image',
        defaultProps: {
          url: 'https://via.placeholder.com/400x200',
          alt: 'Image description',
          alignment: 'center',
          borderRadius: 8,
        },
      },
      {
        type: 'gif',
        label: 'GIF',
        icon: 'Film',
        defaultProps: {
          url: 'https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif',
          alt: 'Wave GIF',
          width: 30,
          alignment: 'left',
        },
      },
    ],
  },
  {
    name: 'Social',
    description: 'Social links and badges',
    blocks: [
      {
        type: 'social-badges',
        label: 'Social Badges',
        icon: 'Share2',
        defaultProps: {
          linkedin: '',
          twitter: '',
          email: '',
          portfolio: '',
          github: '',
          style: 'for-the-badge',
        },
      },
      {
        type: 'custom-badge',
        label: 'Custom Badge',
        icon: 'Badge',
        defaultProps: {
          label: 'MADE WITH',
          message: 'LOVE',
          color: 'red',
          style: 'for-the-badge',
        },
      },
    ],
  },
  {
    name: 'Tech Stack',
    description: 'Show your skills',
    blocks: [
      {
        type: 'skill-icons',
        label: 'Skill Icons',
        icon: 'Layers',
        defaultProps: {
          icons: ['js', 'ts', 'react', 'nextjs', 'nodejs'],
          perLine: 10,
          theme: 'dark',
        },
      },
    ],
  },
  {
    name: 'GitHub Stats',
    description: 'Showcase your activity',
    blocks: [
      {
        type: 'stats-card',
        label: 'Stats Card',
        icon: 'BarChart2',
        defaultProps: {
          username: 'github',
          theme: 'tokyonight',
          showIcons: true,
          hideBorder: false,
          hideTitle: false,
          hideRank: false,
          borderRadius: 10,
        },
      },
      {
        type: 'top-languages',
        label: 'Top Languages',
        icon: 'PieChart',
        defaultProps: {
          username: 'github',
          theme: 'tokyonight',
          layout: 'compact',
          hideBorder: false,
          hideProgress: false,
          langs_count: 8,
          borderRadius: 10,
        },
      },
      {
        type: 'streak-stats',
        label: 'Streak Stats',
        icon: 'Flame',
        defaultProps: {
          username: 'github',
          theme: 'tokyonight',
          hideBorder: false,
          borderRadius: 10,
        },
      },
      {
        type: 'activity-graph',
        label: 'Activity Graph',
        icon: 'Activity',
        defaultProps: {
          username: 'github',
          theme: 'tokyo-night',
          hideBorder: false,
        },
      },
      {
        type: 'trophies',
        label: 'Trophies',
        icon: 'Award',
        defaultProps: {
          username: 'github',
          theme: 'tokyonight',
          column: 6,
          row: 1,
          margin_w: 15,
          margin_h: 15,
          noFrame: false,
          noBg: false,
        },
      },
    ],
  },
  {
    name: 'Advanced',
    description: 'Extra elements',
    blocks: [
      {
        type: 'visitor-counter',
        label: 'Visitor Counter',
        icon: 'Eye',
        defaultProps: {
          username: 'github',
          color: 'blue',
          style: 'flat',
          label: 'Profile Views',
        },
      },
      {
        type: 'quote',
        label: 'Quote',
        icon: 'Quote',
        defaultProps: {
          theme: 'tokyonight',
          type: 'horizontal',
        },
      },
      {
        type: 'footer-banner',
        label: 'Footer Banner',
        icon: 'PanelBottom',
        defaultProps: {
          text: 'Thanks for visiting!',
          waveColor: '0:EEFF00,100:a82DA',
          fontColor: 'ffffff',
          height: 120,
        },
      },
    ],
  },
];

// Template definitions
export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  blocks: Block[];
}
