# Block Reference

This document provides a complete reference for all blocks available in the GitHub Profile Maker, including their configuration options and default values.

## Table of Contents

- [Layout Blocks](#layout-blocks)
- [Hero Blocks](#hero-blocks)
- [Content Blocks](#content-blocks)
- [Media Blocks](#media-blocks)
- [Social Blocks](#social-blocks)
- [Tech Stack Blocks](#tech-stack-blocks)
- [GitHub Stats Blocks](#github-stats-blocks)
- [Advanced Blocks](#advanced-blocks)

---

## Layout Blocks

### Container

A flex wrapper that organizes child blocks in a row or column layout with optional gradient or animated backgrounds.

**Type:** `container`

**Icon:** `Layout`

**Default Props:**

```typescript
{
  alignment: 'center',
  direction: 'column',
  gap: 16,
  bgType: 'solid',
  bgSolidColor: 'transparent'
}
```

**Configuration Options:**

| Property              | Type   | Options                                                           | Description                         |
| --------------------- | ------ | ----------------------------------------------------------------- | ----------------------------------- |
| `alignment`           | string | `'left'`, `'center'`, `'right'`                                   | Horizontal alignment                |
| `direction`           | string | `'row'`, `'column'`                                               | Flex direction                      |
| `gap`                 | number | `0-100`                                                           | Gap between children in pixels      |
| `bgType`              | string | `'solid'`, `'gradient'`, `'animated'`                             | Background type                     |
| `bgGradientDirection` | string | `'horizontal'`, `'vertical'`, `'diagonal'`, `'radial'`, `'conic'` | Gradient direction                  |
| `bgAnimation`         | string | `'none'`, `'gradient'`, `'pulse'`, `'wave'`, `'shimmer'`          | Animation style (for animated type) |
| `bgStartColor`        | string | hex color                                                         | Start color for gradient            |
| `bgEndColor`          | string | hex color                                                         | End color for gradient              |
| `bgSolidColor`        | string | hex color or `'transparent'`                                      | Solid background color              |

**Markdown Output:**

```markdown
<div align="center">
<!-- Child blocks -->
</div>
```

---

### Divider

A horizontal line or animated GIF divider.

**Type:** `divider`

**Icon:** `Minus`

**Default Props:**

```typescript
{
  type: 'line',
  color: '#e1e4e8'
}
```

**Configuration Options:**

| Property | Type   | Options           | Description                         |
| -------- | ------ | ----------------- | ----------------------------------- |
| `type`   | string | `'line'`, `'gif'` | Divider type                        |
| `gifUrl` | string | URL               | Custom GIF URL (when type is 'gif') |
| `color`  | string | hex color         | Line color (when type is 'line')    |

**Markdown Output:**

```markdown
---
```

Or for GIF type:

```markdown
<img src="gifUrl" />
```

---

### Spacer

Adds vertical spacing between blocks.

**Type:** `spacer`

**Icon:** `Space`

**Default Props:**

```typescript
{
  height: 20;
}
```

**Configuration Options:**

| Property | Type   | Range    | Description             |
| -------- | ------ | -------- | ----------------------- |
| `height` | number | `10-100` | Spacer height in pixels |

**Markdown Output:**

```markdown
<br/>
```

---

## Hero Blocks

### Capsule Header

An animated banner using capsule-render with customizable gradient or animated backgrounds.

**Type:** `capsule-header`

**Icon:** `Sparkles`

**Default Props:**

```typescript
{
  text: 'Hello World!',
  type: 'waving',
  height: 200,
  section: 'header',
  bgType: 'gradient',
  bgGradientDirection: 'horizontal',
  bgAnimation: 'none',
  bgStartColor: 'EEFF00',
  bgEndColor: 'a82DA'
}
```

**Configuration Options:**

| Property              | Type   | Options                                                           | Description              |
| --------------------- | ------ | ----------------------------------------------------------------- | ------------------------ |
| `text`                | string | text                                                              | Banner text              |
| `type`                | string | `'waving'`, `'typing'`, `'static'`                                | Animation type           |
| `height`              | number | `50-500`                                                          | Banner height            |
| `section`             | string | `'header'`, `'footer'`                                            | Banner section           |
| `bgType`              | string | `'solid'`, `'gradient'`, `'animated'`                             | Background type          |
| `bgGradientDirection` | string | `'horizontal'`, `'vertical'`, `'diagonal'`, `'radial'`, `'conic'` | Gradient direction       |
| `bgAnimation`         | string | `'none'`, `'gradient'`, `'pulse'`, `'wave'`, `'shimmer'`          | Animation style          |
| `bgStartColor`        | string | hex color                                                         | Start color for gradient |
| `bgEndColor`          | string | hex color                                                         | End color for gradient   |

---

### Avatar

A circular or rounded profile image.

**Type:** `avatar`

**Icon:** `User`

**Default Props:**

```typescript
{
  imageUrl: 'https://github.com/github.png',
  size: 150,
  borderRadius: 50
}
```

**Configuration Options:**

| Property       | Type   | Range     | Description              |
| -------------- | ------ | --------- | ------------------------ |
| `imageUrl`     | string | URL       | Image URL                |
| `size`         | number | `50-300`  | Image size in pixels     |
| `borderRadius` | number | `0-100`   | Border radius percentage |
| `borderColor`  | string | hex color | Border color (optional)  |

---

### Greeting

A large heading with optional emoji.

**Type:** `greeting`

**Icon:** `Hand`

**Default Props:**

```typescript
{
  text: "Hi, I'm [Your Name]!",
  emoji: '👋',
  alignment: 'center'
}
```

**Configuration Options:**

| Property    | Type   | Options                         | Description           |
| ----------- | ------ | ------------------------------- | --------------------- |
| `text`      | string | text                            | Greeting text         |
| `emoji`     | string | emoji                           | Optional emoji prefix |
| `alignment` | string | `'left'`, `'center'`, `'right'` | Text alignment        |

---

### Typing Animation

An animated typing SVG using readme-typing-svg.

**Type:** `typing-animation`

**Icon:** `Type`

**Default Props:**

```typescript
{
  lines: ['Full Stack Developer', 'Open Source Enthusiast', 'Tech Blogger'],
  color: '36BCF7',
  width: 435,
  height: 30,
  speed: 50
}
```

**Configuration Options:**

| Property | Type      | Description                          |
| -------- | --------- | ------------------------------------ |
| `lines`  | string[]  | Array of text lines to cycle through |
| `color`  | hex color | Text color                           |
| `width`  | number    | SVG width                            |
| `height` | number    | SVG height                           |
| `speed`  | number    | Animation speed (ms)                 |

---

## Content Blocks

### Heading

An H1-H3 heading with optional emoji.

**Type:** `heading`

**Icon:** `Heading`

**Default Props:**

```typescript
{
  text: 'Section Title',
  level: 2,
  alignment: 'left',
  emoji: ''
}
```

**Configuration Options:**

| Property    | Type   | Options                         | Description           |
| ----------- | ------ | ------------------------------- | --------------------- |
| `text`      | string | text                            | Heading text          |
| `level`     | number | `1`, `2`, `3`                   | Heading level         |
| `alignment` | string | `'left'`, `'center'`, `'right'` | Text alignment        |
| `emoji`     | string | emoji                           | Optional emoji prefix |

---

### Paragraph

Freeform text with alignment control.

**Type:** `paragraph`

**Icon:** `AlignLeft`

**Default Props:**

```typescript
{
  text: 'Your paragraph text here...',
  alignment: 'left'
}
```

**Configuration Options:**

| Property    | Type   | Options                         | Description    |
| ----------- | ------ | ------------------------------- | -------------- |
| `text`      | string | text                            | Paragraph text |
| `alignment` | string | `'left'`, `'center'`, `'right'` | Text alignment |

---

### Collapsible

A GitHub `<details>` block with nested children.

**Type:** `collapsible`

**Icon:** `ChevronDown`

**Default Props:**

```typescript
{
  title: 'Click to expand',
  defaultOpen: false
}
```

**Configuration Options:**

| Property      | Type    | Options         | Description              |
| ------------- | ------- | --------------- | ------------------------ |
| `title`       | string  | text            | Collapsible title        |
| `defaultOpen` | boolean | `true`, `false` | Initially expanded state |

**Markdown Output:**

```markdown
<details>
<summary>Title</summary>

<!-- Child blocks -->

</details>
```

---

### Code Block

Syntax-highlighted fenced code.

**Type:** `code-block`

**Icon:** `Code`

**Default Props:**

```typescript
{
  code: 'console.log("Hello, World!");',
  language: 'javascript'
}
```

**Configuration Options:**

| Property   | Type   | Description                                  |
| ---------- | ------ | -------------------------------------------- |
| `code`     | string | Code content                                 |
| `language` | string | Programming language for syntax highlighting |

**Supported Languages:**

- `javascript`, `typescript`, `python`, `java`, `go`, `rust`
- `c`, `cpp`, `csharp`, `php`, `ruby`, `swift`, `kotlin`
- `html`, `css`, `scss`, `sql`, `bash`, `powershell`
- `json`, `yaml`, `markdown`, `dockerfile`, and more

---

## Media Blocks

### Image

An external image with size and alignment control.

**Type:** `image`

**Icon:** `Image`

**Default Props:**

```typescript
{
  url: 'https://example.com/image.png',
  alt: 'Image description',
  width: 500,
  alignment: 'center',
  borderRadius: 0
}
```

**Configuration Options:**

| Property       | Type   | Description                       |
| -------------- | ------ | --------------------------------- |
| `url`          | string | Image URL                         |
| `alt`          | string | Alt text for accessibility        |
| `width`        | number | Image width in pixels             |
| `height`       | number | Image height in pixels (optional) |
| `alignment`    | string | `'left'`, `'center'`, `'right'`   |
| `borderRadius` | number | Border radius in pixels           |

---

### GIF

A lightweight GIF embed.

**Type:** `gif`

**Icon:** `Gift`

**Default Props:**

```typescript
{
  url: 'https://example.com/animated.gif',
  alt: 'Animated GIF',
  width: 500,
  alignment: 'center'
}
```

**Configuration Options:**

| Property    | Type   | Description                     |
| ----------- | ------ | ------------------------------- |
| `url`       | string | GIF URL                         |
| `alt`       | string | Alt text                        |
| `width`     | number | Width in pixels                 |
| `alignment` | string | `'left'`, `'center'`, `'right'` |

---

## Social Blocks

### Social Badges

Shields.io badges for social links.

**Type:** `social-badges`

**Icon:** `Link`

**Default Props:**

```typescript
{
  linkedin: '',
  twitter: '',
  email: '',
  portfolio: '',
  github: '',
  youtube: '',
  instagram: '',
  discord: '',
  style: 'flat'
}
```

**Configuration Options:**

| Property    | Type   | Options                                                               | Description           |
| ----------- | ------ | --------------------------------------------------------------------- | --------------------- |
| `linkedin`  | string | username                                                              | LinkedIn username     |
| `twitter`   | string | username                                                              | Twitter/X username    |
| `email`     | string | email                                                                 | Email address         |
| `portfolio` | string | URL                                                                   | Portfolio website URL |
| `github`    | string | username                                                              | GitHub username       |
| `youtube`   | string | channel                                                               | YouTube channel       |
| `instagram` | string | username                                                              | Instagram username    |
| `discord`   | string | invite                                                                | Discord invite code   |
| `style`     | string | `'flat'`, `'flat-square'`, `'for-the-badge'`, `'plastic'`, `'social'` | Badge style           |

---

### Custom Badge

A fully customizable shields.io badge.

**Type:** `custom-badge`

**Icon:** `Shield`

**Default Props:**

```typescript
{
  label: 'Label',
  message: 'Message',
  color: 'green',
  labelColor: 'grey',
  style: 'flat',
  logo: '',
  logoColor: 'white'
}
```

**Configuration Options:**

| Property     | Type   | Description                                               |
| ------------ | ------ | --------------------------------------------------------- |
| `label`      | string | Left side label                                           |
| `message`    | string | Right side message                                        |
| `color`      | string | Message background color (hex or named)                   |
| `labelColor` | string | Label background color                                    |
| `style`      | string | `'flat'`, `'flat-square'`, `'for-the-badge'`, `'plastic'` |
| `logo`       | string | Logo name (e.g., `'github'`, `'npm'`)                     |
| `logoColor`  | string | Logo color                                                |

---

## Tech Stack Blocks

### Skill Icons

A grid of technology icons from skillicons.dev.

**Type:** `skill-icons`

**Icon:** `Code2`

**Default Props:**

```typescript
{
  icons: ['javascript', 'typescript', 'react', 'nodejs'],
  perLine: 8,
  theme: 'dark'
}
```

**Configuration Options:**

| Property  | Type     | Description           |
| --------- | -------- | --------------------- |
| `icons`   | string[] | Array of icon names   |
| `perLine` | number   | Icons per line (1-12) |
| `theme`   | string   | `'light'` or `'dark'` |

**Available Icons:**

- Languages: `js`, `ts`, `python`, `java`, `go`, `rust`, `c`, `cpp`, `cs`, `php`, `ruby`, `swift`, `kotlin`, `dart`
- Frontend: `react`, `vue`, `angular`, `svelte`, `nextjs`, `html`, `css`, `sass`, `tailwind`, `bootstrap`
- Backend: `nodejs`, `express`, `nestjs`, `django`, `flask`, `fastapi`, `spring`, `laravel`
- Database: `mongodb`, `mysql`, `postgres`, `redis`, `firebase`, `supabase`
- DevOps: `aws`, `gcp`, `azure`, `docker`, `kubernetes`, `nginx`, `git`, `github`
- Tools: `vscode`, `vim`, `figma`, `webpack`, `vite`, `graphql`, `prisma`, `jest`, `cypress`

---

## GitHub Stats Blocks

### Stats Row

A flexible container for multiple stat cards.

**Type:** `stats-row`

**Icon:** `LayoutGrid`

**Default Props:**

```typescript
{
  direction: 'row',
  gap: 16,
  cardWidth: '',
  cardHeight: ''
}
```

**Configuration Options:**

| Property     | Type   | Options             | Description        |
| ------------ | ------ | ------------------- | ------------------ |
| `direction`  | string | `'row'`, `'column'` | Layout direction   |
| `gap`        | number | `0-50`              | Gap between cards  |
| `cardWidth`  | string | CSS                 | Custom card width  |
| `cardHeight` | string | CSS                 | Custom card height |

---

### Stats Card

GitHub stats including stars, commits, PRs, and issues.

**Type:** `stats-card`

**Icon:** `BarChart`

**Default Props:**

```typescript
{
  username: '',
  theme: 'default',
  layoutStyle: 'standard',
  layoutWidth: 'half',
  showIcons: true,
  hideBorder: false,
  hideTitle: false,
  hideRank: false,
  borderRadius: 4.5
}
```

**Configuration Options:**

| Property       | Type    | Options                   | Description     |
| -------------- | ------- | ------------------------- | --------------- |
| `username`     | string  | GitHub username           | GitHub username |
| `theme`        | string  | Theme name                | Visual theme    |
| `layoutStyle`  | string  | `'standard'`, `'compact'` | Card layout     |
| `layoutWidth`  | string  | `'half'`, `'full'`        | Card width      |
| `showIcons`    | boolean | `true`, `false`           | Show stat icons |
| `hideBorder`   | boolean | `true`, `false`           | Hide border     |
| `hideTitle`    | boolean | `true`, `false`           | Hide title      |
| `hideRank`     | boolean | `true`, `false`           | Hide rank       |
| `borderRadius` | number  | `0-100`                   | Border radius   |

---

### Top Languages

Programming languages breakdown.

**Type:** `top-languages`

**Icon:** `Languages`

**Default Props:**

```typescript
{
  username: '',
  theme: 'default',
  layoutWidth: 'half',
  layout: 'normal',
  hideBorder: false,
  hideProgress: false,
  langs_count: 5,
  borderRadius: 4.5
}
```

**Configuration Options:**

| Property       | Type    | Options                                                         | Description         |
| -------------- | ------- | --------------------------------------------------------------- | ------------------- |
| `username`     | string  | GitHub username                                                 | GitHub username     |
| `theme`        | string  | Theme name                                                      | Visual theme        |
| `layoutWidth`  | string  | `'half'`, `'full'`                                              | Card width          |
| `layout`       | string  | `'compact'`, `'normal'`, `'donut'`, `'donut-vertical'`, `'pie'` | Layout style        |
| `hideBorder`   | boolean | `true`, `false`                                                 | Hide border         |
| `hideProgress` | boolean | `true`, `false`                                                 | Hide progress bars  |
| `langs_count`  | number  | `1-10`                                                          | Number of languages |
| `borderRadius` | number  | `0-100`                                                         | Border radius       |

---

### Streak Stats

Contribution streak statistics.

**Type:** `streak-stats`

**Icon:** `Flame`

**Default Props:**

```typescript
{
  username: '',
  theme: 'default',
  layoutWidth: 'half',
  hideBorder: false,
  borderRadius: 4.5
}
```

**Configuration Options:**

| Property       | Type    | Description          |
| -------------- | ------- | -------------------- |
| `username`     | string  | GitHub username      |
| `theme`        | string  | Theme name           |
| `layoutWidth`  | string  | `'half'` or `'full'` |
| `hideBorder`   | boolean | Hide border          |
| `borderRadius` | number  | Border radius        |

---

### Activity Graph

30-day contribution line chart.

**Type:** `activity-graph`

**Icon:** `Activity`

**Default Props:**

```typescript
{
  username: '',
  theme: 'default',
  hideBorder: false
}
```

**Configuration Options:**

| Property     | Type    | Description     |
| ------------ | ------- | --------------- |
| `username`   | string  | GitHub username |
| `theme`      | string  | Theme name      |
| `hideBorder` | boolean | Hide border     |

---

### Trophies

GitHub achievement trophies.

**Type:** `trophies`

**Icon:** `Trophy`

**Default Props:**

```typescript
{
  username: '',
  theme: 'default',
  column: 1,
  row: 1,
  margin_w: 4,
  margin_h: 4,
  noFrame: false,
  noBg: false
}
```

**Configuration Options:**

| Property   | Type    | Range  | Description       |
| ---------- | ------- | ------ | ----------------- |
| `username` | string  | -      | GitHub username   |
| `theme`    | string  | -      | Theme name        |
| `column`   | number  | `1-6`  | Number of columns |
| `row`      | number  | `1-3`  | Number of rows    |
| `margin_w` | number  | `0-20` | Horizontal margin |
| `margin_h` | number  | `0-20` | Vertical margin   |
| `noFrame`  | boolean | -      | Remove frame      |
| `noBg`     | boolean | -      | Remove background |

---

## Advanced Blocks

### Visitor Counter

Page view counter badge.

**Type:** `visitor-counter`

**Icon:** `Eye`

**Default Props:**

```typescript
{
  username: '',
  color: 'blue',
  style: 'flat',
  label: 'visitors'
}
```

**Configuration Options:**

| Property   | Type   | Options                                | Description     |
| ---------- | ------ | -------------------------------------- | --------------- |
| `username` | string | -                                      | GitHub username |
| `color`    | string | color name                             | Badge color     |
| `style`    | string | `'flat'`, `'flat-square'`, `'plastic'` | Badge style     |
| `label`    | string | text                                   | Counter label   |

---

### Quote

A quote block with optional random quote from API.

**Type:** `quote`

**Icon:** `Quote`

**Default Props:**

```typescript
{
  quote: '',
  author: '',
  theme: 'default',
  type: 'default'
}
```

**Configuration Options:**

| Property | Type   | Options                                   | Description                         |
| -------- | ------ | ----------------------------------------- | ----------------------------------- |
| `quote`  | string | -                                         | Quote text (leave empty for random) |
| `author` | string | -                                         | Quote author                        |
| `theme`  | string | Theme name                                | Visual theme                        |
| `type`   | string | `'default'`, `'horizontal'`, `'vertical'` | Quote style                         |

---

### Footer Banner

A waving footer banner using capsule-render.

**Type:** `footer-banner`

**Icon:** `Banner`

**Default Props:**

```typescript
{
  text: 'Thanks for visiting!',
  waveColor: '0:6366f1,100:8b5cf6',
  fontColor: 'ffffff',
  height: 100
}
```

**Configuration Options:**

| Property    | Type   | Range    | Description          |
| ----------- | ------ | -------- | -------------------- |
| `text`      | string | -        | Footer text          |
| `waveColor` | string | -        | Wave gradient colors |
| `fontColor` | string | -        | Text color           |
| `height`    | number | `50-200` | Banner height        |

---

## Block Categories Summary

| Category         | Blocks                                                                       |
| ---------------- | ---------------------------------------------------------------------------- |
| **Layout**       | Container, Divider, Spacer                                                   |
| **Hero**         | Capsule Header, Avatar, Greeting, Typing Animation                           |
| **Content**      | Heading, Paragraph, Collapsible, Code Block                                  |
| **Media**        | Image, GIF                                                                   |
| **Social**       | Social Badges, Custom Badge                                                  |
| **Tech Stack**   | Skill Icons                                                                  |
| **GitHub Stats** | Stats Row, Stats Card, Top Languages, Streak Stats, Activity Graph, Trophies |
| **Advanced**     | Visitor Counter, Quote, Footer Banner                                        |
