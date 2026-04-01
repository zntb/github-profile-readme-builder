# Themes Guide

This document provides detailed information about all themes available in the GitHub Profile Maker for customizing the appearance of GitHub stats cards.

## Table of Contents

- [Overview](#overview)
- [Available Themes](#available-themes)
- [Theme Categories](#theme-categories)
- [Using Themes](#using-themes)
- [Custom Theme Builder](#custom-theme-builder)
- [Customizing Colors](#customizing-colors)
- [Theme Preview](#theme-preview)

---

## Overview

The GitHub Profile Maker supports **65+ themes** for stats cards, including popular color schemes like Tokyo Night, Dracula, Nord, Catppuccin, and many more.

Additionally, you can create **fully custom themes** with your own color palette to match your personal or professional branding.

Themes are defined in [`lib/themes.ts`](../../lib/themes.ts) and can be used with the following blocks:

- Stats Card
- Top Languages
- Streak Stats
- Activity Graph
- Trophies

---

## Available Themes

### Popular Themes

| Theme Name    | Description                | Preview Colors      |
| ------------- | -------------------------- | ------------------- |
| `default`     | Default GitHub light theme | Blue accents        |
| `dark`        | Dark theme                 | White/green accents |
| `radical`     | Radical neon theme         | Pink/cyan neon      |
| `tokyonight`  | Tokyo Night                | Blue/purple/cyan    |
| `dracula`     | Dracula                    | Pink/purple/cyan    |
| `onedark`     | One Dark                   | Gold/green/gray     |
| `nord`        | Nord                       | Blue/gray/cyan      |
| `github_dark` | GitHub Dark                | Blue/gray           |

### Catppuccin Themes

| Theme Name         | Description              |
| ------------------ | ------------------------ |
| `catppuccin_latte` | Catppuccin Latte (Light) |
| `catppuccin_mocha` | Catppuccin Mocha (Dark)  |

### Rose Pine Themes

| Theme Name       | Description    |
| ---------------- | -------------- |
| `rose_pine`      | Rose Pine      |
| `rose_pine_dawn` | Rose Pine Dawn |
| `rose_pine_moon` | Rose Pine Moon |

---

## Theme Categories

### Dark Themes

| Theme              | Background | Text Color | Accent |
| ------------------ | ---------- | ---------- | ------ |
| `dark`             | `#151515`  | `#9f9f9f`  | Green  |
| `tokyonight`       | `#1a1b27`  | `#38bdae`  | Purple |
| `dracula`          | `#282a36`  | `#f8f8f2`  | Pink   |
| `onedark`          | `#282c34`  | `#abb2bf`  | Gold   |
| `nord`             | `#2e3440`  | `#d8dee9`  | Blue   |
| `github_dark`      | `#0d1117`  | `#c9d1d9`  | Blue   |
| `catppuccin_mocha` | `#1e1e2e`  | `#cdd6f4`  | Blue   |
| `rose_pine`        | `#191724`  | `#e0def4`  | Gold   |

### Light Themes

| Theme              | Background | Text Color | Accent |
| ------------------ | ---------- | ---------- | ------ |
| `default`          | `#fffefe`  | `#434d58`  | Blue   |
| `catppuccin_latte` | `#eff1f5`  | `#4c4f69`  | Blue   |
| `gruvbox`          | `#282828`  | `#ebdbb2`  | Yellow |
| `solarized-light`  | `#fdf6e3`  | `#657b83`  | Orange |

### Colorful Themes

| Theme             | Description                         |
| ----------------- | ----------------------------------- |
| `radical`         | Neon pink, cyan, and yellow on dark |
| `merko`           | Green and teal on black             |
| `synthwave`       | Neon purple and pink                |
| `outrun`          | Retro synthwave style               |
| `midnight-purple` | Deep purple with blue accents       |

---

## Using Themes

### Via the Builder UI

1. Select a stats block (Stats Card, Top Languages, Streak Stats, etc.)
2. In the Configuration Panel, find the **Theme** dropdown
3. Choose your preferred theme
4. The preview updates in real-time

### Via Custom Theme Builder

1. Select a stats block
2. In the **Theme** dropdown, select **Custom Theme...**
3. Click **Create Custom** to open the Custom Theme Builder
4. Use the color pickers to set your desired colors:
   - **Background** - Card background color
   - **Border** - Card border color
   - **Title** - Section titles and headers
   - **Text** - Body text color
   - **Icon** - Icon color
5. Click **Apply Theme** to save your custom theme

### Via API/URL

Add the `theme` parameter to the API URL:

```markdown
![Stats](https://github-profile-maker.vercel.app/api/stats?username=yourname&theme=dracula)
![Languages](https://github-profile-maker.vercel.app/api/top-langs?username=yourname&theme=tokyonight)
![Streak](https://github-profile-maker.vercel.app/api/streak?username=yourname&theme=nord)
```

### Example: Complete Profile with Theme

```markdown
# My GitHub Profile

## 📊 Stats

![Stats](https://github-profile-maker.vercel.app/api/stats?username=yourname&theme=dracula&show_icons=true)

## 🌍 Top Languages

![Languages](https://github-profile-maker.vercel.app/api/top-langs?username=yourname&theme=dracula&layout=donut)

## 🔥 Streak

![Streak](https://github-profile-maker.vercel.app/api/streak?username=yourname&theme=dracula)

## 📈 Activity

![Activity](https://github-profile-maker.vercel.app/api/activity?username=yourname&theme=dracula)

## 🏆 Trophies

![Trophies](https://github-profile-maker.vercel.app/api/trophies?username=yourname&theme=dracula&column=3)
```

---

## Custom Theme Builder

The Custom Theme Builder allows you to create personalized themes that match your branding. This feature is accessible from the theme dropdown in any stats block configuration.

### Features

- **Visual Color Picker**: Click to select colors with live preview
- **Real-time Preview**: See your theme applied instantly in the preview card
- **Reset to Default**: Easily start over with the reset button
- **Applies to All Stats**: Custom themes work across Stats Card, Top Languages, Streak Stats, Activity Graph, and Trophies

### Creating a Custom Theme

1. Navigate to any stats block (Stats Card, Top Languages, etc.)
2. Open the Configuration Panel
3. Find the **Theme** dropdown
4. Select **Custom Theme...** from the list
5. Click the **Create Custom** button
6. Customize each color:
   - Background color
   - Border color
   - Title color
   - Text color
   - Icon color
7. Click **Apply Theme** to save

### Using Custom Themes via URL

Custom themes can also be applied via URL by encoding your color choices:

```markdown
![Custom Stats](https://github-profile-maker.vercel.app/api/stats?username=yourname&theme=custom:1a1b27_70a5fd_c9d1d9_bf91f3_30363d)
```

The custom theme format is: `custom:BG_TITLE_TEXT_ICON_BORDER`

| Parameter | Position | Description      |
| --------- | -------- | ---------------- |
| BG        | 1st      | Background color |
| TITLE     | 2nd      | Title color      |
| TEXT      | 3rd      | Text color       |
| ICON      | 4th      | Icon color       |
| BORDER    | 5th      | Border color     |

All colors should be 6-character hex codes without the `#` prefix.

### Example: Brand-Aligned Custom Theme

For a professional blue-themed profile:

```markdown
![Brand Theme](https://github-profile-maker.vercel.app/api/stats?username=yourname&theme=custom:0d1117_58a6ff_c9d1d9_1f6feb_30363d)
```

This creates a GitHub Dark-inspired theme that can be customized further.

---

## Customizing Colors

In addition to using preset themes, you can customize individual colors for stats cards.

### Available Color Parameters

| Parameter       | Description      | Format          |
| --------------- | ---------------- | --------------- |
| `bg_color`      | Background color | Hex (without #) |
| `text_color`    | Text color       | Hex (without #) |
| `title_color`   | Title color      | Hex (without #) |
| `icon_color`    | Icon color       | Hex (without #) |
| `border_radius` | Border radius    | Number (0-100)  |

### Example: Custom Colors

```markdown
![Custom Stats](https://github-profile-maker.vercel.app/api/stats?username=yourname&bg_color=1a1b27&text_color=ffffff&title_color=70a5fd&icon_color=bf91f3&border_radius=10)
```

### Streak-Specific Colors

| Parameter         | Description                 |
| ----------------- | --------------------------- |
| `fire_color`      | Fire icon color             |
| `ring_color`      | Ring color                  |
| `currStreakColor` | Current streak number color |
| `sideNumColor`    | Side numbers color          |
| `sideLabelColor`  | Side labels color           |
| `datesColor`      | Dates color                 |

### Example: Custom Streak Colors

```markdown
![Custom Streak](https://github-profile-maker.vercel.app/api/streak?username=yourname&fire_color=ff6e96&ring_color=bd93f9&currStreakColor=ff6e96)
```

### Activity Graph Colors

| Parameter    | Description     |
| ------------ | --------------- |
| `color`      | Main color      |
| `line`       | Line color      |
| `point`      | Point color     |
| `area_color` | Area fill color |

---

## Theme Preview

### Dark Theme Preview

```markdown
![Stats](https://github-profile-maker.vercel.app/api/stats?username=anuraghazra&theme=dark)
```

Renders a dark background card with white/green accents.

### Dracula Theme Preview

```markdown
![Stats](https://github-profile-maker.vercel.app/api/stats?username=anuraghazra&theme=dracula)
```

Renders a dark purple background with pink/purple accents.

### Tokyo Night Theme Preview

```markdown
![Stats](https://github-profile-maker.vercel.app/api/stats?username=anuraghazra&theme=tokyonight)
```

Renders a deep blue background with cyan/purple accents.

### Nord Theme Preview

```markdown
![Stats](https://github-profile-maker.vercel.app/api/stats?username=anuraghazra&theme=nord)
```

Renders a cool gray/blue background with blue/cyan accents.

### Top Languages with Different Layouts

#### Donut Layout

```markdown
![Languages](https://github-profile-maker.vercel.app/api/top-langs?username=yourname&theme=dracula&layout=donut)
```

#### Pie Layout

```markdown
![Languages](https://github-profile-maker.vercel.app/api/top-langs?username=yourname&theme=tokyonight&layout=pie)
```

#### Compact Layout

```markdown
![Languages](https://github-profile-maker.vercel.app/api/top-langs?username=yourname&theme=nord&layout=compact)
```

---

## Theme Selection Tips

### For Light GitHub Themes

Use light backgrounds that match GitHub's default theme:

- `default`
- `catppuccin_latte`

### For Dark GitHub Themes

Use dark backgrounds that match GitHub's dark mode:

- `github_dark`
- `dark`
- `tokyonight`
- `dracula`

### For High Contrast

Choose themes with high contrast for readability:

- `radical`
- `onedark`
- `nord`

### For Minimalist Profiles

Use subtle themes:

- `gruvbox`
- `merko`
- `rose_pine`

### For Brand-Consistent Profiles

Use the **Custom Theme Builder** to create themes that match your personal or company branding:

1. Open any stats block configuration
2. Select **Custom Theme...** from the theme dropdown
3. Use the color picker to match your brand colors
4. Apply and preview instantly

---

## All Available Themes

Full list of supported themes (65+):

```
default, dark, radical, merko, gruvbox, tokyonight, onedark,
cobalt, synthwave, highcontrast, high-contrast, dracula,
prussian, monokai, vue, vue-dark, shades-of-purple, nightowl,
buefy, blue-green, algolia, great-gatsby, darcula, bear,
solarized-dark, solarized-light, chartreuse-dark, nord, gotham,
material-palenight, graywhite, vision-friendly-dark, ayu-mirage,
midnight-purple, calm, flag-india, omni, react, jolly,
maroongold, yeblu, blueberry, slateorange, kacho_ga, outrun,
ocean_dark, city_lights, github_dark, github-dark, github,
react-dark, discord_old_blurple, aura_dark, panda, noctis_minimus,
cobalt2, swift, aura, apprentice, moltack, codeSTACKr,
rose_pine, catppuccin_latte, catppuccin_mocha
```

Plus **custom themes** created via the Custom Theme Builder!

---

## Related Documentation

- [Getting Started](../GETTING_STARTED.md)
- [API Reference](../API_REFERENCE.md)
- [Block Reference](../BLOCKS_REFERENCE.md)
