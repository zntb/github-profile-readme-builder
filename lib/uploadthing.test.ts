import { extractUploadThingFileKey, isUploadThingUrl } from './uploadthing';

describe('uploadthing helpers', () => {
  describe('isUploadThingUrl', () => {
    it('accepts trusted UploadThing hosts', () => {
      expect(isUploadThingUrl('https://utfs.io/f/file-key')).toBe(true);
      expect(isUploadThingUrl('https://subdomain.uploadthing.com/f/file-key')).toBe(true);
    });

    it('rejects non-http protocols and malformed URLs', () => {
      expect(isUploadThingUrl('javascript:alert(1)')).toBe(false);
      expect(isUploadThingUrl('not-a-url')).toBe(false);
    });

    it('rejects attacker-controlled lookalike hosts', () => {
      expect(isUploadThingUrl('https://utfs.io.evil.com/f/file-key')).toBe(false);
      expect(isUploadThingUrl('https://evil-utfs.io/f/file-key')).toBe(false);
      expect(isUploadThingUrl('https://evil.com/?next=utfs.io/f/file-key')).toBe(false);
    });
  });

  describe('extractUploadThingFileKey', () => {
    it('extracts the final path segment as file key', () => {
      expect(extractUploadThingFileKey('https://utfs.io/f/my-file-key')).toBe('my-file-key');
      expect(extractUploadThingFileKey('https://utfs.io/f/my-file-key?foo=bar#frag')).toBe(
        'my-file-key',
      );
    });

    it('returns null for non-UploadThing URLs', () => {
      expect(extractUploadThingFileKey('https://example.com/f/my-file-key')).toBeNull();
    });
  });
});
