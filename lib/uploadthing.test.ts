import { extractUploadThingFileKey, isUploadThingUrl } from './uploadthing';

describe('uploadthing utilities', () => {
  it('recognizes supported UploadThing domains', () => {
    expect(isUploadThingUrl('https://utfs.io/f/file-key')).toBe(true);
    expect(isUploadThingUrl('https://my-app.ufs.sh/f/file-key')).toBe(true);
    expect(isUploadThingUrl('https://uploadthing.com/f/file-key')).toBe(true);
    expect(isUploadThingUrl('https://example.com/f/file-key')).toBe(false);
  });

  it('extracts a file key from /f/{key} URLs', () => {
    expect(extractUploadThingFileKey('https://utfs.io/f/abc123')).toBe('abc123');
    expect(extractUploadThingFileKey('https://my-app.ufs.sh/f/xyz789?foo=bar')).toBe('xyz789');
  });

  it('falls back to the last path segment when /f is absent', () => {
    expect(extractUploadThingFileKey('https://uploadthing.com/some/path/file-key')).toBe(
      'file-key',
    );
  });
});
