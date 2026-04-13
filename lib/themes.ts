// Theme configurations for GitHub Stats cards
export interface StatsTheme {
  bg: string;
  title: string;
  text: string;
  icon: string;
  border: string;
}

export interface LangTheme {
  bg: string;
  title: string;
  text: string;
  border: string;
}

// Stats card themes (with icon color)
export const statsThemes: Record<string, StatsTheme> = {
  default: {
    bg: 'fffefe',
    title: '2f80ed',
    text: '434d58',
    icon: '4c71f2',
    border: 'e4e2e2',
  },
  dark: {
    bg: '151515',
    title: 'fff',
    text: '9f9f9f',
    icon: '79ff97',
    border: 'e4e2e2',
  },
  radical: {
    bg: '141321',
    title: 'fe428e',
    text: 'a9fef7',
    icon: 'f8d847',
    border: 'e4e2e2',
  },
  merko: {
    bg: '0a0f0b',
    title: 'abd200',
    text: '68b587',
    icon: 'b7d364',
    border: 'e4e2e2',
  },
  gruvbox: {
    bg: '282828',
    title: 'fabd2f',
    text: 'ebdbb2',
    icon: 'fe8019',
    border: 'e4e2e2',
  },
  tokyonight: {
    bg: '1a1b27',
    title: '70a5fd',
    text: '38bdae',
    icon: 'bf91f3',
    border: 'e4e2e2',
  },
  onedark: {
    bg: '282c34',
    title: 'e4bf7a',
    text: 'abb2bf',
    icon: '8eb573',
    border: 'e4e2e2',
  },
  dracula: {
    bg: '282a36',
    title: 'ff6e96',
    text: 'f8f8f2',
    icon: 'bd93f9',
    border: 'e4e2e2',
  },
  nord: {
    bg: '2e3440',
    title: '81a1c1',
    text: 'd8dee9',
    icon: '88c0d0',
    border: 'e4e2e2',
  },
  github_dark: {
    bg: '0d1117',
    title: '58a6ff',
    text: 'c9d1d9',
    icon: '1f6feb',
    border: '30363d',
  },
  catppuccin_mocha: {
    bg: '1e1e2e',
    title: '89b4fa',
    text: 'cdd6f4',
    icon: '94e2d5',
    border: '313244',
  },
  rose_pine: {
    bg: '191724',
    title: 'ebbcba',
    text: 'e0def4',
    icon: 'f6c177',
    border: '44403c',
  },
  cobalt: {
    bg: '0f1f3f',
    title: 'c792ea',
    text: 'c3ddee',
    icon: '68d1e8',
    border: '1c2e50',
  },
  synthwave: {
    bg: '262335',
    title: 'ff7edb',
    text: 'f7c1c3',
    icon: 'fede5e',
    border: '3b2e50',
  },
  highcontrast: {
    bg: '000000',
    title: 'ffffff',
    text: '00ff00',
    icon: 'ffff00',
    border: 'ffffff',
  },
  monokai: {
    bg: '272822',
    title: 'f92672',
    text: 'f8f8f2',
    icon: 'a6e22e',
    border: '3e3d32',
  },
  vue: {
    bg: '1e1e1e',
    title: '42b883',
    text: 'ffffff',
    icon: '41b883',
    border: '3e3e3e',
  },
  'vue-dark': {
    bg: '1e1e1e',
    title: '42b883',
    text: 'ffffff',
    icon: '41b883',
    border: '3e3e3e',
  },
  'shades-of-purple': {
    bg: '1a1b26',
    title: 'b58900',
    text: 'c0caf5',
    icon: '7aa2f7',
    border: '414868',
  },
  nightowl: {
    bg: '011627',
    title: 'c792ea',
    text: 'd6deeb',
    icon: '7fdbca',
    border: '1e3a5f',
  },
  prussian: {
    bg: '172c45',
    title: 'dcbdfb',
    text: '99c1f1',
    icon: '99c1f1',
    border: '2e4050',
  },
  buefy: {
    bg: '1a1b26',
    title: 'ffd866',
    text: 'a9b1d6',
    icon: '7aa2f7',
    border: '414868',
  },
  'blue-green': {
    bg: '041c2c',
    title: '5fb3a1',
    text: 'addb67',
    icon: '5fb3a1',
    border: '0d2a3c',
  },
  algolia: {
    bg: '1f1f1f',
    title: '00aeff',
    text: 'ffffff',
    icon: '00aeff',
    border: '333333',
  },
  'great-gatsby': {
    bg: '1a1a2e',
    title: 'd4af37',
    text: 'eeeeee',
    icon: 'd4af37',
    border: '16213e',
  },
  darcula: {
    bg: '282a36',
    title: 'ff79c6',
    text: 'f8f8f2',
    icon: 'bd93f9',
    border: '44475a',
  },
  bear: {
    bg: '1f1f1f',
    title: 'e06c75',
    text: 'd19a66',
    icon: '98c379',
    border: '2d2d2d',
  },
  'solarized-dark': {
    bg: '002b36',
    title: 'b58900',
    text: '93a1a1',
    icon: '2aa198',
    border: '073642',
  },
  'solarized-light': {
    bg: 'fdf6e3',
    title: 'b58900',
    text: '657b83',
    icon: '2aa198',
    border: 'eee8d5',
  },
  gotham: {
    bg: '111111',
    title: '99d1ce',
    text: 'd3c3c9',
    icon: '599bb3',
    border: '222222',
  },
  'material-palenight': {
    bg: '292d3e',
    title: 'c792ea',
    text: '959dcb',
    icon: '82aaff',
    border: '3e4451',
  },
  graywhite: {
    bg: '1a1a1a',
    title: 'ffffff',
    text: '888888',
    icon: '666666',
    border: '333333',
  },
  'vision-friendly-dark': {
    bg: '091b27',
    title: 'addb67',
    text: 'dbdbdb',
    icon: 'addb67',
    border: '162e42',
  },
  'ayu-mirage': {
    bg: '1a1e2e',
    title: 'f4a261',
    text: 'b8c5d6',
    icon: 'e6b450',
    border: '2d3044',
  },
  'midnight-purple': {
    bg: '1a1b26',
    title: 'bb9af7',
    text: '9aa5ce',
    icon: '7aa2f7',
    border: '414868',
  },
};

