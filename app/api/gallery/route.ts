import { NextRequest, NextResponse } from 'next/server';

import type { CommunityProfile } from '@/lib/types';

// In-memory storage for community profiles (in production, use a database)
const communityProfiles: CommunityProfile[] = [
  {
    id: '1',
    name: 'Full Stack Developer',
    username: 'octocat',
    avatarUrl: 'https://github.com/octocat.png',
    blocks: [
      {
        id: 'header-1',
        type: 'capsule-header',
        props: {
          text: "Hi, I'm Octocat! 👋",
          type: 'waving',
          color: '0:EEFF00,100:a]82DA',
          height: 200,
          section: 'header',
        },
      },
      {
        id: 'avatar-1',
        type: 'avatar',
        props: {
          imageUrl: 'https://github.com/octocat.png',
          size: 150,
          borderRadius: 50,
        },
      },
      {
        id: 'stats-1',
        type: 'stats-row',
        props: {
          direction: 'row',
          gap: 12,
          cardWidth: '49%',
          cardHeight: 230,
          theme: 'tokyonight',
        },
      },
    ],
    likes: 42,
    favorites: 15,
    views: 1234,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Open Source Enthusiast',
    username: 'torvalds',
    avatarUrl: 'https://github.com/torvalds.png',
    blocks: [
      {
        id: 'header-2',
        type: 'capsule-header',
        props: {
          text: 'Open Source Maintainer 💻',
          type: 'typing',
          color: '36BCF7',
          height: 180,
          section: 'header',
        },
      },
      {
        id: 'stats-card-2',
        type: 'stats-card',
        props: {
          username: 'torvalds',
          theme: 'dracula',
          layoutStyle: 'standard',
          showIcons: true,
          hideBorder: false,
          borderRadius: 10,
        },
      },
    ],
    likes: 128,
    favorites: 45,
    views: 5678,
    createdAt: '2024-02-20T14:30:00Z',
    updatedAt: '2024-02-20T14:30:00Z',
    isFeatured: true,
  },
  {
    id: '3',
    name: 'Machine Learning Engineer',
    username: 'googlesamples',
    avatarUrl: 'https://github.com/googlesamples.png',
    blocks: [
      {
        id: 'greeting-3',
        type: 'greeting',
        props: {
          text: 'Hi, I build AI! 🤖',
          emoji: '🤖',
          alignment: 'center',
        },
      },
      {
        id: 'trophies-3',
        type: 'trophies',
        props: {
          username: 'googlesamples',
          theme: 'tokyonight',
          column: 6,
          row: 1,
        },
      },
    ],
    likes: 89,
    favorites: 32,
    views: 2345,
    createdAt: '2024-03-10T09:15:00Z',
    updatedAt: '2024-03-10T09:15:00Z',
  },
  {
    id: '4',
    name: 'DevOps Champion',
    username: 'docker',
    avatarUrl: 'https://github.com/docker.png',
    blocks: [
      {
        id: 'skills-4',
        type: 'skill-icons',
        props: {
          icons: ['docker', 'kubernetes', 'aws', 'linux', 'git'],
          perLine: 5,
          theme: 'dark',
        },
      },
      {
        id: 'streak-4',
        type: 'streak-stats',
        props: {
          username: 'docker',
          theme: 'monokai',
          hideBorder: false,
          borderRadius: 10,
        },
      },
    ],
    likes: 156,
    favorites: 67,
    views: 8901,
    createdAt: '2024-04-05T16:45:00Z',
    updatedAt: '2024-04-05T16:45:00Z',
    isFeatured: true,
  },
  {
    id: '5',
    name: 'Web Wizard',
    username: 'vercel',
    avatarUrl: 'https://github.com/vercel.png',
    blocks: [
      {
        id: 'header-5',
        type: 'capsule-header',
        props: {
          text: 'Building the Future 🌐',
          type: 'static',
          color: '0:6366f1,100:8b5cf6',
          height: 160,
          section: 'header',
        },
      },
      {
        id: 'social-5',
        type: 'social-badges',
        props: {
          github: 'vercel',
          twitter: '',
          linkedin: '',
          style: 'for-the-badge',
        },
      },
    ],
    likes: 234,
    favorites: 89,
    views: 12345,
    createdAt: '2024-05-01T11:20:00Z',
    updatedAt: '2024-05-01T11:20:00Z',
  },
];

// User interactions storage (in production, use a database)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const userLikes: Map<string, Set<string>> = new Map(); // profileId -> Set of userIds who liked
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const userFavorites: Map<string, Set<string>> = new Map(); // profileId -> Set of userIds who favorited

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get('sort') || 'recent'; // recent, popular, most-liked, most-favorited
  const featured = searchParams.get('featured');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  let profiles = [...communityProfiles];

  // Filter featured if requested
  if (featured === 'true') {
    profiles = profiles.filter((p) => p.isFeatured);
  }

  // Sort profiles
  switch (sort) {
    case 'popular':
      profiles.sort((a, b) => b.views - a.views);
      break;
    case 'most-liked':
      profiles.sort((a, b) => b.likes - a.likes);
      break;
    case 'most-favorited':
      profiles.sort((a, b) => b.favorites - a.favorites);
      break;
    case 'recent':
    default:
      profiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  // Apply pagination
  const paginatedProfiles = profiles.slice(offset, offset + limit);

  return NextResponse.json({
    profiles: paginatedProfiles,
    total: profiles.length,
    offset,
    limit,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, username, avatarUrl, blocks, submittedBy } = body;

    // Validate required fields
    if (!name || !username || !blocks) {
      return NextResponse.json(
        { error: 'Missing required fields: name, username, and blocks are required' },
        { status: 400 },
      );
    }

    // Create new community profile
    const newProfile: CommunityProfile = {
      id: `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      username,
      avatarUrl: avatarUrl || `https://github.com/${username}.png`,
      blocks,
      likes: 0,
      favorites: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedBy,
    };

    communityProfiles.unshift(newProfile);

    return NextResponse.json(newProfile, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
