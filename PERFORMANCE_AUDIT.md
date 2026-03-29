# Performance Audit Report: GitHub Profile README Builder

## 1. 🔥 Critical Performance Bottlenecks (Highest Impact First)

### CRITICAL #1: Client-Side Overuse - Entire App Marked as Client Components✅

**Impact:** Maximum - Forces full React hydration on every interaction

The entire Builder application is wrapped in `'use client'` at [`components/builder/index.tsx:1`](components/builder/index.tsx:1), causing:

- Full React hydration on page load (no server-side rendering benefit)
- All child components become client components by transitiveness
- Massive JavaScript payload delivered to browser

**Current Architecture:**

```
app/page.tsx (Server) → <Builder /> (CLIENT) → All children (CLIENT)
```

**Recommendation:** Convert to hybrid architecture:

- `Builder` container should be Client (interactive builder needs state)
- However, individual block preview components can be Server Components when possible for static rendering

---

### CRITICAL #2: Zustand Store Causes Global Re-renders✅

**Impact:** High - Any store change triggers ALL subscribed components

In [`lib/store.ts:33-194`](lib/store.ts:33), the Zustand store uses `persist` middleware but lacks selective subscriptions:

```typescript
// PROBLEM: Every component subscribing gets ALL state updates
const { selectedBlockId, username, setUsername } = useBuilderStore();
```

**Evidence in [`components/builder/index.tsx:20`](components/builder/index.tsx:20):**

```typescript
const { selectedBlockId, username, setUsername } = useBuilderStore();
```

When any block updates, ALL components re-render because Zustand doesn't support selective state slices efficiently without proper selector memoization.

**Recommendation:** Use selector pattern:

```typescript
const selectedBlockId = useBuilderStore((s) => s.selectedBlockId);
const username = useBuilderStore((s) => s.username);
```

---

### CRITICAL #3: Large Bundle from Heavy Dependencies✅

**Impact:** High - Bloats initial JavaScript payload

From [`package.json:33-55`](package.json:33-55):

| Package                               | Size Impact | Tree-Shakeable    |
| ------------------------------------- | ----------- | ----------------- |
| `@dnd-kit/core` + `@dnd-kit/sortable` | ~40KB+      | Partial           |
| `recharts`                            | ~300KB+     | No                |
| `radix-ui` (full install)             | ~150KB+     | Partial           |
| `lucide-react`                        | ~100KB+     | Yes (tree-shakes) |
| `next-themes`                         | ~10KB       | Yes               |
| `zustand`                             | ~3KB        | Yes               |

**CRITICAL:** `recharts` is tree-shake-resistant and adds massive bundle bloat - used nowhere in client rendering (all SVG generation happens on server/API routes). Remove from bundle.

---

## 2. 📉 Rendering Analysis (React Behavior, Re-renders, Hydration)

### Issue #2.1: Unnecessary Re-renders in LivePreview✅

**Location:** [`components/builder/live-preview.tsx:120-621`](components/builder/live-preview.tsx:120)

The `PreviewBlock` component uses `useMemo` but recalculates entire switch statement on every render:

```typescript
const renderBlock = useMemo(() => {
  // HUGE switch statement with 20+ cases
  switch (type) {
    case 'container': // ...
    case 'stats-row': // ...
    // ... 20+ more cases
  }
}, [type, props, children, globalUsername]); // Dependencies not optimized
```

**Problem:** Dependencies include entire `props` object - triggers on ANY prop change.

---

### Issue #2.2: Block Sidebar Filtering Not Memoized✅

**Location:** [`components/builder/block-sidebar.tsx:178-185`](components/builder/block-sidebar.tsx:178)

```typescript
const filteredCategories = BLOCK_CATEGORIES.map((category) => ({
  ...category,
  blocks: category.blocks.filter(
    (block) =>
      block.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.type.toLowerCase().includes(searchQuery.toLowerCase()),
  ),
})).filter((category) => category.blocks.length > 0);
```