// Language card themes (without icon color)
export const langThemes: Record<string, LangTheme> = {
  default: { bg: 'fffefe', title: '2f80ed', text: '434d58', border: 'e4e2e2' },
  dark: { bg: '151515', title: 'fff', text: '9f9f9f', border: 'e4e2e2' },
  tokyonight: { bg: '1a1b27', title: '70a5fd', text: '38bdae', border: 'e4e2e2' },
  dracula: { bg: '282a36', title: 'ff6e96', text: 'f8f8f2', border: 'e4e2e2' },
  radical: { bg: '141321', title: 'fe428e', text: 'a9fef7', border: 'e4e2e2' },
  merko: { bg: '0a0f0b', title: 'abd200', text: '68b587', border: 'e4e2e2' },
  gruvbox: { bg: '282828', title: 'fabd2f', text: 'ebdbb2', border: 'e4e2e2' },
  onedark: { bg: '282c34', title: 'e4bf7a', text: 'abb2bf', border: 'e4e2e2' },
  nord: { bg: '2e3440', title: '81a1c1', text: 'd8dee9', border: 'e4e2e2' },
  github_dark: { bg: '0d1117', title: '58a6ff', text: 'c9d1d9', border: '30363d' },
  catppuccin_mocha: { bg: '1e1e2e', title: '89b4fa', text: 'cdd6f4', border: '313244' },
  rose_pine: { bg: '191724', title: 'ebbcba', text: 'e0def4', border: '44403c' },
  cobalt: { bg: '0f1f3f', title: 'c792ea', text: 'c3ddee', border: '1c2e50' },
  synthwave: { bg: '262335', title: 'ff7edb', text: 'f7c1c3', border: '3b2e50' },
  highcontrast: { bg: '000000', title: 'ffffff', text: '00ff00', border: 'ffffff' },
  monokai: { bg: '272822', title: 'f92672', text: 'f8f8f2', border: '3e3d32' },
  vue: { bg: '1e1e1e', title: '42b883', text: 'ffffff', border: '3e3e3e' },
  'vue-dark': { bg: '1e1e1e', title: '42b883', text: 'ffffff', border: '3e3e3e' },
  'shades-of-purple': { bg: '1a1b26', title: 'b58900', text: 'c0caf5', border: '414868' },
  nightowl: { bg: '011627', title: 'c792ea', text: 'd6deeb', border: '1e3a5f' },
  prussian: { bg: '172c45', title: 'dcbdfb', text: '99c1f1', border: '2e4050' },
  buefy: { bg: '1a1b26', title: 'ffd866', text: 'a9b1d6', border: '414868' },
  'blue-green': { bg: '041c2c', title: '5fb3a1', text: 'addb67', border: '0d2a3c' },
  algolia: { bg: '1f1f1f', title: '00aeff', text: 'ffffff', border: '333333' },
  'great-gatsby': { bg: '1a1a2e', title: 'd4af37', text: 'eeeeee', border: '16213e' },
  darcula: { bg: '282a36', title: 'ff79c6', text: 'f8f8f2', border: '44475a' },
  bear: { bg: '1f1f1f', title: 'e06c75', text: 'd19a66', border: '2d2d2d' },
  'solarized-dark': { bg: '002b36', title: 'b58900', text: '93a1a1', border: '073642' },
  'solarized-light': { bg: 'fdf6e3', title: 'b58900', text: '657b83', border: 'eee8d5' },
  gotham: { bg: '111111', title: '99d1ce', text: 'd3c3c9', border: '222222' },
  'material-palenight': { bg: '292d3e', title: 'c792ea', text: '959dcb', border: '3e4451' },
  graywhite: { bg: '1a1a1a', title: 'ffffff', text: '888888', border: '333333' },
  'vision-friendly-dark': { bg: '091b27', title: 'addb67', text: 'dbdbdb', border: '162e42' },
  'ayu-mirage': { bg: '1a1e2e', title: 'f4a261', text: 'b8c5d6', border: '2d3044' },
  'midnight-purple': { bg: '1a1b26', title: 'bb9af7', text: '9aa5ce', border: '414868' },
};

