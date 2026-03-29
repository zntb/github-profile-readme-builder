export function isUploadThingUrl(value: string | undefined | null): value is string {
  if (!value) return false;

  try {
    const { hostname } = new URL(value);
    return hostname.includes('uploadthing') || hostname.includes('utfs.io');
  } catch {
    return value.includes('uploadthing') || value.includes('utfs.io');
  }
}

export function extractUploadThingFileKey(value: string | undefined | null): string | null {
  if (!value || !isUploadThingUrl(value)) return null;

  try {
    const { pathname } = new URL(value);
    const parts = pathname.split('/').filter(Boolean);
    return parts.at(-1) ?? null;
  } catch {
    const [withoutQuery] = value.split('?');
    const [withoutHash] = withoutQuery.split('#');
    const parts = withoutHash.split('/').filter(Boolean);
    return parts.at(-1) ?? null;
  }
}
