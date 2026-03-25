import type { Template } from './types';

export const templates: Template[] = [
  {
    id: 'animated-developer',
    name: 'Animated Developer',
    description: 'Eye-catching profile with animated header, typing effect, and full stats',
    thumbnail: '/templates/animated.png',
    blocks: [
      {
        id: 'tpl-1',
        type: 'capsule-header',
        props: {
          text: 'Welcome to my GitHub!',
          type: 'waving',
          color: '0:EEFF00,100:a82DA',
          height: 200,
          section: 'header',
        },
      },
      {
        id: 'tpl-2',
        type: 'greeting',
        props: {
          text: "Hi there, I'm John Doe!",
          emoji: '👋',
          alignment: 'center',
        },
      },
      {
        id: 'tpl-3',
        type: 'typing-animation',
        props: {
          lines: ['Full Stack Developer', 'Open Source Enthusiast', 'Always Learning'],
          color: '36BCF7',
          width: 435,
          height: 30,
          speed: 50,
        },
      },
      {
        id: 'tpl-4',
        type: 'spacer',
        props: { height: 20 },
      },
      {
        id: 'tpl-5',
        type: 'heading',
        props: {
          text: 'About Me',
          level: 2,
          alignment: 'center',
          emoji: '🚀',
        },
      },
      {
        id: 'tpl-6',
        type: 'paragraph',
        props: {
          text: "I'm a passionate developer who loves building things that live on the internet. I specialize in creating exceptional digital experiences that are fast, accessible, and visually appealing.",
          alignment: 'center',
        },
      },
      {
        id: 'tpl-7',
        type: 'heading',
        props: {
          text: 'Tech Stack',
          level: 2,
          alignment: 'center',
          emoji: '💻',
        },
      },
      {
        id: 'tpl-8',
        type: 'skill-icons',
        props: {
          icons: [
            'js',
            'ts',
            'react',
            'nextjs',
            'nodejs',
            'python',
            'docker',
            'aws',
            'git',
            'vscode',
          ],
          perLine: 10,
          theme: 'dark',
        },
      },
      {
        id: 'tpl-9',
        type: 'heading',
        props: {
          text: 'GitHub Stats',
          level: 2,
          alignment: 'center',
          emoji: '📊',
        },
      },
      {
        id: 'tpl-10',
        type: 'stats-card',
        props: {
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
        id: 'tpl-11',
        type: 'streak-stats',
        props: {
          username: 'github',
          theme: 'tokyonight',
          hideBorder: false,
          borderRadius: 10,
        },
      },
      {
        id: 'tpl-12',
        type: 'top-languages',
        props: {
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
        id: 'tpl-13',
        type: 'heading',
        props: {
          text: 'Connect with Me',
          level: 2,
          alignment: 'center',
          emoji: '🤝',
        },
      },
      {
        id: 'tpl-14',
        type: 'social-badges',
        props: {
          linkedin: 'johndoe',
          twitter: 'johndoe',
          github: 'johndoe',
          email: 'john@example.com',
          style: 'for-the-badge',
        },
      },
      {
        id: 'tpl-15',
        type: 'visitor-counter',
        props: {
          username: 'johndoe',
          color: 'blue',
          style: 'flat',
          label: 'Profile Views',
        },
      },
      {
        id: 'tpl-16',
        type: 'footer-banner',
        props: {
          text: 'Thanks for visiting!',
          waveColor: '0:EEFF00,100:a82DA',
          fontColor: 'ffffff',
          height: 120,
        },
      },
    ],
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Simple and elegant profile with essential information',
    thumbnail: '/templates/minimal.png',
    blocks: [
      {
        id: 'min-1',
        type: 'greeting',
        props: {
          text: 'Hello, World!',
          emoji: '👋',
          alignment: 'left',
        },
      },
      {
        id: 'min-2',
        type: 'paragraph',
        props: {
          text: "I'm a software developer passionate about creating elegant solutions to complex problems.",
          alignment: 'left',
        },
      },
      {
        id: 'min-3',
        type: 'divider',
        props: { type: 'line', color: '#e1e4e8' },
      },
      {
        id: 'min-4',
        type: 'heading',
        props: {
          text: 'What I do',
          level: 3,
          alignment: 'left',
        },
      },
      {
        id: 'min-5',
        type: 'paragraph',
        props: {
          text: '• Building web applications with React and Node.js\n• Contributing to open source projects\n• Writing technical blog posts',
          alignment: 'left',
        },
      },
      {
        id: 'min-6',
        type: 'divider',
        props: { type: 'line', color: '#e1e4e8' },
      },
      {
        id: 'min-7',
        type: 'stats-card',
        props: {
          username: 'github',
          theme: 'graywhite',
          showIcons: true,
          hideBorder: true,
          hideTitle: false,
          hideRank: true,
          borderRadius: 5,
        },
      },
      {
        id: 'min-8',
        type: 'social-badges',
        props: {
          linkedin: 'username',
          github: 'username',
          email: 'email@example.com',
          style: 'flat',
        },
      },
    ],
  },
  {
    id: 'stats-focused',
    name: 'Stats Focused',
    description: 'Showcase your GitHub activity with comprehensive statistics',
    thumbnail: '/templates/stats.png',
    blocks: [
      {
        id: 'stat-1',
        type: 'heading',
        props: {
          text: 'GitHub Activity Dashboard',
          level: 1,
          alignment: 'center',
        },
      },
      {
        id: 'stat-2',
        type: 'paragraph',
        props: {
          text: 'A comprehensive view of my GitHub contributions and achievements',
          alignment: 'center',
        },
      },
      {
        id: 'stat-3',
        type: 'spacer',
        props: { height: 20 },
      },
      {
        id: 'stat-4',
        type: 'stats-card',
        props: {
          username: 'github',
          theme: 'radical',
          showIcons: true,
          hideBorder: false,
          hideTitle: false,
          hideRank: false,
          borderRadius: 10,
        },
      },
      {
        id: 'stat-5',
        type: 'streak-stats',
        props: {
          username: 'github',
          theme: 'radical',
          hideBorder: false,
          borderRadius: 10,
        },
      },
      {
        id: 'stat-6',
        type: 'top-languages',
        props: {
          username: 'github',
          theme: 'radical',
          layout: 'donut',
          hideBorder: false,
          hideProgress: false,
          langs_count: 6,
          borderRadius: 10,
        },
      },
      {
        id: 'stat-7',
        type: 'activity-graph',
        props: {
          username: 'github',
          theme: 'rogue',
          hideBorder: false,
        },
      },
      {
        id: 'stat-8',
        type: 'trophies',
        props: {
          username: 'github',
          theme: 'radical',
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
    id: 'creative-profile',
    name: 'Creative Profile',
    description: 'Stand out with unique animations and creative elements',
    thumbnail: '/templates/creative.png',
    blocks: [
      {
        id: 'cre-1',
        type: 'capsule-header',
        props: {
          text: '',
          type: 'cylinder',
          color: 'gradient',
          height: 150,
          section: 'header',
        },
      },
      {
        id: 'cre-2',
        type: 'avatar',
        props: {
          imageUrl: 'https://github.com/github.png',
          size: 150,
          borderRadius: 50,
        },
      },
      {
        id: 'cre-3',
        type: 'greeting',
        props: {
          text: "Hey! I'm a Creative Developer",
          emoji: '✨',
          alignment: 'center',
        },
      },
      {
        id: 'cre-4',
        type: 'typing-animation',
        props: {
          lines: ['Designer', 'Developer', 'Creator', 'Innovator'],
          color: 'FF6B6B',
          width: 400,
          height: 35,
          speed: 50,
        },
      },
      {
        id: 'cre-5',
        type: 'quote',
        props: {
          quote: 'Design is not just what it looks like, design is how it works.',
          author: 'Steve Jobs',
          theme: 'dracula',
          type: 'horizontal',
        },
      },
      {
        id: 'cre-6',
        type: 'heading',
        props: {
          text: 'My Creative Stack',
          level: 2,
          alignment: 'center',
          emoji: '🎨',
        },
      },
      {
        id: 'cre-7',
        type: 'skill-icons',
        props: {
          icons: ['figma', 'ai', 'ps', 'blender', 'react', 'tailwind', 'nextjs', 'ts'],
          perLine: 8,
          theme: 'dark',
        },
      },
      {
        id: 'cre-8',
        type: 'stats-card',
        props: {
          username: 'github',
          theme: 'dracula',
          showIcons: true,
          hideBorder: false,
          hideTitle: false,
          hideRank: false,
          borderRadius: 15,
        },
      },
      {
        id: 'cre-9',
        type: 'footer-banner',
        props: {
          text: "Let's create something amazing!",
          waveColor: 'gradient',
          fontColor: 'ffffff',
          height: 100,
        },
      },
    ],
  },
];