// Streak card themes
export interface StreakTheme {
  bg: string;
  text: string;
  fire: string;
  ring: string;
  currStreak: string;
  sideNums: string;
  sideLabels: string;
  dates: string;
  border: string;
}

export const streakThemes: Record<string, StreakTheme> = {
  default: {
    bg: 'fffefe',
    text: '434d58',
    fire: 'f5700c',
    ring: '4c71f2',
    currStreak: '151515',
    sideNums: '434d58',
    sideLabels: '434d58',
    dates: '434d58',
    border: 'e4e2e2',
  },
  dark: {
    bg: '151515',
    text: '9f9f9f',
    fire: 'f5700c',
    ring: '79ff97',
    currStreak: 'fff',
    sideNums: '9f9f9f',
    sideLabels: '9f9f9f',
    dates: '9f9f9f',
    border: 'e4e2e2',
  },
  tokyonight: {
    bg: '1a1b27',
    text: '38bdae',
    fire: 'bf91f3',
    ring: '70a5fd',
    currStreak: '70a5fd',
    sideNums: 'bf91f3',
    sideLabels: '38bdae',
    dates: '38bdae',
    border: 'e4e2e2',
  },
  dracula: {
    bg: '282a36',
    text: 'f8f8f2',
    fire: 'ffb86c',
    ring: 'ff6e96',
    currStreak: 'ff6e96',
    sideNums: 'bd93f9',
    sideLabels: 'f8f8f2',
    dates: 'f8f8f2',
    border: 'e4e2e2',
  },
  radical: {
    bg: '141321',
    text: 'a9fef7',
    fire: 'f8d847',
    ring: 'fe428e',
    currStreak: 'fe428e',
    sideNums: 'f8d847',
    sideLabels: 'a9fef7',
    dates: 'a9fef7',
    border: 'e4e2e2',
  },
  github_dark: {
    bg: '0d1117',
    text: 'c9d1d9',
    fire: 'f5700c',
    ring: '58a6ff',
    currStreak: '58a6ff',
    sideNums: '1f6feb',
    sideLabels: 'c9d1d9',
    dates: 'c9d1d9',
    border: '30363d',
  },
  catppuccin_mocha: {
    bg: '1e1e2e',
    text: 'cdd6f4',
    fire: 'fab387',
    ring: '89b4fa',
    currStreak: '89b4fa',
    sideNums: '94e2d5',
    sideLabels: 'cdd6f4',
    dates: 'cdd6f4',
    border: '313244',
  },
  // Additional themes to match UI
  merko: {
    bg: '0a0f0b',
    text: '68b587',
    fire: 'b7d364',
    ring: 'abd200',
    currStreak: 'abd200',
    sideNums: 'b7d364',
    sideLabels: '68b587',
    dates: '68b587',
    border: 'e4e2e2',
  },
  gruvbox: {
    bg: '282828',
    text: 'ebdbb2',
    fire: 'fe8019',
    ring: 'fabd2f',
    currStreak: 'fabd2f',
    sideNums: 'fe8019',
    sideLabels: 'ebdbb2',
    dates: 'ebdbb2',
    border: 'e4e2e2',
  },
  onedark: {
    bg: '282c34',
    text: 'abb2bf',
    fire: '8eb573',
    ring: 'e4bf7a',
    currStreak: 'e4bf7a',
    sideNums: '8eb573',
    sideLabels: 'abb2bf',
    dates: 'abb2bf',
    border: 'e4e2e2',
  },
  nord: {
    bg: '2e3440',
    text: 'd8dee9',
    fire: '88c0d0',
    ring: '81a1c1',
    currStreak: '81a1c1',
    sideNums: '88c0d0',
    sideLabels: 'd8dee9',
    dates: 'd8dee9',
    border: 'e4e2e2',
  },
  cobalt: {
    bg: '0f1f3f',
    text: 'c3ddee',
    fire: '68d1e8',
    ring: 'c792ea',
    currStreak: 'c792ea',
    sideNums: '68d1e8',
    sideLabels: 'c3ddee',
    dates: 'c3ddee',
    border: '1c2e50',
  },
  synthwave: {
    bg: '262335',
    text: 'f7c1c3',
    fire: 'fede5e',
    ring: 'ff7edb',
    currStreak: 'ff7edb',
    sideNums: 'fede5e',
    sideLabels: 'f7c1c3',
    dates: 'f7c1c3',
    border: '3b2e50',
  },
  highcontrast: {
    bg: '000000',
    text: '00ff00',
    fire: 'ffff00',
    ring: 'ffffff',
    currStreak: 'ffffff',
    sideNums: 'ffff00',
    sideLabels: '00ff00',
    dates: '00ff00',
    border: 'ffffff',
  },
  monokai: {
    bg: '272822',
    text: 'f8f8f2',
    fire: 'a6e22e',
    ring: 'f92672',
    currStreak: 'f92672',
    sideNums: 'a6e22e',
    sideLabels: 'f8f8f2',
    dates: 'f8f8f2',
    border: '3e3d32',
  },
  vue: {
    bg: '1e1e1e',
    text: 'ffffff',
    fire: '41b883',
    ring: '42b883',
    currStreak: '42b883',
    sideNums: '41b883',
    sideLabels: 'ffffff',
    dates: 'ffffff',
    border: '3e3e3e',
  },
  'vue-dark': {
    bg: '1e1e1e',
    text: 'ffffff',
    fire: '41b883',
    ring: '42b883',
    currStreak: '42b883',
    sideNums: '41b883',
    sideLabels: 'ffffff',
    dates: 'ffffff',
    border: '3e3e3e',
  },
  'shades-of-purple': {
    bg: '1a1b26',
    text: 'c0caf5',
    fire: '7aa2f7',
    ring: 'b58900',
    currStreak: 'b58900',
    sideNums: '7aa2f7',
    sideLabels: 'c0caf5',
    dates: 'c0caf5',
    border: '414868',
  },
  nightowl: {
    bg: '011627',
    text: 'd6deeb',
    fire: '7fdbca',
    ring: 'c792ea',
    currStreak: 'c792ea',
    sideNums: '7fdbca',
    sideLabels: 'd6deeb',
    dates: 'd6deeb',
    border: '1e3a5f',
  },
  prussian: {
    bg: '172c45',
    text: '99c1f1',
    fire: '99c1f1',
    ring: 'dcbdfb',
    currStreak: 'dcbdfb',
    sideNums: '99c1f1',
    sideLabels: '99c1f1',
    dates: '99c1f1',
    border: '2e4050',
  },
  buefy: {
    bg: '1a1b26',
    text: 'a9b1d6',
    fire: '7aa2f7',
    ring: 'ffd866',
    currStreak: 'ffd866',
    sideNums: '7aa2f7',
    sideLabels: 'a9b1d6',
    dates: 'a9b1d6',
    border: '414868',
  },
  'blue-green': {
    bg: '041c2c',
    text: 'addb67',
    fire: '5fb3a1',
    ring: '5fb3a1',
    currStreak: '5fb3a1',
    sideNums: '5fb3a1',
    sideLabels: 'addb67',
    dates: 'addb67',
    border: '0d2a3c',
  },
  algolia: {
    bg: '1f1f1f',
    text: 'ffffff',
    fire: '00aeff',
    ring: '00aeff',
    currStreak: '00aeff',
    sideNums: '00aeff',
    sideLabels: 'ffffff',
    dates: 'ffffff',
    border: '333333',
  },
  'great-gatsby': {
    bg: '1a1a2e',
    text: 'eeeeee',
    fire: 'd4af37',
    ring: 'd4af37',
    currStreak: 'd4af37',
    sideNums: 'd4af37',
    sideLabels: 'eeeeee',
    dates: 'eeeeee',
    border: '16213e',
  },
  darcula: {
    bg: '282a36',
    text: 'f8f8f2',
    fire: 'bd93f9',
    ring: 'ff79c6',
    currStreak: 'ff79c6',
    sideNums: 'bd93f9',
    sideLabels: 'f8f8f2',
    dates: 'f8f8f2',
    border: '44475a',
  },
  bear: {
    bg: '1f1f1f',
    text: 'd19a66',
    fire: '98c379',
    ring: 'e06c75',
    currStreak: 'e06c75',
    sideNums: '98c379',
    sideLabels: 'd19a66',
    dates: 'd19a66',
    border: '2d2d2d',
  },
  'solarized-dark': {
    bg: '002b36',
    text: '93a1a1',
    fire: '2aa198',
    ring: 'b58900',
    currStreak: 'b58900',
    sideNums: '2aa198',
    sideLabels: '93a1a1',
    dates: '93a1a1',
    border: '073642',
  },
  'solarized-light': {
    bg: 'fdf6e3',
    text: '657b83',
    fire: '2aa198',
    ring: 'b58900',
    currStreak: 'b58900',
    sideNums: '2aa198',
    sideLabels: '657b83',
    dates: '657b83',
    border: 'eee8d5',
  },
  gotham: {
    bg: '111111',
    text: 'd3c3c9',
    fire: '599bb3',
    ring: '99d1ce',
    currStreak: '99d1ce',
    sideNums: '599bb3',
    sideLabels: 'd3c3c9',
    dates: 'd3c3c9',
    border: '222222',
  },
  'material-palenight': {
    bg: '292d3e',
    text: '959dcb',
    fire: '82aaff',
    ring: 'c792ea',
    currStreak: 'c792ea',
    sideNums: '82aaff',
    sideLabels: '959dcb',
    dates: '959dcb',
    border: '3e4451',
  },
  graywhite: {
    bg: '1a1a1a',
    text: '888888',
    fire: '666666',
    ring: 'ffffff',
    currStreak: 'ffffff',
    sideNums: '666666',
    sideLabels: '888888',
    dates: '888888',
    border: '333333',
  },
  'vision-friendly-dark': {
    bg: '091b27',
    text: 'dbdbdb',
    fire: 'addb67',
    ring: 'addb67',
    currStreak: 'addb67',
    sideNums: 'addb67',
    sideLabels: 'dbdbdb',
    dates: 'dbdbdb',
    border: '162e42',
  },
  'ayu-mirage': {
    bg: '1a1e2e',
    text: 'b8c5d6',
    fire: 'e6b450',
    ring: 'f4a261',
    currStreak: 'f4a261',
    sideNums: 'e6b450',
    sideLabels: 'b8c5d6',
    dates: 'b8c5d6',
    border: '2d3044',
  },
  'midnight-purple': {
    bg: '1a1b26',
    text: '9aa5ce',
    fire: '7aa2f7',
    ring: 'bb9af7',
    currStreak: 'bb9af7',
    sideNums: '7aa2f7',
    sideLabels: '9aa5ce',
    dates: '9aa5ce',
    border: '414868',
  },
};

