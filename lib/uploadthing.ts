export function isUploadThingUrl(value: string | undefined | null): value is string {
  if (!value) return false;

  try {
    const { protocol, hostname } = new URL(value);
    if (protocol !== 'https:' && protocol !== 'http:') return false;

    const normalizedHost = hostname.toLowerCase().replace(/\.$/, '');
    const allowedHosts = ['utfs.io', 'ufs.sh', 'uploadthing.com'];

    return (
      allowedHosts.includes(normalizedHost) ||
      allowedHosts.some((allowedHost) => normalizedHost.endsWith(`.${allowedHost}`))
    );
  } catch {
    return false;
  }
}

export function extractUploadThingFileKey(value: string | undefined | null): string | null {
  if (!value || !isUploadThingUrl(value)) return null;

  try {
    const { pathname } = new URL(value);
    const parts = pathname.split('/').filter(Boolean);
    const fileSegmentIndex = parts.lastIndexOf('f');
    if (fileSegmentIndex !== -1 && fileSegmentIndex + 1 < parts.length) {
      return parts[fileSegmentIndex + 1] ?? null;
    }
    return parts.at(-1) ?? null;
  } catch {
    const [withoutQuery] = value.split('?');
    const [withoutHash] = withoutQuery.split('#');
    const parts = withoutHash.split('/').filter(Boolean);
    return parts.at(-1) ?? null;
  }
}
