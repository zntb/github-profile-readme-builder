# Code Formatter Configuration Plan

## Context

### Project Technology Stack

- **Framework**: Next.js 16.2.1 (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS 4 (CSS-first configuration)
- **State Management**: Zustand 5.x
- **UI Components**: Shadcn UI, Radix UI
- **Linting**: ESLint 9 (flat config format)

### Languages Requiring Formatting

| Language       | File Types    | Primary Tool      |
| -------------- | ------------- | ----------------- |
| TypeScript/TSX | `.ts`, `.tsx` | ESLint + Prettier |
| CSS/Tailwind   | `.css`        | Prettier          |
| JSON           | `.json`       | Prettier          |
| Markdown       | `.md`         | Prettier          |

### Existing Configuration

- **ESLint**: Flat config (`eslint.config.mjs`) with `eslint-config-next` (core-web-vitals + typescript)
- **No Prettier**: Not yet configured
- **No Husky**: Not yet configured
- **No lint-staged**: Not yet configured
- **VS Code Settings**: Minimal (only Snyk extension config)

### Team Size & Workflow

- Small team (individual or small group project)
- Git-based workflow with potential for CI integration
- Need fast pre-commit hooks to avoid disrupting development flow

### Known Pain Points

- No unified code formatting across the codebase
- No automatic import sorting
- No pre-commit enforcement
- Potential ESLint/Prettier conflicts not resolved

---

## Configuration Plan

### CF-PLAN-1.1 [Tool Configuration]: Core Formatting Stack

- **Tool**: Prettier + ESLint + eslint-config-prettier
- **Scope**: All TypeScript, TSX, CSS, JSON, and Markdown files
- **Rationale**: Prettier handles code formatting (indentation, line width, quotes), ESLint handles code quality (unused variables, complexity). eslint-config-prettier disables conflicting ESLint rules that Prettier handles.

### CF-PLAN-1.2 [Tool Configuration]: Import Organization

- **Tool**: eslint-plugin-import
- **Scope**: All TypeScript/TSX files with imports
- **Rationale**: Enforces consistent import ordering with grouping (built-in → external → internal → relative) and alphabetical sorting within groups.

### CF-PLAN-1.3 [Tool Configuration]: Pre-commit Automation

- **Tool**: Husky + lint-staged
- **Scope**: Staged files on commit
- **Rationale**: Husky provides git hooks, lint-staged runs formatters only on staged files for fast execution. Avoids processing entire codebase on each commit.

### CF-PLAN-1.4 [Tool Configuration]: Editor Integration

- **Tool**: VS Code settings + .editorconfig
- **Scope**: All supported file types
- **Rationale**: Ensures consistent formatting across all team editors with auto-format on save.

---

## Configuration Items

### CF-ITEM-1.1 [Prettier Configuration]: Core Prettier Setup

- **File**: `.prettierrc` (or `prettier.config.js`)
- **Rules**:
  ```json
  {
    "semi": true,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "all",
    "printWidth": 100,
    "endOfLine": "lf",
    "bracketSpacing": true,
    "arrowParens": "always"
  }
  ```
- **Dependencies**: `prettier` (devDependency)
- **Rationale**:
  - `semi: true` - Consistent semicolon usage
  - `singleQuote: true` - Modern JS convention
  - `tabWidth: 2` - Matches ESLint/Next.js convention
  - `trailingComma: all` - Better git diffs
  - `printWidth: 100` - Readable without excessive wrapping
  - `endOfLine: lf` - Cross-platform consistency

### CF-ITEM-1.2 [Prettier Configuration]: Language Overrides

- **File**: `.prettierrc`
- **Rules**:
  ```json
  {
    "overrides": [
      {
        "files": "*.md",
        "options": {
          "proseWrap": "preserve",
          "printWidth": 80
        }
      },
      {
        "files": "*.json",
        "options": {
          "printWidth": 120
        }
      }
    ]
  }
  ```
- **Rationale**: Markdown preserves user formatting, JSON allows wider lines for config files.

### CF-ITEM-1.3 [Prettier Configuration]: Ignore Patterns

- **File**: `.prettierignore`
- **Content**:

  ```
  # Dependencies
  node_modules/

  # Build output
  .next/
  out/
  build/
  dist/

  # Generated files
  next-env.d.ts
  *.d.ts

  # Lock files
  package-lock.json
  yarn.lock
  pnpm-lock.yaml

  # IDE
  .vscode/
  .idea/

  # Misc
  *.ico
  *.svg
  ```

- **Rationale**: Excludes generated, vendor, and lock files that should not be formatted.

### CF-ITEM-1.4 [ESLint Configuration]: Add Prettier Integration

- **File**: `eslint.config.mjs`
- **Operations**: Add import and merge with existing config
- **Proposed Changes**:

  ```javascript
  import { defineConfig, globalIgnores } from 'eslint/config';
  import nextVitals from 'eslint-config-next/core-web-vitals';
  import nextTs from 'eslint-config-next/typescript';
  import prettier from 'eslint-config-prettier';
  import importPlugin from 'eslint-plugin-import';

  const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    ...prettier,
    {
      plugins: {
        import: importPlugin,
      },
      rules: {
        'react/no-unescaped-entities': 'off',
        // Import sorting rules
        'import/order': [
          'error',
          {
            groups: [
              'builtin',
              'external',
              'internal',
              'parent',
              'sibling',
              'index',
            ],
            'newlines-between': 'always',
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
          },
        ],
        'import/first': 'error',
        'import/no-duplicates': 'error',
        'import/newline-after-import': 'error',
      },
    },
    // Override for test files
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_' },
        ],
      },
    },
    // Override for config files
    {
      files: ['eslint.config.mjs', 'next.config.ts', 'postcss.config.mjs'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  ]);

  export default eslintConfig;
  ```

- **Dependencies**: `eslint-config-prettier`, `eslint-plugin-import`
- **Rationale**: Disables conflicting ESLint rules, adds import sorting with proper grouping (builtin → external → internal → relative).

### CF-ITEM-1.5 [Husky Configuration]: Pre-commit Hook Setup

- **File**: `.husky/pre-commit`
- **Content**:
  ```bash
  npx lint-staged
  ```
- **Dependencies**: `husky` (devDependency)
- **Rationale**: Runs lint-staged on pre-commit to format only staged files.

### CF-ITEM-1.6 [lint-staged Configuration]: Staged File Formatting

- **File**: `package.json` (add "lint-staged" field)
- **Operations**: Add lint-staged configuration
- **Proposed Changes**:
  ```json
  {
    "lint-staged": {
      "*.{ts,tsx}": ["prettier --write", "eslint --fix"],
      "*.{css,json,md}": ["prettier --write"],
      "*.{js,mjs,cjs}": ["prettier --write", "eslint --fix"]
    }
  }
  ```
- **Dependencies**: `lint-staged` (devDependency)
- **Rationale**: Runs Prettier first (formatting), then ESLint --fix (auto-fixable quality issues). Order matters: Prettier first to handle formatting, ESLint second for code quality fixes.

### CF-ITEM-1.7 [VS Code Settings]: Editor Integration

- **File**: `.vscode/settings.json`
- **Operations**: Merge with existing settings
- **Proposed Changes**:
  ```json
  {
    "snyk.advanced.autoSelectOrganization": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit",
      "source.organizeImports": "explicit"
    },
    "editor.rulers": [100],
    "editor.tabSize": 2,
    "files.eol": "\n",
    "[typescript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[typescriptreact]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[json]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[jsonc]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[markdown]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[css]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    }
  }
  ```
- **Dependencies**: Prettier VS Code extension (user-side)
- **Rationale**: Auto-format on save, ESLint fix on save, organize imports on save. Sets 100-character ruler matching Prettier config.

### CF-ITEM-1.8 [.editorconfig]: Cross-editor Consistency

- **File**: `.editorconfig`
- **Content**:

  ```ini
  # EditorConfig is awesome: https://EditorConfig.org

  root = true

  [*]
  charset = utf-8
  end_of_line = lf
  insert_final_newline = true
  trim_trailing_whitespace = true

  [*.{js,jsx,ts,tsx,json,css}]
  indent_style = space
  indent_size = 2

  [*.md]
  trim_trailing_whitespace = false

  [package.json]
  indent_size = 2
  ```

- **Rationale**: Fallback for non-VS Code editors, ensures consistent basic formatting.

### CF-ITEM-1.9 [npm Scripts]: Manual Formatting Commands

- **File**: `package.json`
- **Operations**: Add scripts
- **Proposed Changes**:
  ```json
  {
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "eslint",
      "lint:fix": "eslint --fix",
      "format": "prettier --write .",
      "format:check": "prettier --check .",
      "format:fix": "prettier --write . && eslint --fix .",
      "prepare": "husky"
    }
  }
  ```
- **Rationale**: Provides manual formatting commands for developers and CI. `prepare` script auto-installs Husky.

---

## Proposed Code Changes

### Patch 1: Create `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "endOfLine": "lf",
  "bracketSpacing": true,
  "arrowParens": "always",
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "proseWrap": "preserve",
        "printWidth": 80
      }
    },
    {
      "files": "*.json",
      "options": {
        "printWidth": 120
      }
    }
  ]
}
```

### Patch 2: Create `.prettierignore`

```
# Dependencies
node_modules/

