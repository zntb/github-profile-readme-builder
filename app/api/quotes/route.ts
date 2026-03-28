import { NextRequest, NextResponse } from 'next/server';

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
  onedark: { bg: '282c34', text: 'abb2bf', accent: 'e5c07b', border: '3e4451' },
  dracula: { bg: '282a36', text: 'f8f8f2', accent: 'bd93f9', border: '44475a' },
  nord: { bg: '2e3440', text: 'd8dee9', accent: '88c0d0', border: '3b4252' },
  github_dark: { bg: '0d1117', text: 'c9d1d9', accent: '58a6ff', border: '30363d' },
};

function generateQuoteSvg(quote: { text: string; author: string }, themeName: string): string {
  const theme = themes[themeName] || themes.default;
  const { bg, text, accent, border } = theme;

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
    <tspan x="25" dy="0">${quote.text}</tspan>
  </text>

  <line x1="25" y1="110" x2="100" y2="110" class="divider"/>

  <text x="25" y="135" class="author">— ${quote.author}</text>
  <text x="380" y="145" font-family="Inter, sans-serif" font-size="10" fill="#${text}" opacity="0.5">github-profile-readme-builder</text>
</svg>
  `.trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const type = searchParams.get('type') || 'random';
  const themeName = searchParams.get('theme') || 'default';

  // Filter quotes by type
  const filteredQuotes = quotes.filter((q) => q.type === type || type === 'random');

  // Pick a random quote
  const quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];

  const svg = generateQuoteSvg(quote, themeName);

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
