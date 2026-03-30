import { NextRequest, NextResponse } from 'next/server';

import { escapeHtml } from '@/lib/utils';

// Quote data with different types and themes
const quotes = [
  // Programming/Dev quotes
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: 'Cory House',
    type: 'programming',
  },
  {
    text: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
    type: 'programming',
  },
  {
    text: 'Experience is the name everyone gives to their mistakes.',
    author: 'Oscar Wilde',
    type: 'programming',
  },
  {
    text: 'The best error message is the one that never shows up.',
    author: 'Richard Stallman',
    type: 'programming',
  },
  { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman', type: 'programming' },
  { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck', type: 'programming' },
  {
    text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    author: 'Martin Fowler',
    type: 'programming',
  },
  {
    text: "Programming isn't about what you know; it's about what you can figure out.",
    author: 'Chris Pine',
    type: 'programming',
  },
  {
    text: 'The most disastrous thing that you can ever learn is your first programming language.',
    author: 'Alan Kay',
    type: 'programming',
  },
  {
    text: 'Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging a Monday program.',
    author: 'Richard Bland',
    type: 'programming',
  },

  // Motivational quotes
  {
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    type: 'motivational',
  },
  {
    text: 'Innovation distinguishes between a leader and a follower.',
    author: 'Steve Jobs',
    type: 'motivational',
  },
  { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs', type: 'motivational' },
  {
    text: 'The future belongs to those who believe in the beauty of their dreams.',
    author: 'Eleanor Roosevelt',
    type: 'motivational',
  },
  {
    text: 'It does not matter how slowly you go as long as you do not stop.',
    author: 'Confucius',
    type: 'motivational',
  },
  {
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: 'Winston Churchill',
    type: 'motivational',
  },
  {
    text: 'The only impossible journey is the one you never begin.',
    author: 'Tony Robbins',
    type: 'motivational',
  },
  {
    text: "Believe you can and you're halfway there.",
    author: 'Theodore Roosevelt',
    type: 'motivational',
  },
  {
    text: "Your time is limited, don't waste it living someone else's life.",
    author: 'Steve Jobs',
    type: 'motivational',
  },
  {
    text: 'The best way to predict the future is to create it.',
    author: 'Peter Drucker',
    type: 'motivational',
  },

  // Random quotes
  {
    text: 'In the middle of difficulty lies opportunity.',
    author: 'Albert Einstein',
    type: 'random',
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: 'John Lennon',
    type: 'random',
  },
  { text: 'The purpose of our lives is to be happy.', author: 'Dalai Lama', type: 'random' },
  { text: 'Get busy living or get busy dying.', author: 'Stephen King', type: 'random' },
  {
    text: 'You only live once, but if you do it right, once is enough.',
    author: 'Mae West',
    type: 'random',
  },
  {
    text: "Many of life's failures are people who did not realize how close they were to success when they gave up.",
    author: 'Thomas A. Edison',
    type: 'random',
  },
  {
    text: 'If you want to live a happy life, tie it to a goal, not to people or things.',
    author: 'Albert Einstein',
    type: 'random',
  },
  {
    text: 'Never let the fear of striking out keep you from playing the game.',
    author: 'Babe Ruth',
    type: 'random',
  },
  {
    text: "Money and success don't change people; they merely amplify what is already there.",
    author: 'Will Smith',
    type: 'random',
  },
  {
    text: "Your background doesn't determine your destiny, but your decisions do.",
    author: 'John C. Maxwell',
    type: 'random',
  },

  // Science/Technology quotes
  {
    text: 'The science of today is the technology of tomorrow.',
    author: 'Edward Teller',
    type: 'science',
  },
  {
    text: "Technology is anything that wasn't there when you were born.",
    author: 'Alan Kay',
    type: 'science',
  },
  {
    text: 'The computer was born to solve problems that did not exist before.',
    author: 'Bill Gates',
    type: 'science',
  },
  {
    text: "Artificial Intelligence is not a threat to humanity, but humanity's next evolution.",
    author: 'Unknown',
    type: 'science',
  },
  {
    text: 'The best way to predict the future is to invent it.',
    author: 'Alan Kay',
    type: 'science',
  },
  { text: 'Software is eating the world.', author: 'Marc Andreessen', type: 'science' },
  {
    text: 'Information is the oil of the 21st century, and analytics is the combustion engine.',
    author: 'Peter Sondergaard',
    type: 'science',
  },
  {
    text: "The internet is the first thing that humanity has built that humanity doesn't understand.",
    author: 'Eric Schmidt',
    type: 'science',
  },
  {
    text: 'We are stuck with technology when what we really want is just stuff that works.',
    author: 'Douglas Adams',
    type: 'science',
  },
  {
    text: 'Any sufficiently advanced technology is indistinguishable from magic.',
    author: 'Arthur C. Clarke',
    type: 'science',
  },
];

// Theme colors for quotes
const themes: Record<string, { bg: string; text: string; accent: string; border: string }> = {
  default: { bg: '0f0f23', text: 'a9b7c6', accent: '6a9955', border: '3e4451' },
  dark: { bg: '1a1a1a', text: 'ffffff', accent: '79c0ff', border: '30363d' },
  radical: { bg: '141321', text: 'a9fef7', accent: 'fe428e', border: '302d41' },
  merko: { bg: '0a0f0b', text: '68b587', accent: 'abd200', border: '1d3521' },
  gruvbox: { bg: '282828', text: 'ebdbb2', accent: 'fe8019', border: '3c3836' },
  tokyonight: { bg: '1a1b27', text: '38bdae', accent: '70a5fd', border: '24283b' },
  'tokyo-night': { bg: '1a1b27', text: '38bdae', accent: '70a5fd', border: '24283b' },
  onedark: { bg: '282c34', text: 'abb2bf', accent: 'e5c07b', border: '3e4451' },
  cobalt: { bg: '002240', text: 'ffffff', accent: 'f68825', border: '00509e' },
  synthwave: { bg: '1a1a2e', text: 'ffffff', accent: 'ff2a6d', border: '05051a' },
  highcontrast: { bg: '000000', text: 'ffffff', accent: '00ff00', border: 'ffffff' },
  'high-contrast': { bg: '000000', text: 'ffffff', accent: '00ff00', border: 'ffffff' },
  dracula: { bg: '282a36', text: 'f8f8f2', accent: 'bd93f9', border: '44475a' },
  prussian: { bg: '001100', text: 'ffffff', accent: '00c8ff', border: '002211' },
  monokai: { bg: '272822', text: 'f8f8f2', accent: 'f92672', border: '49483e' },
  vue: { bg: '1e1e2e', text: 'ffffff', accent: '41b883', border: '35495e' },
  'vue-dark': { bg: '1e1e2e', text: 'ffffff', accent: '41b883', border: '35495e' },
  'shades-of-purple': { bg: '2d2b55', text: 'ffffff', accent: 'f9ae2f', border: '3d3b7d' },
  nightowl: { bg: '011627', text: 'd6deeb', accent: '7e57c2', border: '2d4b6f' },
  buefy: { bg: '20163a', text: 'ffffff', accent: '7957d5', border: '3d3b7d' },
  'blue-green': { bg: '0d1117', text: 'c9d1d9', accent: '58a6ff', border: '30363d' },
  algolia: { bg: '050c2d', text: 'ffffff', accent: '5468ff', border: '1a2272' },
  'great-gatsby': { bg: '261335', text: 'ffffff', accent: 'f47e03', border: '4a245e' },
  darcula: { bg: '2d2d2d', text: 'a9b7c6', accent: '6897bb', border: '3c3f41' },
  bear: { bg: '2e2e2e', text: 'd7d7d7', accent: '7a99c9', border: '3e3e3e' },
  'solarized-dark': { bg: '002b36', text: '839496', accent: '268bd2', border: '073642' },
  'solarized-light': { bg: 'fdf6e3', text: '657b83', accent: '268bd2', border: 'eee8d5' },
  'chartreuse-dark': { bg: '1a1a00', text: 'ffffff', accent: '7fff00', border: '333300' },
  nord: { bg: '2e3440', text: 'd8dee9', accent: '88c0d0', border: '3b4252' },
  gotham: { bg: '0f1419', text: 'f3f3f3', accent: '2fa1d6', border: '1c1c1c' },
  'material-palenight': { bg: '1e1e3f', text: 'd0d0e8', accent: 'c792ea', border: '3d3e7c' },
  graywhite: { bg: '24292e', text: 'ffffff', accent: '58a6ff', border: '30363d' },
  'vision-friendly-dark': { bg: '121212', text: 'ffffff', accent: 'ffcc00', border: '333333' },
  'ayu-mirage': { bg: '1e1e2e', text: 'e6e1cf', accent: 'f07178', border: '4e4e4e' },
  'midnight-purple': { bg: '100425', text: 'ffffff', accent: 'bf5af2', border: '2e1a47' },
  calm: { bg: '191a1f', text: 'e8e6e3', accent: 'd29f9e', border: '2e2f33' },
  'flag-india': { bg: 'ffffff', text: '000000', accent: 'ff9933', border: '138808' },
  omni: { bg: '191623', text: 'f8f8f2', accent: 'ff79c6', border: '44475a' },
  react: { bg: '0d1117', text: 'c9d1d9', accent: '61dafb', border: '30363d' },
  jolly: { bg: '1a0628', text: 'fdf3ff', accent: 'e060a0', border: '3c1440' },
  maroongold: { bg: '2a2000', text: 'f4d58d', accent: 'e8a930', border: '4d3800' },
  yeblu: { bg: '0b0f2a', text: 'c5c7d8', accent: 'ffff00', border: '1a1d36' },
  blueberry: { bg: '1a1a2e', text: 'e6e9f0', accent: 'a855f7', border: '2d2d4a' },
  slateorange: { bg: '1a1a1a', text: 'ffffff', accent: 'ffa500', border: '333333' },
  kacho_ga: { bg: '4d3726', text: 'f0ead8', accent: 'db7c26', border: '6a533d' },
  outrun: { bg: '0d0221', text: 'f8f8f2', accent: 'ff2975', border: '190a30' },
  ocean_dark: { bg: '151d28', text: 'd7dfe2', accent: '5688c4', border: '2d3e4c' },
  city_lights: { bg: '1a1d29', text: 'd7e1e8', accent: '6699cc', border: '2d3548' },
  github_dark: { bg: '0d1117', text: 'c9d1d9', accent: '58a6ff', border: '30363d' },
  'github-dark': { bg: '0d1117', text: 'c9d1d9', accent: '58a6ff', border: '30363d' },
  github: { bg: 'ffffff', text: '333333', accent: '0366d6', border: 'e1e4e8' },
  'react-dark': { bg: '0d1117', text: 'c9d1d9', accent: '61dafb', border: '30363d' },
  discord_old_blurple: { bg: '1e1e1e', text: 'ffffff', accent: '7289da', border: '2f2f2f' },
  aura_dark: { bg: '18181b', text: 'ffffff', accent: 'a855f7', border: '27272a' },
  panda: { bg: '1e1e1e', text: 'ffffff', accent: 'ff85b8', border: '2e2e2e' },
  noctis_minimus: { bg: '1a1b20', text: 'dbd5d1', accent: '9c96b0', border: '2a2c32' },
  cobalt2: { bg: '193549', text: 'ffffff', accent: 'ffc600', border: '19405a' },
  swift: { bg: 'fafafa', text: '000000', accent: 'f05232', border: 'cccccc' },
  aura: { bg: '18181b', text: 'ffffff', accent: 'a855f7', border: '27272a' },
  apprentice: { bg: '262626', text: 'ababab', accent: '7a9e7a', border: '3c3c3c' },
  moltack: { bg: '0d0e14', text: 'e8e6e3', accent: '00a8b5', border: '1e2432' },
  codeSTACKr: { bg: '0d0d0d', text: 'ffffff', accent: '00cc99', border: '1a1a1a' },
  rose_pine: { bg: '191724', text: 'e0def4', accent: '9ccfd8', border: '26233a' },
  catppuccin_latte: { bg: 'eff1f5', text: '4f4f4f', accent: '1e66f5', border: 'ccd0da' },
  catppuccin_mocha: { bg: '1e1e2e', text: 'cdd6f4', accent: 'cba6f7', border: '313244' },
  blue: { bg: '0d1117', text: 'c9d1d9', accent: '58a6ff', border: '30363d' },
};

function generateQuoteSvg(quote: { text: string; author: string }, themeName: string): string {
  const theme = themes[themeName] || themes.default;
  const { bg, text, accent, border } = theme;

  // Escape user-provided content to prevent XSS
  const escapedText = escapeHtml(quote.text);
  const escapedAuthor = escapeHtml(quote.author);

  return `
<svg width="495" height="160" viewBox="0 0 495 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#${bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#${bg};stop-opacity:0.9" />
    </linearGradient>
  </defs>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Merriweather:ital,wght@0,400;1,400&display=swap');
    .quote-text {
      font: 400 16px 'Merriweather', Georgia, serif;
      fill: #${text};
      font-style: italic;
    }
    .quote-mark {
      font: 600 72px Georgia, serif;
      fill: #${accent};
      opacity: 0.3;
    }
    .author {
      font: 500 14px 'Inter', 'Segoe UI', sans-serif;
      fill: #${accent};
    }
    .divider {
      stroke: #${border};
      stroke-width: 1;
    }
  </style>

  <rect width="495" height="160" fill="url(#bgGradient)" rx="10"/>
  <rect x="0" y="0" width="495" height="160" fill="none" rx="10" stroke="#${border}" stroke-width="1"/>

  <text x="20" y="45" class="quote-mark">"</text>
  <text x="25" y="85" class="quote-text" width="445">
    <tspan x="25" dy="0">${escapedText}</tspan>
  </text>

  <line x1="25" y1="110" x2="100" y2="110" class="divider"/>

  <text x="25" y="135" class="author">— ${escapedAuthor}</text>
  <text x="380" y="145" font-family="Inter, sans-serif" font-size="10" fill="#${text}" opacity="0.5">github-profile-maker</text>
</svg>
  `.trim();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'random';
    const themeName = searchParams.get('theme') || 'default';
    const customQuote = searchParams.get('quote');
    const customAuthor = searchParams.get('author');

    // Use custom quote if provided
    if (customQuote && customAuthor) {
      const svg = generateQuoteSvg({ text: customQuote, author: customAuthor }, themeName);
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Filter quotes by type (default to all quotes if type has no matches)
    let filteredQuotes = quotes.filter((q) => q.type === type);
    if (filteredQuotes.length === 0) {
      filteredQuotes = quotes;
    }

    // Pick a random quote
    if (!filteredQuotes.length) {
      return new NextResponse('No quotes available', { status: 500 });
    }
    const quoteIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[quoteIndex];

    if (!quote) {
      return new NextResponse('No quote selected', { status: 500 });
    }

    const svg = generateQuoteSvg(quote, themeName);

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Quote API Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