**Runs on EVERY render** - no useMemo wrapper.

---

### Issue #2.3: findBlock Called on Every Render

**Location:** [`components/builder/config-panel.tsx:40`](components/builder/config-panel.tsx:40)

```typescript
const selectedBlock = findBlock(blocks, selectedBlockId);
```

O(n) recursion on every config panel render - no memoization.

---

## 3. 🌐 Data Fetching & Caching Strategy Review

### Issue #3.1: API Routes Cache-Control Too Aggressive

**Location:** [`app/api/stats/route.ts:412`](app/api/stats/route.ts:412)

```typescript
'Cache-Control': 'public, max-age=3600', // 1 hour - OK
```

Other routes:

- [`app/api/activity/route.ts:164`](app/api/activity/route.ts:164): `'max-age=3600'` ✓
- [`app/api/top-langs/route.ts:450`](app/api/top-langs/route.ts:450): `'max-age=3600'` ✓

**Analysis:** Caching is actually GOOD but can be optimized:

- For authenticated users: Use Vary: Cookie for personalization
- For rate-limited GitHub API: Cache aggressively (already done)

---

### Issue #3.2: No Parallel Fetching in LivePreview✅

**Location:** [`components/builder/live-preview.tsx:43-80`](components/builder/live-preview.tsx:43)

Blocks render sequentially:

```typescript
for (let i = 0; i < blocks.length; i += 1) {
  const block = blocks[i];
  // Each block rendered sequentially - no prefetch
}
```

**Impact:** For each stats card block, makes sequential API call to `/api/stats`, `/api/top-langs`, etc.

---

### Issue #3.3: GitHub API Calls Not Cached on Server✅

**Location:** [`lib/github.ts:126-195`](lib/github.ts:126)

`fetchUserStats` makes GraphQL call every time - no server-side caching:

```typescript
export async function fetchUserStats(username: string, token: string): Promise<GitHubStats> {
  // GraphQL query runs EVERY request - no caching
  const data = (await fetchGitHubGraphQL(query, { username }, token)) as GraphQLResponse;
```

**Recommendation:** Implement server-side cache with TTL using memory-cache or similar.

---

## 4. 📦 Bundle Size & Dependency Analysis

### Heavy Dependencies NOT Tree-Shaken:

| Dependency               | Bundle Impact | Used                           | Recommendation          |
| ------------------------ | ------------- | ------------------------------ | ----------------------- |
| `recharts`               | ~300KB        | NO (SVG generated server-side) | REMOVE                  |
| `@radix-ui/react`        | ~100KB        | YES (UI components)            | Keep, lazy-load dialogs |
| `@dnd-kit`               | ~40KB         | YES (drag-drop)                | Keep, code-split        |
| `lucide-react`           | ~20-100KB     | YES (icons)                    | Use barrel import only  |
| `react-resizable-panels` | ~15KB         | YES (panels)                   | Keep                    |

---

### Issue #4.1: No Dynamic Imports for Heavy UI

**Location:** All component imports use static `import`:

```typescript
// Before (current)
import { DndContext, closestCenter } from '@dnd-kit/core';

// After (optimal)
const DndContext = dynamic(() => import('@dnd-kit/core'), { ssr: false });
```

---

### Issue #4.2: Full Radix UI Installation

**Location:** [`package.json:43`](package.json:43)

`"radix-ui": "^1.4.3"` - installs ALL primitives, not just needed ones.

Should be individual imports:

```json
{
  "@radix-ui/react-dialog": "...",
  "@radix-ui/react-select": "..."
  // Only what's used
}
```

---

## 5. ⚙️ Next.js-Specific Optimization Opportunities

### Issue #5.1: Empty Next.js Config✅

**Location:** [`next.config.ts:1-7`](next.config.ts:1-7)

```typescript
const nextConfig: NextConfig = {
  /* config options here - EMPTY */
};
```

**Missing optimizations:**

