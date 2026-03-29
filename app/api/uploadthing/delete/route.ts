import { NextRequest, NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileKey } = body;

    if (!fileKey) {
      return NextResponse.json({ error: 'File key is required' }, { status: 400 });
    }

    console.log('Delete API received fileKey:', JSON.stringify(fileKey));

    const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });
    console.log('Deleting file from UploadThing:', JSON.stringify(fileKey));
    const result = await utapi.deleteFiles(fileKey);
    console.log('Delete API result:', result);

    if (!result.success || result.deletedCount < 1) {
      return NextResponse.json(
        { error: 'UploadThing did not delete the requested file', result },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