// Activity graph themes
export interface ActivityTheme {
  bg: string;
  text: string;
  border: string;
  // Contribution colors
  color0: string;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
}

export const activityThemes: Record<string, ActivityTheme> = {
  default: {
    bg: 'fffefe',
    text: '434d58',
    border: 'e4e2e2',
    color0: 'ebedf0',
    color1: '9be9a8',
    color2: '40c463',
    color3: '30a14e',
    color4: '216e39',
  },
  dark: {
    bg: '0d1117',
    text: 'c9d1d9',
    border: '30363d',
    color0: '161b22',
    color1: '0e4429',
    color2: '006d32',
    color3: '26a641',
    color4: '39d353',
  },
  tokyonight: {
    bg: '1a1b27',
    text: '38bdae',
    border: 'e4e2e2',
    color0: '2a2e3f',
    color1: '3d59a1',
    color2: '7aa2f7',
    color3: 'bb9af7',
    color4: '7dcfff',
  },
  dracula: {
    bg: '282a36',
    text: 'f8f8f2',
    border: 'e4e2e2',
    color0: '44475a',
    color1: 'ffb86c',
    color2: 'ff79c6',
    color3: 'bd93f9',
    color4: '50fa7b',
  },
  radical: {
    bg: '141321',
    text: 'a9fef7',
    border: 'e4e2e2',
    color0: '2a2a3f',
    color1: '3d3c7a',
    color2: '7a6ec9',
    color3: 'fe428e',
    color4: 'f8d847',
  },
  github_dark: {
    bg: '0d1117',
    text: 'c9d1d9',
    border: '30363d',
    color0: '161b22',
    color1: '0e4429',
    color2: '006d32',
    color3: '26a641',
    color4: '39d353',
  },
  catppuccin_mocha: {
    bg: '1e1e2e',
    text: 'cdd6f4',
    border: '313244',
    color0: '313244',
    color1: '45475a',
    color2: '89b4fa',
    color3: 'f5c2e7',
    color4: '94e2d5',
  },
  // Additional themes to match UI
  merko: {
    bg: '0a0f0b',
    text: '68b587',
    border: 'e4e2e2',
    color0: '0a0f0b',
    color1: '1a2e1a',
    color2: '2d4a2d',
    color3: '4a7c4a',
    color4: 'abd200',
  },
  gruvbox: {
    bg: '282828',
    text: 'ebdbb2',
    border: 'e4e2e2',
    color0: '3c3836',
    color1: '4c3c2e',
    color2: '665c54',
    color3: 'b8bb26',
    color4: 'fabd2f',
  },
  onedark: {
    bg: '282c34',
    text: 'abb2bf',
    border: 'e4e2e2',
    color0: '3e4451',
    color1: '4b5263',
    color2: '61afef',
    color3: 'c678dd',
    color4: '98c379',
  },
  nord: {
    bg: '2e3440',
    text: 'd8dee9',
    border: 'e4e2e2',
    color0: '3b4252',
    color1: '434c5e',
    color2: '81a1c1',
    color3: '88c0d0',
    color4: 'a3be8c',
  },
  cobalt: {
    bg: '0f1f3f',
    text: 'c3ddee',
    border: '1c2e50',
    color0: '0f1f3f',
    color1: '1c3a5e',
    color2: '2c5a8e',
    color3: '68d1e8',
    color4: 'c792ea',
  },
  synthwave: {
    bg: '262335',
    text: 'f7c1c3',
    border: '3b2e50',
    color0: '262335',
    color1: '362e47',
    color2: '5c3d5e',
    color3: 'ff7edb',
    color4: 'fede5e',
  },
  highcontrast: {
    bg: '000000',
    text: '00ff00',
    border: 'ffffff',
    color0: '000000',
    color1: '003300',
    color2: '006600',
    color3: '009900',
    color4: '00ff00',
  },
  monokai: {
    bg: '272822',
    text: 'f8f8f2',
    border: '3e3d32',
    color0: '272822',
    color1: '3e3d32',
    color2: '75715e',
    color3: 'a6e22e',
    color4: 'f92672',
  },
  vue: {
    bg: '1e1e1e',
    text: 'ffffff',
    border: '3e3e3e',
    color0: '1e1e1e',
    color1: '2e2e2e',
    color2: '35495e',
    color3: '41b883',
    color4: '42b883',
  },
  'vue-dark': {
    bg: '1e1e1e',
    text: 'ffffff',
    border: '3e3e3e',
    color0: '1e1e1e',
    color1: '2e2e2e',
    color2: '35495e',
    color3: '41b883',
    color4: '42b883',
  },
  'shades-of-purple': {
    bg: '1a1b26',
    text: 'c0caf5',
    border: '414868',
    color0: '1a1b26',
    color1: '24283b',
    color2: '414868',
    color3: '7aa2f7',
    color4: 'bb9af7',
  },
  nightowl: {
    bg: '011627',
    text: 'd6deeb',
    border: '1e3a5f',
    color0: '011627',
    color1: '0b2942',
    color2: '1f5175',
    color3: '7fdbca',
    color4: 'c792ea',
  },
  prussian: {
    bg: '172c45',
    text: '99c1f1',
    border: '2e4050',
    color0: '172c45',
    color1: '243b55',
    color2: '2e5070',
    color3: '99c1f1',
    color4: 'dcbdfb',
  },
  buefy: {
    bg: '1a1b26',
    text: 'a9b1d6',
    border: '414868',
    color0: '1a1b26',
    color1: '24283b',
    color2: '414868',
    color3: '7aa2f7',
    color4: 'ffd866',
  },
  'blue-green': {
    bg: '041c2c',
    text: 'addb67',
    border: '0d2a3c',
    color0: '041c2c',
    color1: '072a3c',
    color2: '0a3a4c',
    color3: '5fb3a1',
    color4: 'addb67',
  },
  algolia: {
    bg: '1f1f1f',
    text: 'ffffff',
    border: '333333',
    color0: '1f1f1f',
    color1: '2f2f2f',
    color2: '3f3f3f',
    color3: '00aeff',
    color4: '00aeff',
  },
  'great-gatsby': {
    bg: '1a1a2e',
    text: 'eeeeee',
    border: '16213e',
    color0: '1a1a2e',
    color1: '16213e',
    color2: '1f2f52',
    color3: 'd4af37',
    color4: 'd4af37',
  },
  darcula: {
    bg: '282a36',
    text: 'f8f8f2',
    border: '44475a',
    color0: '282a36',
    color1: '44475a',
    color2: '6272a4',
    color3: 'bd93f9',
    color4: 'ff79c6',
  },
  bear: {
    bg: '1f1f1f',
    text: 'd19a66',
    border: '2d2d2d',
    color0: '1f1f1f',
    color1: '2d2d2d',
    color2: '3d3d3d',
    color3: '98c379',
    color4: 'e06c75',
  },
  'solarized-dark': {
    bg: '002b36',
    text: '93a1a1',
    border: '073642',
    color0: '002b36',
    color1: '073642',
    color2: '586e75',
    color3: '2aa198',
    color4: 'b58900',
  },
  'solarized-light': {
    bg: 'fdf6e3',
    text: '657b83',
    border: 'eee8d5',
    color0: 'fdf6e3',
    color1: 'eee8d5',
    color2: '93a1a1',
    color3: '2aa198',
    color4: 'b58900',
  },
  gotham: {
    bg: '111111',
    text: 'd3c3c9',
    border: '222222',
    color0: '111111',
    color1: '1c1c1c',
    color2: '2c2c2c',
    color3: '599bb3',
    color4: '99d1ce',
  },
  'material-palenight': {
    bg: '292d3e',
    text: '959dcb',
    border: '3e4451',
    color0: '292d3e',
    color1: '3e4451',
    color2: '676e95',
    color3: '82aaff',
    color4: 'c792ea',
  },
  graywhite: {
    bg: '1a1a1a',
    text: '888888',
    border: '333333',
    color0: '1a1a1a',
    color1: '2a2a2a',
    color2: '3a3a3a',
    color3: '666666',
    color4: 'ffffff',
  },
  'vision-friendly-dark': {
    bg: '091b27',
    text: 'dbdbdb',
    border: '162e42',
    color0: '091b27',
    color1: '162e42',
    color2: '23415d',
    color3: 'addb67',
    color4: 'addb67',
  },
  'ayu-mirage': {
    bg: '1a1e2e',
    text: 'b8c5d6',
    border: '2d3044',
    color0: '1a1e2e',
    color1: '2d3044',
    color2: '3f455a',
    color3: 'f4a261',
    color4: 'e6b450',
  },
  'midnight-purple': {
    bg: '1a1b26',
    text: '9aa5ce',
    border: '414868',
    color0: '1a1b26',
    color1: '24283b',
    color2: '414868',
    color3: '7aa2f7',
    color4: 'bb9af7',
  },
  github: {
    bg: 'ffffff',
    text: '24292e',
    border: 'e1e4e8',
    color0: 'ebedf0',
    color1: '9be9a8',
    color2: '40c463',
    color3: '30a14e',
    color4: '216e39',
  },
  rogue: {
    bg: '1f1f2e',
    text: 'c5c5c5',
    border: '3d3d3d',
    color0: '1f1f2e',
    color1: '2f2f3e',
    color2: '3f3f4e',
    color3: 'ff79c6',
    color4: 'ffb86c',
  },
  'react-dark': {
    bg: '1a1a1a',
    text: 'ffffff',
    border: '333333',
    color0: '1a1a1a',
    color1: '2d2d2d',
    color2: '61dafb',
    color3: '61dafb',
    color4: 'ffffff',
  },
};

