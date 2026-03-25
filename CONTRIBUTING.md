# Contributing to GitHub Profile README Builder

Thank you for your interest in contributing! This guide will help you get started with development, understand our code standards, and effectively contribute to the project.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Adding New Blocks](#adding-new-blocks)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Security](#security)
- [Issue Reporting](#issue-reporting)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Recognition](#recognition)

---

## Quick Start

```bash
# Fork & clone the repository
git clone https://github.com/<your-username>/github-profile-readme-builder.git
cd github-profile-readme-builder

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Code of Conduct

This project follows a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the maintainers.

---

## Development Setup

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | ≥ 18 | LTS recommended |
| npm | Latest | Comes with Node.js |
| Git | Latest | For version control |

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Optional: Enables real GitHub stats, streak, trophies, and activity graphs
# Create a token at: https://github.com/settings/tokens
# Required scopes: read:user
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

> **Note:** Without a `GITHUB_TOKEN`, stat widgets will display a placeholder message instead of live data.

### Running the Project

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Development Workflow

We follow the **GitHub Flow** branching model, optimized for single developer and small team workflows.

### Branch Types

| Branch | Purpose | Protected | Base |
|--------|---------|-----------|------|
| `main` | Production-ready code | Yes | - |
| `dev` | Integration branch for features | Yes | main |
| `feature/*` | New features | No | dev |
| `bugfix/*` | Bug fixes | No | dev |
| `hotfix/*` | Emergency production fixes | No | main |

### Branch Protection Rules

- **`main`**: No direct pushes, requires Pull Request with review
- **`dev`**: No direct pushes, requires Pull Request
- **`feature/*`**, **`bugfix/*`**, **`hotfix/*`**: Can push directly, create PR before merge

### Creating a Feature Branch

Always create a new branch from `dev` for your changes:

```bash
# Ensure dev is up to date
git checkout dev
git pull origin dev

# Create a new feature branch (include issue number if available)
git checkout -b feature/123-new-feature-name

# Or for bug fixes
git checkout -b bugfix/456-fix-description

# For urgent hotfixes (create from main)
git checkout main
git pull origin main
git checkout -b hotfix/789-urgent-fix
```

### Branch Naming Convention

- `feature/<issue-number>-<short-description>`
- `bugfix/<issue-number>-<short-description>`
- `hotfix/<issue-number>-<short-description>`

**Examples:**

```bash
git checkout -b feature/42-add-trophy-block
git checkout -b bugfix/15-fix-mobile-layout
git checkout -b hotfix/99-security-patch
```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear changelogs:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

| Type | Description |
|------|-------------|
| `feat` | New feature or block |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, no logic) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `ci` | CI/CD changes |
| `build` | Build system changes |

**Examples:**

```bash
git commit -m "feat(blocks): add custom badge block"
git commit -m "fix(canvas): resolve drag drop on mobile"
git commit -m "docs: update contributing guidelines"
```

### Submit a Pull Request

1. Push your branch: `git push origin feature/123-new-feature`
2. Open a Pull Request against `dev` (for feature/bugfix) or `main` (for hotfix)
3. Fill out the PR template completely
4. Wait for review and address feedback
5. After approval, squash and merge to target branch

---

## Adding New Blocks

Adding a new block requires updates in **six files**. Follow this step-by-step guide:

### Step 1: Define Block Type

In [`lib/types.ts`](lib/types.ts), add your block to the `BlockType` union:

```typescript
export type BlockType = 
  | 'container' 
  | 'divider'
  // ... existing types
  | 'your-new-block';  // Add here
```

### Step 2: Define Default Props

In the same file, add default props in `BLOCK_CATEGORIES`:

```typescript
export const BLOCK_CATEGORIES: BlockCategory[] = [
  // ... existing categories
  {
    id: 'content',
    label: 'Content',
    blocks: [
      // ... existing blocks
      {
        type: 'your-new-block',
        label: 'Your New Block',
        icon: YourIcon,
        defaultProps: {
          text: 'Default text',
          alignment: 'left',
          // ... other default props
        },
        // Add fields configuration (see Step 4)
      },
    ],
  },
];
```

### Step 3: Add Block Preview

In [`components/builder/block-preview.tsx`](components/builder/block-preview.tsx), add a case for your block:

```typescript
case 'your-new-block':
  return (
    <div className="p-4 border rounded-md">
      <p className="text-sm text-muted-foreground">
        {block.props.text || 'Your block preview'}
      </p>
    </div>
  );
```

### Step 4: Add Config Panel Fields

In [`components/builder/config-panel.tsx`](components/builder/config-panel.tsx), add configuration fields:

```typescript
case 'your-new-block':
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Text</Label>
        <Input
          value={block.props.text}
          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
          placeholder="Enter text..."
        />
      </div>
      <div className="space-y-2">
        <Label>Alignment</Label>
        <Select
          value={block.props.alignment}
          onValueChange={(value) => updateBlock(block.id, { alignment: value })}
        >
          <SelectItem value="left">Left</SelectItem>
          <SelectItem value="center">Center</SelectItem>
          <SelectItem value="right">Right</SelectItem>
        </Select>
      </div>
    </div>
  );
```

### Step 5: Add Live Preview

In [`components/builder/live-preview.tsx`](components/builder/live-preview.tsx), add the GitHub-style preview:

```typescript
case 'your-new-block':
  return (
    <div style={{ textAlign: block.props.alignment }}>
      {block.props.text}
    </div>
  );
```

### Step 6: Add Markdown Renderer

In [`lib/markdown.ts`](lib/markdown.ts), convert block props to Markdown:

```typescript
case 'your-new-block':
  const alignment = block.props.alignment || 'left';
  const text = block.props.text || '';
  return `<div align="${alignment}">${text}</div>`;
```

---

## Code Style Guidelines

### TypeScript

- **Never use `any`** — always define proper types
- Use interfaces for objects, types for unions
- Enable strict mode in tsconfig

```typescript
// ✅ Good
interface BlockProps {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
}

// ❌ Bad
const props: any = { ... };
```

### React Patterns

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks

```typescript
// ✅ Good - Custom hook for complex logic
function useBlockManager() {
  const blocks = useStore((s) => s.blocks);
  const addBlock = useStore((s) => s.addBlock);
  
  return { blocks, addBlock };
}
```

### Styling

- Use Tailwind CSS utility classes
- Use the `cn()` helper for conditional classes
- Leverage CSS variables for theming

```typescript
// ✅ Good
import { cn } from '@/lib/utils';

<div className={cn(
  "base-styles",
  isActive && "active-styles",
  variant === 'primary' && "primary-variant"
)} />
```

### Component Structure

Follow this order in component files:

1. Imports (external, then internal)
2. Type definitions
3. Component function
4. Return JSX
5. Export

---

## Testing

### Running Tests

```bash
npm run test        # Run all tests
npm run test:watch # Watch mode
npm run test:coverage # Coverage report
```

### Writing Tests

We use Jest and React Testing Library. Place tests alongside components:

```
components/
├── builder/
│   ├── canvas.tsx
│   └── canvas.test.tsx  # Test file
```

Example test:

```typescript
import { render, screen } from '@testing-library/react';
import { Canvas } from './canvas';

describe('Canvas', () => {
  it('renders empty state when no blocks', () => {
    render(<Canvas blocks={[]} />);
    expect(screen.getByText('No blocks yet')).toBeInTheDocument();
  });

  it('renders blocks when provided', () => {
    const blocks = [{ id: '1', type: 'heading', props: { text: 'Hello' } }];
    render(<Canvas blocks={blocks} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Test Coverage Goals

- **Core logic** (store, markdown): 80%+ coverage
- **UI components**: Focus on critical user paths
- **Integration**: Key user workflows

---

## Security

### Reporting Security Issues

Please review our [Security Policy](SECURITY.md) for reporting vulnerabilities.

### Secure Coding Practices

- **Never commit secrets** — use environment variables
- **Validate all inputs** — especially user-provided content
- **Sanitize output** — prevent XSS in Markdown rendering
- **Use HTTPS** — for all external resource loading

### Environment Variables

```env
# ❌ Never commit these
GITHUB_TOKEN=ghp_xxx
DATABASE_URL=postgres://...

# ✅ Safe to commit (non-sensitive)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Issue Reporting

### Before Creating an Issue

1. **Search existing issues** — avoid duplicates
2. **Check recent commits** — may already be fixed
3. **Reproduce the bug** — document steps clearly

### Issue Template

```markdown
## Bug Description
A clear description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen instead.

## Screenshots
If applicable, add screenshots to help explain.

## Environment
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., v20.10.0]

## Additional Context
Any other context about the problem.
```

---

## Pull Request Guidelines

### PR Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 📝 Documentation
- [ ] ♻️ Refactoring
- [ ] 🔧 Configuration

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed

## Screenshots
If applicable.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated (if needed)
- [ ] No lint errors
```

### Review Process

1. **Automated checks** must pass (lint, build, tests)
2. **At least one maintainer** must approve
3. **Address feedback** promptly
4. **Squash commits** before merging

---

## Recognition

Contributors are recognized in:

- [README.md](README.md) — contributors section
- Release notes
- GitHub's contributor graph

Thank you for contributing! 🎉