# Build output
.next/
out/
build/
dist/

# Generated files
next-env.d.ts
*.d.ts

# Lock files
package-lock.json
yarn.lock
pnpm-lock.yaml

# IDE
.vscode/
.idea/

# Misc
*.ico
*.svg
```

### Patch 3: Update `eslint.config.mjs`

```javascript
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...prettier,
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'react/no-unescaped-entities': 'off',
      // Import sorting rules
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/newline-after-import': 'error',
    },
  },
  // Override for test files
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  // Override for config files
  {
    files: ['eslint.config.mjs', 'next.config.ts', 'postcss.config.mjs'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
```

### Patch 4: Update `package.json` (scripts + lint-staged)

```json
{
  "name": "github-profile-readme-builder",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:fix": "eslint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "format:fix": "prettier --write . && eslint --fix .",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["prettier --write", "eslint --fix"],
    "*.{css,json,md}": ["prettier --write"],
    "*.{js,mjs,cjs}": ["prettier --write", "eslint --fix"]
  },
  "dependencies": {
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.6.0",
    "next": "16.2.1",
    "next-themes": "^0.4.6",
    "radix-ui": "^1.4.3",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "shadcn": "^4.1.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tw-animate-css": "^1.4.0",
    "zustand": "^5.0.12"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.1",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.31.0",
    "husky": "^9.1.0",
    "lint-staged": "^15.2.0",
    "prettier": "^3.4.0",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### Patch 5: Update `.vscode/settings.json`

```json
{
  "snyk.advanced.autoSelectOrganization": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.rulers": [100],
  "editor.tabSize": 2,
  "files.eol": "\n",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Patch 6: Create `.editorconfig`

```ini
# EditorConfig is awesome: https://EditorConfig.org

root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,jsx,ts,tsx,json,css}]
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[package.json]
indent_size = 2
```

### Patch 7: Create `.husky/pre-commit`

```bash
npx lint-staged
```

---

## Commands

### Installation Commands

```bash
# Install new dependencies
npm install -D prettier eslint-config-prettier eslint-plugin-import husky lint-staged

# Initialize Husky (one-time)
npx husky init
```

### Local Development Commands

```bash
# Format all files (one-time baseline)
npm run format

# Check formatting without fixing
npm run format:check

# Fix formatting and lint issues
npm run format:fix

# Run lint only
npm run lint

# Run lint with auto-fix
npm run lint:fix
```

### CI Pipeline Commands

```bash
# Format check (fails if files need formatting)
npm run format:check && npm run lint
```

---

## Quality Assurance Checklist

- [ ] All formatting tools run without conflicts or errors
- [ ] Pre-commit hooks are configured and tested end-to-end
- [ ] CI pipeline includes a formatting check as a required status gate
- [ ] Editor configuration files are included for consistent auto-format on save
- [ ] Configuration files include comments explaining non-default rules
- [ ] Import sorting is configured and produces deterministic ordering
- [ ] Team documentation covers setup, usage, and rule change process

---

## Implementation Order

1. Install dependencies: `prettier`, `eslint-config-prettier`, `eslint-plugin-import`, `husky`, `lint-staged`
2. Create `.prettierrc` with core configuration
3. Create `.prettierignore` with ignore patterns
4. Update `eslint.config.mjs` with Prettier integration and import rules
5. Update `package.json` with scripts and lint-staged config
6. Initialize Husky: `npx husky init`
7. Create `.husky/pre-commit` hook
8. Update `.vscode/settings.json` with editor integration
9. Create `.editorconfig` for cross-editor consistency
10. Run one-time format: `npm run format`
11. Test pre-commit hook: `git add . && git commit -m "test"`

---

## Notes

- **ESLint 9 Flat Config**: This project uses ESLint 9 with flat config format (`eslint.config.mjs`). The configuration uses the new array-based format.
- **Tailwind CSS 4**: Uses CSS-first configuration in `app/globals.css`. Prettier handles CSS files but does not modify Tailwind directives.
- **TypeScript Path Aliases**: The `@/*` alias is configured in `tsconfig.json` and handled correctly by ESLint and Prettier.
- **One-time Format**: After implementing this configuration, run `npm run format` once to establish the baseline formatting across the entire codebase.