const THEME_ALIASES: Record<string, string> = {
  'github-dark': 'github_dark',
  github: 'default',
  'tokyo-night': 'tokyonight',
  'react-dark': 'react',
};

function resolveThemeKey<T>(themeName: string, themes: Record<string, T>): string | undefined {
  const normalizedName = themeName.toLowerCase();
  const candidates = [
    normalizedName,
    THEME_ALIASES[normalizedName],
    normalizedName.replace(/-/g, '_'),
    normalizedName.replace(/_/g, '-'),
    THEME_ALIASES[normalizedName.replace(/-/g, '_')],
    THEME_ALIASES[normalizedName.replace(/_/g, '-')],
  ].filter(Boolean) as string[];

  return candidates.find((candidate) => candidate in themes);
}

function deriveStreakTheme(theme: StatsTheme): StreakTheme {
  return {
    bg: theme.bg,
    text: theme.text,
    fire: theme.icon,
    ring: theme.title,
    currStreak: theme.title,
    sideNums: theme.icon,
    sideLabels: theme.text,
    dates: theme.text,
    border: theme.border,
  };
}

function deriveActivityTheme(theme: StatsTheme): ActivityTheme {
  return {
    bg: theme.bg,
    text: theme.text,
    border: theme.border,
    color0: theme.bg,
    color1: theme.border,
    color2: theme.text,
    color3: theme.icon,
    color4: theme.title,
  };
}