```typescript
const nextConfig: NextConfig = {
  // Enable SWC minification
  swcMinify: true,

  // Image optimization
  images: {
    remotePatterns: [
      { hostname: 'avatars.githubusercontent.com' },
      { hostname: 'raw.githubusercontent.com' },
    ],
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};
```

---

### Issue #5.2: No Static Generation for API Error States✅

**Location:** [`app/api/stats/route.ts:369-400`](app/api/stats/route.ts:369)

Error SVGs generated dynamically every request:

```typescript
return new NextResponse(
  `<svg width="${errW}" ...`, // Generated every time
  { headers: { 'Cache-Control': 'public, max-age=300' } },
);
```

**Recommendation:** Use Static Server generation for error state SVGs:

```typescript
// Pre-generate error SVG constants
const ERROR_SVG = `...`;
const NO_TOKEN_SVG = `...`;
```

---

### Issue #5.3: Fonts Loaded with display:swap

**Location:** [`app/layout.tsx:7-17`](app/layout.tsx:7-17)

```typescript
const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap', // Causes layout shift (CLS)
});
```

**Impact:** `display: swap` causes FOIT (Flash of Invisible Text) - hurts LCP.

**Recommendation:** Use `display: 'optional'` for critical fonts or preload fonts:

```typescript
const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'optional', // Better for LCP
  preload: true,
});
```

---

## 6. 🧪 Core Web Vitals Impact Assessment

### LCP (Largest Contentful Paint) - POTENTIALLY POOR

- Builder app loads via Client Component → delayed LCP
- Font loading with `display: swap` → delays text render
- No hero image optimization

**Current scores:** ~2.5-3.5s estimated (needs real measurement)

### CLS (Cumulative Layout Shift) - GOOD

- No adinjecteds dynamically sized content
- Font loading configured (swap causes minor shifts)

### INP (Interaction to Next Paint) - POTENTIALLY POOR

- Zustand store updates trigger full re-renders
- No interaction debouncing
- DnD operations block main thread

---

## 7. 🚀 Refactored Code (Optimized, Clean, Production-Ready)

### Optimization #1: Selective Zustand Selectors

In [`lib/store.ts`](lib/store.ts), ensure selectors are used properly:

```typescript
// BEFORE (current)
const store = useBuilderStore();

// AFTER (optimized)
const blocks = useBuilderStore((s) => s.blocks);
const selectedBlockId = useBuilderStore((s) => s.selectedBlockId);
```

---

### Optimization #2: Memoize Block Filter

In [`components/builder/block-sidebar.tsx`](components/builder/block-sidebar.tsx):

```typescript
import { useMemo, useState } from 'react';

export function BlockSidebar() {
  const [searchQuery, setSearchQuery] = useState('');

  // Memoize filtered blocks
  const filteredCategories = useMemo(
    () =>
      BLOCK_CATEGORIES.map((category) => ({
        ...category,
        blocks: category.blocks.filter(
          (block) =>
            block.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            block.type.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      })).filter((category) => category.blocks.length > 0),
    [searchQuery],
  );
}
```

---

### Optimization #3: Memoize Config Panel Block Lookup

In [`components/builder/config-panel.tsx`](components/builder/config-panel.tsx):

```typescript
import { useMemo } from 'react';

// Memoize block lookup
const selectedBlock = useMemo(
  () => (blocks ? findBlock(blocks, selectedBlockId) : null),
  [blocks, selectedBlockId],
);
```

---

### Optimization #4: Next.js Config Enhancement

