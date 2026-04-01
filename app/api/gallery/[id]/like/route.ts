import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for user interactions (in production, use a database)
const userInteractions: Map<string, { liked: boolean; favorited: boolean }> = new Map();

function getInteractionKey(profileId: string, userId: string): string {
  return `${profileId}:${userId}`;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: profileId } = await params;
    const body = await request.json();
    const { type, userId } = body;

    // Validate required fields
    if (!type || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: type and userId are required' },
        { status: 400 },
      );
    }

    if (type !== 'like' && type !== 'favorite') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "like" or "favorite"' },
        { status: 400 },
      );
    }

    const interactionKey = getInteractionKey(profileId, userId);
    const currentInteraction = userInteractions.get(interactionKey) || {
      liked: false,
      favorited: false,
    };

    if (type === 'like') {
      // Toggle like
      if (currentInteraction.liked) {
        // Unlike
        currentInteraction.liked = false;
        // Decrement likes count (in production, update database)
      } else {
        // Like
        currentInteraction.liked = true;
        // Increment likes count (in production, update database)
      }
    } else if (type === 'favorite') {
      // Toggle favorite
      if (currentInteraction.favorited) {
        // Unfavorite
        currentInteraction.favorited = false;
        // Decrement favorites count (in production, update database)
      } else {
        // Favorite
        currentInteraction.favorited = true;
        // Increment favorites count (in production, update database)
      }
    }

    userInteractions.set(interactionKey, currentInteraction);

    return NextResponse.json({
      liked: currentInteraction.liked,
      favorited: currentInteraction.favorited,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: profileId } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
  }

  const interactionKey = getInteractionKey(profileId, userId);
  const interaction = userInteractions.get(interactionKey) || { liked: false, favorited: false };

  return NextResponse.json(interaction);
}