// Helper functions

// Parse custom theme string format: "custom:bg_title_text_icon_border"
function parseCustomTheme(themeName: string): StatsTheme | null {
  if (!themeName.startsWith('custom:')) {
    return null;
  }

  const colors = themeName.replace('custom:', '');
  const parts = colors.split('_');

  if (parts.length >= 5) {
    return {
      bg: parts[0] || 'fffefe',
      title: parts[1] || '2f80ed',
      text: parts[2] || '434d58',
      icon: parts[3] || '4c71f2',
      border: parts[4] || 'e4e2e2',
    };
  }

  return null;
}

export function getStatsTheme(themeName: string): StatsTheme {
  // Check for custom theme first
  const customTheme = parseCustomTheme(themeName);
  if (customTheme) {
    return customTheme;
  }

  const key = resolveThemeKey(themeName, statsThemes);
  return key ? statsThemes[key] : statsThemes.default;
}

export function getLangTheme(themeName: string): LangTheme {
  // Check for custom theme - for lang themes we use bg, title, text, border
  const customStats = parseCustomTheme(themeName);
  if (customStats) {
    return {
      bg: customStats.bg,
      title: customStats.title,
      text: customStats.text,
      border: customStats.border,
    };
  }

  const key = resolveThemeKey(themeName, langThemes);
  return key ? langThemes[key] : langThemes.default;
}

