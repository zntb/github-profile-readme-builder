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

    const utapi = new UTApi();
    console.log('Deleting file from UploadThing:', JSON.stringify(fileKey));
    await utapi.deleteFiles(fileKey);
    console.log('File deleted successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