In [`next.config.ts`](next.config.ts):

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable SWC for faster builds
  swcMinify: true,

  // Optimize images
  images: {
    remotePatterns: [
      { hostname: 'avatars.githubusercontent.com' },
      { hostname: 'raw.githubusercontent.com' },
      { hostname: 'github.com' },
      { hostname: 'capsule-render.vercel.app' },
      { hostname: 'skillicons.dev' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Compression
  compress: true,

  // Headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

### Optimization #5: Remove Unused Dependencies

In [`package.json`](package.json), remove:

```json
"recharts": "^3.8.0", // REMOVE - not used in client bundle
```

---

### Optimization #6: Dynamic Import for DnD Kit

In [`components/builder/canvas.tsx`](components/builder/canvas.tsx):

```typescript
import { dynamic } from 'next/dnd';

// Only import on client - reduces initial bundle
const DndContext = dynamic(
  () => import('@dnd-kit/core').then((mod) => mod.DndContext),
  { ssr: false },
);
```

Actually - need full module. Better approach: Add to config:

```typescript
// next.config.ts
experimental: {
  optimizePackageImports: ['@dnd-kit/core', '@dnd-kit/sortable'],
},
```

---

### Optimization #7: Font Optimization

In [`app/layout.tsx`](app/layout.tsx):

```typescript
const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'optional', // Better than 'swap' for LCP
  preload: true, // Preload critical font
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'optional',
  preload: false, // Not critical
});
```

---

### Optimization #8: Live Preview Memoization

In [`components/builder/live-preview.tsx`](components/builder/live-preview.tsx):

Add proper memoization to PreviewBlock. However, complex - better to convert to server component with streaming.

**Advanced:** Convert PreviewBlock to use React Server Components with `Suspense`:

```typescript
import { Suspense } from 'react';

function PreviewBlock({ block }: { block: Block }) {
  return (
    <Suspense fallback={<Skeleton className="h-20 w-full" />}>
      {/* Server-rendered preview */}
      <PreviewServer block={block} />
    </Suspense>
  );
}
```

---

## 8. 📊 Estimated Performance Gains

| Optimization      | Impact Area | Estimated Gain   |
| ----------------- | ----------- | ---------------- |
| Remove `recharts` | Bundle Size | -300KB gzipped   |
| Memoize filters   | Re-renders  | -40% render time |
| Dynamic imports   | TTI         | -200ms           |
| Font optimization | LCP         | -300ms           |
| Zustand selectors | Re-renders  | -50% re-renders  |
| API caching       | TTFB        | +Cache hits      |
| Next.js config    | Overall     | +10-20%          |

**Total Estimated:**

- Bundle: ~350KB smaller
- LCP: 300-500ms improvement
- TTI: 200-400ms improvement
- Re-render time: 40-60% reduction

---

## 9. 📌 Additional Optimization Opportunities (Advanced)

### Priority: Implement Server Actions for Block Updates

Instead of client-side state, use server actions for persistent storage:

```typescript
// lib/actions.ts
'use server';

export async function saveBlock(block: Block) {
  // Server-side storage
  await db.block.create({ data: block });
}
```

### Priority: React Server Components for Preview

Convert live-preview to RSC with streaming:

```typescript
// app/api/preview/route.ts
// Generate preview on server
```

### Priority: Edge Runtime for API Routes

For faster TTFB:

```typescript
// app/api/stats/route.ts
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
```

### Priority: Instrumentation for Real Metrics

Add Web Vitals instrumentation:

```typescript
// app/layout.tsx
import { WebVitals } from 'next/web-vitals';

export function WebVitalsMetrics({
  name,
  value,
  id,
}: {
  name: string;
  value: number;
  id: string;
}) {
  // Send to analytics
  console.log(name, value, id);
  return null;
}
```

---

## Summary

### Top 3 Actions to Implement Immediately:

1. **Remove `recharts`** from package.json (~300KB savings)
2. **Add useMemo** to block sidebar filtering
3. **Enhance next.config.ts** with image and caching optimizations

### Long-term Improvements:

- Convert to hybrid Server/Client component architecture
- Implement server-side caching for GitHub API
- Add Web Vitals instrumentation for real metrics

---

_Audit completed: 2026-03-29_
_Framework: Next.js 16.2.1 with React 19.2.4_
_Build target: Vercel (Edge Runtime compatible)_