export function getStreakTheme(themeName: string): StreakTheme {
  // Check for custom theme
  const customStats = parseCustomTheme(themeName);
  if (customStats) {
    return {
      bg: customStats.bg,
      text: customStats.text,
      fire: customStats.icon,
      ring: customStats.title,
      currStreak: customStats.title,
      sideNums: customStats.icon,
      sideLabels: customStats.text,
      dates: customStats.text,
      border: customStats.border,
    };
  }

  const key = resolveThemeKey(themeName, streakThemes);
  if (key) return streakThemes[key];

  return deriveStreakTheme(getStatsTheme(themeName));
}

// Wakatime card themes
export interface WakatimeTheme {
  bg: string;
  text: string;
  title: string;
  progress: string;
  progressBg: string;
  border: string;
}

export const wakatimeThemes: Record<string, WakatimeTheme> = {
  default: {
    bg: 'ffffff',
    text: '434d58',
    title: '151515',
    progress: '378dff',
    progressBg: 'e4e2e2',
    border: 'e4e2e2',
  },
  dark: {
    bg: '151515',
    text: '9f9f9f',
    title: 'ffffff',
    progress: '378dff',
    progressBg: '2d333b',
    border: '444c56',
  },
  tokyonight: {
    bg: '1a1b27',
    text: '38bdae',
    title: '70a5fd',
    progress: '70a5fd',
    progressBg: '2f3549',
    border: '2f3549',
  },
};

function deriveWakatimeTheme(theme: StatsTheme): WakatimeTheme {
  return {
    bg: theme.bg || 'ffffff',
    text: theme.text || '434d58',
    title: theme.title || '151515',
    progress: theme.icon || '378dff',
    progressBg: 'e4e2e2',
    border: theme.border || 'e4e2e2',
  };
}

export function getWakatimeTheme(themeName: string): WakatimeTheme {
  // Check for custom theme
  if (wakatimeThemes[themeName]) {
    return { ...wakatimeThemes[themeName] };
  }

  // Derive from stats theme
  return deriveWakatimeTheme(getStatsTheme(themeName));
}

export function getActivityTheme(themeName: string): ActivityTheme {
  // Check for custom theme
  const customStats = parseCustomTheme(themeName);
  if (customStats) {
    return {
      bg: customStats.bg,
      text: customStats.text,
      border: customStats.border,
      color0: customStats.bg,
      color1: customStats.border,
      color2: customStats.text,
      color3: customStats.icon,
      color4: customStats.title,
    };
  }

  const key = resolveThemeKey(themeName, activityThemes);
  if (key) return activityThemes[key];

  return deriveActivityTheme(getStatsTheme(themeName));
}
