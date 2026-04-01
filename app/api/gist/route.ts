import { NextResponse } from 'next/server';

interface GistRequest {
  content: string;
  description?: string;
  isPublic: boolean;
  token: string;
}

export async function POST(request: Request) {
  try {
    const body: GistRequest = await request.json();
    const { content, description = 'Created with GitHub Profile Maker', isPublic, token } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ error: 'GitHub token is required' }, { status: 400 });
    }

    // Create the Gist via GitHub API
    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        public: isPublic,
        files: {
          'README.md': {
            content,
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Failed to create Gist' },
        { status: response.status },
      );
    }

    const gist = await response.json();

    return NextResponse.json({
      success: true,
      gistUrl: gist.html_url,
      gistId: gist.id,
      description: gist.description,
      isPublic: gist.public,
      createdAt: gist.created_at,
    });
  } catch (error) {
    console.error('Gist API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
