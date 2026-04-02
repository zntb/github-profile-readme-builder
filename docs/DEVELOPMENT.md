# Development Guide

This guide provides comprehensive information for developers who want to contribute to the GitHub Profile Maker project.

## Table of Contents

- [Project Setup](#project-setup)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Adding New Blocks](#adding-new-blocks)
- [State Management](#state-management)
- [Testing](#testing)
- [Code Style](#code-style)
- [Building for Production](#building-for-production)
  - [Bundle Optimization](#bundle-optimization)
  - [Lazy-Loaded Components](#lazy-loaded-components)
  - [Configuration](#configuration)
  - [Adding New Lazy Components](#adding-new-lazy-components)
  - [Viewing Bundle Analysis](#viewing-bundle-analysis)

---

## Project Setup

### Prerequisites

- **Node.js** ≥ 18
- **npm**, **pnpm**, **yarn**, or **bun**

### Installation

```bash
# Clone the repository
git clone https://github.com/zntb/github-profile-maker.git
cd github-profile-maker

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Optional - enables real GitHub stats
# Create at: https://github.com/settings/tokens
# Required scopes: read:user
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

### Running Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development Workflow

### 1. Creating a Feature Branch

```bash
# Create a new feature branch
git checkout -b feat/my-new-feature

# Or for bug fixes
git checkout -b fix/issue-description
```

### 2. Making Changes

1. Make your changes in the appropriate files
2. Run the development server to test:
   ```bash
   npm run dev
   ```

### 3. Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 4. Linting and Formatting

```bash
# Format all files
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### 5. Committing Changes

We use Commitlint to enforce conventional commits:

```bash
# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feat/my-new-feature
```

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary changes

---

## Project Structure

```
github-profile-maker/
├── app/
│   ├── api/                    # API routes
│   │   ├── activity/           # Activity graph API
│   │   ├── quotes/             # Quotes API
│   │   ├── stats/              # Stats card API
│   │   ├── streak/             # Streak stats API
│   │   ├── top-langs/          # Top languages API
│   │   ├── trophies/           # Trophies API
│   │   └── uploadthing/        # File upload API
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
│
├── components/
│   ├── builder/                 # Builder components
│   │   ├── index.tsx           # Main builder component
│   │   ├── canvas.tsx          # Drag & drop canvas
│   │   ├── block-sidebar.tsx   # Block library sidebar
│   │   ├── config-panel.tsx    # Block configuration panel
│   │   ├── live-preview.tsx    # Live preview panel
│   │   ├── header.tsx          # Builder header
│   │   ├── canvas-block.tsx    # Individual canvas block
│   │   ├── block-preview.tsx   # Block preview renderer
│   │   ├── config/             # Block config components
│   │   │   └── blocks/         # Per-block configs
│   │   └── templates-dialog.tsx # Templates dialog
│   │
│   └── ui/                     # shadcn/ui components
│
├── lib/                        # Core libraries
│   ├── github.ts               # GitHub API helpers
│   ├── markdown.ts             # Markdown renderer
│   ├── store.ts                # Zustand state store
│   ├── templates.ts            # Pre-built templates
│   ├── themes.ts              # Theme definitions
│   ├── types.ts               # TypeScript types
│   └── utils.ts               # Utility functions
│
├── public/                     # Static assets
├── docs/                       # Documentation
└── test/                       # Test setup
```

---

## Adding New Blocks

Adding a new block requires changes in multiple files. Follow this step-by-step guide.

### Step 1: Define Block Type

Add the new block type to [`lib/types.ts`](../../lib/types.ts):

```typescript
export type BlockType =
  // ... existing types
  'my-new-block';

export interface MyNewBlockProps {
  // Define your props here
  prop1: string;
  prop2: number;
}
```

### Step 2: Add to Block Categories

Add the block to [`BLOCK_CATEGORIES`](../../lib/types.ts):

```typescript
{
  name: 'Category Name',
  description: 'Category description',
  blocks: [
    // ... existing blocks
    {
      type: 'my-new-block',
      label: 'My New Block',
      icon: 'IconName',
      defaultProps: {
        prop1: 'default value',
        prop2: 42
      }
    }
  ]
}
```

### Step 3: Add Preview Renderer

Update [`components/builder/block-preview.tsx`](../../components/builder/block-preview.tsx):

```tsx
// Add a case for your block
case 'my-new-block': {
  const props = block.props as MyNewBlockProps;
  return (
    <div className="p-4">
      {/* Preview content */}
    </div>
  );
}
```

### Step 4: Add Configuration Panel

Update [`components/builder/config-panel.tsx`](../../components/builder/config-panel.tsx):

```tsx
// Add a case for your block
case 'my-new-block': {
  const props = block.props as MyNewBlockProps;
  return (
    <div className="space-y-4">
      {/* Configuration fields */}
    </div>
  );
}
```

### Step 5: Add Live Preview

Update [`components/builder/live-preview.tsx`](../../components/builder/live-preview.tsx):

```tsx
// Add a case for your block
case 'my-new-block': {
  const props = block.props as MyNewBlockProps;
  return (
    <div>
      {/* Live preview content */}
    </div>
  );
}
```

### Step 6: Add Markdown Renderer

Update [`lib/markdown.ts`](../../lib/markdown.ts):

```typescript
// Add a case for your block
case 'my-new-block': {
  const props = block.props as MyNewBlockProps;
  // Generate markdown
  return `<!-- markdown output -->`;
}
```

---

## State Management

The project uses Zustand for state management. The main store is defined in [`lib/store.ts`](../../lib/store.ts).

### Store Structure

```typescript
interface BuilderStore {
  // Blocks
  blocks: Block[];
  selectedBlockId: string | null;

  // Actions
  addBlock: (type: BlockType, props?: Record<string, unknown>) => void;
  updateBlock: (id: string, props: Record<string, unknown>) => void;
  removeBlock: (id: string) => void;
  moveBlock: (activeId: string, overId: string) => void;
  duplicateBlock: (id: string) => void;

  // Selection
  selectBlock: (id: string | null) => void;

  // History
  undo: () => void;
  redo: () => void;

  // Profiles
  profiles: Profile[];
  currentProfileId: string | null;
  saveProfile: (name: string) => void;
  loadProfile: (id: string) => void;
}
```

### Using the Store

```tsx
import { useBuilderStore } from '@/lib/store';

// In a component
const blocks = useBuilderStore((state) => state.blocks);
const addBlock = useBuilderStore((state) => state.addBlock);

addBlock('heading', { text: 'Hello' });
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

Tests are located in the same directory as the files they test:

```
lib/
├── store.test.ts
├── github.test.ts
└── markdown.test.ts

components/
└── builder/
    ├── builder.test.tsx
    └── ...
```

### Test Example

```typescript
import { render, screen } from '@testing-library/react';
import { Builder } from './builder';

describe('Builder', () => {
  it('renders the canvas', () => {
    render(<Builder />);
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });
});
```

---

## Code Style

### TypeScript

- Use TypeScript for all new code
- Avoid `any` type
- Define proper interfaces for props

### React

- Use functional components with hooks
- Use proper TypeScript types for props
- Follow React best practices

### CSS / Tailwind

- Use Tailwind CSS classes
- Use the `cn()` utility for conditional classes
- Follow the existing pattern for custom styles

### Import Order

```typescript
// 1. React/Next imports
import { useState } from 'react';
import Link from 'next/link';

// 2. Third-party imports
import { useDraggable } from '@dnd-kit/core';

// 3. Internal imports
import { useBuilderStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// 4. Component imports
import { Button } from '@/components/ui/button';
```

---

## Building for Production

### Build the Application

```bash
npm run build
```

### Bundle Optimization

The application uses Next.js dynamic imports to achieve code splitting and reduce the initial bundle size. This improves Time-to-Interactive (TTI) by deferring the loading of non-critical components.

#### Lazy-Loaded Components

The following components are lazy-loaded to reduce initial bundle size:

| Component                   | Chunk Name                  | Purpose                                             |
| --------------------------- | --------------------------- | --------------------------------------------------- |
| `Builder`                   | main                        | Main builder interface (loaded after initial paint) |
| `CommandPalette`            | command-palette             | Ctrl+K command palette                              |
| `KeyboardShortcutsProvider` | keyboard-shortcuts          | Keyboard shortcuts handler & dialog                 |
| `TemplatesDialog`           | templates-dialog            | Template browser dialog                             |
| `ShareButton`               | share-button                | Social sharing dialog                               |
| `SaveToGist`                | save-to-gist                | GitHub Gist save dialog                             |
| `ProfileSelector`           | profile-manager             | Profile management dropdown                         |
| `LivePreview`               | live-preview                | Rendered markdown preview                           |
| `ConfigPanel`               | config-panel                | Block configuration panel                           |
| `ProfileQuality`            | profile-quality             | Profile completeness score                          |
| `ImageOptimizationSettings` | image-optimization-settings | Image optimization settings                         |

#### Configuration

Bundle optimization settings are in `next.config.ts`:

```typescript
// Enable package optimization for tree-shaking
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-dialog',
    // ... other packages
  ],
},

// Remove console.log in production
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
},
```

#### Adding New Lazy Components

To add a new lazy-loaded component:

1. Add the dynamic import to `lib/lazy-components.tsx`:

```typescript
export const LazyNewComponent = dynamic(
  () => import('@/components/path/to/component').then((m) => ({ default: m.NewComponent })),
  {
    ssr: false,
    loading: () => <Skeleton />, // Optional loading fallback
  },
);
```

2. Replace the static import in the parent component with the lazy version:

```typescript
// Before
import { NewComponent } from '@/components/path/to/component';

// After
import { LazyNewComponent } from '@/lib/lazy-components';
```

#### Viewing Bundle Analysis

To analyze bundle sizes, use `@next/bundle-analyzer`:

```bash
npm install @next/bundle-analyzer
npx next build --analyze
```

### Start Production Server

```bash
npm start
```

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

---

## Common Issues

### GitHub Token Not Working

Ensure your token has the correct scopes:

- `read:user` - Required for reading user data

### Rate Limiting

Without a GitHub token, API requests are limited. Add a token to your `.env.local`:

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

### Type Errors

Run TypeScript check:

```bash
npx tsc --noEmit
```

### Build Failures

Clear the build cache:

```bash
rm -rf .next
npm run build
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [dnd-kit](https://docs.dndkit.com)
- [shadcn/ui](https://ui.shadcn.com)
