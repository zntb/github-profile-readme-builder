<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,100:8b5cf6&height=200&section=header&text=GitHub%20Profile%20README%20Builder&fontSize=36&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Craft%20stunning%20GitHub%20profiles%20visually%2C%20no%20code%20needed&descAlignY=58&descSize=16" />

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

**[🚀 Live Demo](https://github-profile-maker.vercel.app/) · [📖 Documentation](#documentation) · [🐛 Report Bug](issues) · [✨ Request Feature](issues)**

</div>

---

## Overview

**GitHub Profile Maker** is a fully visual, drag-and-drop editor for creating beautiful GitHub profile `README.md` files — zero code required. Pick from a rich library of blocks, configure them with an intuitive panel, preview the result in real time, and export production-ready Markdown in one click.

> Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui**, **Zustand**, and **dnd-kit**.

<div align="center">
  <img src="./public/screenshot.png" alt="App Screenshot" width="900" style="border-radius: 12px;" />
</div>

---

## Table of Contents

- [Overview](#overview)
- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Block Library](#block-library)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Development](#development)
  - [Production Build](#production-build)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
  - [Supported Themes](#supported-themes)
- [Templates](#templates)
- [Contributing](#contributing)
  - [Adding a New Block](#adding-a-new-block)
  - [Code Style](#code-style)
- [License](#license)

---

## Features

| Feature                   | Description                                                       |
| ------------------------- | ----------------------------------------------------------------- |
| 🧱 **Drag & Drop Canvas** | Reorder blocks effortlessly with smooth dnd-kit animations        |
| 📐 **Stats Row Layout**   | Flexible row/column multi-card layouts for stats widgets          |
| 👁️ **Live Preview**       | See exactly how your README renders in GitHub's style             |
| 📝 **Markdown Export**    | Copy to clipboard or download a ready-to-use `README.md`          |
| 🎨 **65+ Themes**         | Tokyo Night, Dracula, Radical, Catppuccin, and many more          |
| 📦 **25+ Block Types**    | Headers, stats cards, badges, skill icons, graphs, and more       |
| 🖼️ **Template Library**   | 11 ready-to-use templates for different developer profiles        |
| 📱 **Fully Responsive**   | Optimized three-layout system for desktop, tablet, and mobile     |
| 🌙 **Dark / Light Mode**  | System-aware theming powered by `next-themes`                     |
| ⚡ **Self-hosted Stats**  | Built-in Next.js API routes generate GitHub stat SVGs server-side |
| 🔑 **GitHub GraphQL**     | Optional `GITHUB_TOKEN` for real, live stats from the GitHub API  |
| 💬 **Random Quotes**      | Built-in API for fetching random developer quotes                 |

---

## Block Library

Blocks are organized into eight categories:

<details>
<summary><strong>Layout</strong> — Structure your README</summary>

| Block         | Description                                                          |
| ------------- | -------------------------------------------------------------------- |
| **Container** | Flex wrapper supporting `row`/`column` direction, alignment, and gap |
| **Divider**   | Horizontal rule or a custom animated GIF divider                     |
| **Spacer**    | Configurable height gap (10–100 px)                                  |

</details>

<details>
<summary><strong>Hero</strong> — Eye-catching headers</summary>

| Block                | Description                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| **Capsule Header**   | Animated banner via [capsule-render](https://github.com/kyechan99/capsule-render) with 7 animation types |
| **Avatar**           | Circular or rounded profile image with configurable size                                                 |
| **Greeting**         | Large `<h1>` greeting with optional emoji                                                                |
| **Typing Animation** | Animated typing SVG via readme-typing-svg with multiple lines                                            |

</details>

<details>
<summary><strong>Content</strong> — Text and code</summary>

| Block           | Description                                           |
| --------------- | ----------------------------------------------------- |
| **Heading**     | H1–H3 with alignment and emoji prefix                 |
| **Paragraph**   | Freeform text with alignment control                  |
| **Collapsible** | GitHub `<details>` block with nested children         |
| **Code Block**  | Syntax-highlighted fenced code with language selector |

</details>

<details>
<summary><strong>Media</strong> — Images & GIFs</summary>

| Block     | Description                                            |
| --------- | ------------------------------------------------------ |
| **Image** | External image with size, alignment, and border-radius |
| **GIF**   | Lightweight GIF embed with width control               |

</details>

<details>
<summary><strong>Social</strong> — Badges & links</summary>

| Block             | Description                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| **Social Badges** | One-click shields.io badges for LinkedIn, Twitter, GitHub, YouTube, Instagram, Discord, Email, Portfolio |
| **Custom Badge**  | Fully custom label/message/color/logo badge                                                              |

</details>

<details>
<summary><strong>Tech Stack</strong> — Skills</summary>

| Block           | Description                                                                 |
| --------------- | --------------------------------------------------------------------------- |
| **Skill Icons** | Grid of tech icons via [skillicons.dev](https://skillicons.dev) — 80+ icons |

</details>

<details>
<summary><strong>GitHub Stats</strong> — Activity widgets</summary>

| Block              | Description                                             |
| ------------------ | ------------------------------------------------------- |
| **Stats Row**      | Flexible row/column layout for multiple stat cards      |
| **Stats Card**     | Stars, commits, PRs, issues, and rank ring              |
| **Top Languages**  | Compact, normal, donut, donut-vertical, or pie layout   |
| **Streak Stats**   | Current streak, longest streak, and total contributions |
| **Activity Graph** | 30-day contribution line chart                          |
| **Trophies**       | Trophy grid with configurable columns/rows              |

</details>

<details>
<summary><strong>Advanced</strong> — Extra elements</summary>

| Block               | Description                                      |
| ------------------- | ------------------------------------------------ |
| **Visitor Counter** | komarev.com page-view badge                      |
| **Quote**           | Static custom quote or random dev quote from API |
| **Footer Banner**   | Waving capsule-render footer                     |

</details>

---

## Tech Stack

```text
Frontend          Next.js 16 (App Router) · React 19 · TypeScript 5
Styling           Tailwind CSS v4 · tw-animate-css · shadcn/ui (radix-nova)
State             Zustand 5
Drag & Drop       dnd-kit (sortable)
Icons             Lucide React
Theming           next-themes
Notifications     Sonner
API               Next.js Route Handlers · GitHub REST & GraphQL APIs
Fonts             Outfit · JetBrains Mono
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A package manager: `npm`, `pnpm`, `yarn`, or `bun`
- _(Optional)_ A GitHub Personal Access Token for live stats

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/zntb/github-profile-maker.git
cd github-profile-maker

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# .env.local

# Optional – enables real GitHub stats, streak, trophies, and activity graphs.
# Create one at: https://github.com/settings/tokens
# Required scopes: read:user
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

> **Without a token** the stat widgets still render but display a "GitHub Token Required" placeholder instead of live data.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```text
github-profile-maker/
├── app/
│   ├── api/
│   │   ├── activity/route.ts      # Contribution activity graph SVG
│   │   ├── quotes/route.ts        # Random dev quotes API
│   │   ├── stats/route.ts         # GitHub stats card SVG
│   │   ├── streak/route.ts        # Streak stats SVG
│   │   ├── top-langs/route.ts     # Top languages SVG
│   │   └── trophies/route.ts      # Trophy grid SVG
│   ├── globals.css                # Tailwind v4 tokens + custom animations
│   ├── layout.tsx                 # Root layout with ThemeProvider & fonts
│   └── page.tsx                   # Entry point → <Builder />
│
├── components/
│   ├── builder/
│   │   ├── index.tsx              # Responsive layout orchestrator (desktop / tablet / mobile)
│   │   ├── header.tsx             # Top bar: branding, Templates, Clear, Export
│   │   ├── block-sidebar.tsx      # Searchable block library with categories
│   │   ├── canvas.tsx             # dnd-kit sortable drop zone
│   │   ├── canvas-block.tsx       # Individual draggable block wrapper
│   │   ├── block-preview.tsx      # Compact canvas-level block previews
│   │   ├── config-panel.tsx       # Right-side property editor (per block type)
│   │   ├── live-preview.tsx       # Full GitHub-style README render
│   │   ├── output-panel.tsx       # Markdown output + copy/download actions
│   │   ├── config/                  # Block configuration components
│   │   │   └── blocks/             # Per-block config fields (25+ files)
│   │   └── templates-dialog.tsx   # Template picker dialog
│   ├── ui/                        # shadcn/ui components
│   └── mode-toggle.tsx            # Light/Dark/System theme switcher
│
├── lib/
│   ├── github.ts                  # GitHub REST + GraphQL helpers, rank calc, streak calc
│   ├── markdown.ts                # Block → Markdown renderer + download/copy utils
│   ├── store.ts                   # Zustand builder store (blocks, selection, DnD)
│   ├── templates.ts               # Pre-built template definitions
│   ├── types.ts                   # Block types, prop interfaces, BLOCK_CATEGORIES
│   └── utils.ts                   # cn() Tailwind merge helper
│
└── public/                        # Static assets & favicons
```

---

## API Routes

All stat widgets are generated server-side by built-in Next.js route handlers. They proxy and render live GitHub data as SVG images, meaning the generated Markdown will work from any host that has `GITHUB_TOKEN` configured.

| Route                | Query Params                                                                                                                                        | Description           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `GET /api/quotes`    | (none)                                                                                                                                              | Random dev quote      |
| `GET /api/stats`     | `username`, `theme`, `show_icons`, `hide_border`, `hide_title`, `hide_rank`, `border_radius`, `bg_color`, `text_color`, `title_color`, `icon_color` | GitHub stats card     |
| `GET /api/streak`    | `username`, `theme`, `hide_border`, `border_radius`, `background`, `fire`, `ring`, `currStreakNum`, `sideNums`, `sideLabels`, `dates`               | Streak stats card     |
| `GET /api/top-langs` | `username`, `theme`, `layout`, `hide_border`, `hide_progress`, `langs_count`, `border_radius`, `bg_color`, `text_color`, `title_color`              | Top languages card    |
| `GET /api/activity`  | `username`, `theme`, `hide_border`, `bg_color`, `color`, `line`, `point`, `area_color`                                                              | 30-day activity graph |
| `GET /api/trophies`  | `username`, `theme`, `column`, `row`, `margin_w`, `margin_h`, `no_frame`, `no_bg`                                                                   | Trophy grid           |

### Supported Themes

Over **65 themes** are supported across all widgets, including:

`default` · `dark` · `radical` · `tokyonight` · `dracula` · `onedark` · `nord` · `github_dark` · `catppuccin_mocha` · `gruvbox` · `merko` · `react` · `midnight-purple` · `rose_pine` · and many more.

---

## Templates

Eleven built-in templates are included to help you start quickly:

| Template                   | Description                                                     | Blocks |
| -------------------------- | --------------------------------------------------------------- | ------ |
| **Animated Developer**     | Waving header, typing SVG, full stats suite, social badges      | 16     |
| **Minimal Clean**          | Simple heading/paragraph layout with essential stats            | 8      |
| **Stats Focused**          | Full stats dashboard — card, streak, languages, graph, trophies | 8      |
| **Creative Profile**       | Avatar, custom animation, quote block, creative color palette   | 9      |
| **Open Source Maintainer** | Container layout, collapsible sections, extensive stats         | 18     |
| **Full Stack Engineer**    | Multiple skill icon sections, comprehensive stats               | 19     |
| **Data Scientist / ML**    | Code blocks, ML frameworks, visualizations                      | 20     |
| **DevOps / Cloud**         | Custom badges, code blocks, cloud platforms                     | 21     |
| **Student / Beginner**     | Learning focus with beginner-friendly content                   | 21     |
| **Cybersecurity**          | Code-focused, custom badges, security tools                     | 17     |
| **Game Developer**         | Gaming-focused with custom badges and quote block               | 22     |

Templates are defined in `lib/templates.ts` and can be extended freely.

---

## Contributing

Contributions are welcome! Here's how to get involved:

```bash
# Fork & clone
git clone https://github.com/zntb/github-profile-maker.git

# Create a feature branch
git checkout -b feat/my-new-block

# Make your changes, then commit
git commit -m "feat: add <block-name> block"

# Push and open a Pull Request
git push origin feat/my-new-block
```

### Adding a New Block

1. Add the block type to the `BlockType` union in `lib/types.ts`
2. Define its `defaultProps` in the relevant `BLOCK_CATEGORIES` entry in `lib/types.ts`
3. Add a preview renderer case in `components/builder/block-preview.tsx`
4. Add a config fields case in `components/builder/config-panel.tsx`
5. Add a live preview case in `components/builder/live-preview.tsx`
6. Add a Markdown render case in `lib/markdown.ts`

### Code Style

- All code is **TypeScript** — avoid `any`
- Use **shadcn/ui** components where possible
- Follow existing Tailwind class conventions (CSS variables, `cn()` helper)
- Run `npm run lint` before submitting

We use **Prettier** and **ESLint** with a pre-commit hook. The hook will block commits if there are any lint errors or formatting issues:

```bash
# Format all files
npm run format

# Check for issues
npm run format:check
npm run lint
```

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,100:8b5cf6&height=100&section=footer" />

Made with ❤️ using Next.js & React

⭐ **Star this repo** if you found it useful!\
<br/>

[![Buy me a coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://buymeacoffee.com/codetibo)

</div>

---
