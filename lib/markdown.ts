import { useBuilderStore } from './store';
import type { Block } from './types';

// Build internal API URL
function buildInternalUrl(endpoint: string, params: Record<string, unknown>): string {
  const filteredParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      filteredParams[key] = String(value);
    }
  }
  const query = new URLSearchParams(filteredParams);
  return `/api/${endpoint}?${query.toString()}`;
}

// Build external URL for exported markdown
function buildExternalUrl(
  endpoint: string,
  params: Record<string, unknown>,
  origin: string,
): string {
  const filteredParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      filteredParams[key] = String(value);
    }
  }
  const query = new URLSearchParams(filteredParams);
  return `${origin}/api/${endpoint}?${query.toString()}`;
}

// Render a single block to markdown
export function renderBlock(block: Block, origin: string = ''): string {
  const { type, props, children } = block;

  switch (type) {
    case 'container': {
      const childrenMd = children?.map((child) => renderBlock(child, origin)).join('\n') || '';
      const alignment = props.alignment as string;
      if (alignment === 'center') {
        return `<div align="center">\n\n${childrenMd}\n\n</div>`;
      }
      return childrenMd;
    }

    case 'stats-row': {
      const direction = (props.direction as string) || 'row';
      const gap = Number(props.gap ?? 12);
      const cardWidth = (props.cardWidth as string) || '49%';
      const cardHeight = props.cardHeight as string | undefined;
      const statsChildren =
        children?.filter((child) =>
          ['stats-card', 'top-languages', 'streak-stats'].includes(child.type),
        ) || [];

      if (statsChildren.length === 0) return '';

      if (direction === 'column') {
        return `<div align="center">\n\n${statsChildren.map((child) => renderBlock(child, origin)).join('\n\n')}\n\n</div>`;
      }

      const widthStyle = toCssSize(cardWidth) ?? '49%';
      const heightStyle = toCssSize(cardHeight);
      const spacingStyle = `margin-right: ${gap}px;`;
      const images = statsChildren
        .map((child, index) => {
          const imageTag = getHalfWidthCardImageTag(child, origin);
          if (!imageTag) return '';
          const src = imageTag.match(/src="([^"]+)"/)?.[1];
          const alt = imageTag.match(/alt="([^"]+)"/)?.[1] ?? 'GitHub Stats Card';
          if (!src) return '';
          const marginStyle = index < statsChildren.length - 1 ? spacingStyle : '';
          const heightAttr = heightStyle ? ` height="${heightStyle}"` : '';
          return `  <img src="${src}" alt="${alt}" width="${widthStyle}"${heightAttr} style="${marginStyle}" />`;
        })
        .filter(Boolean);

      return `<div align="center">\n${images.join('\n')}\n</div>`;
    }

    case 'divider': {
      if (props.type === 'gif' && props.gifUrl) {
        return `<img src="${props.gifUrl}" width="100%" />`;
      }
      return '---';
    }

    case 'spacer': {
      const height = props.height as number;
      return `<br/>\n`.repeat(Math.ceil(height / 20));
    }

    case 'capsule-header': {
      const {
        text,
        type: headerType,
        height,
        section,
        color,
      } = props as Record<string, string | number>;
      const capsuleUrl = `https://capsule-render.vercel.app/api?type=${headerType}&color=${encodeURIComponent(String(color))}&height=${height}&section=${section}&text=${encodeURIComponent(String(text))}&fontSize=50&animation=fadeIn&fontColor=ffffff`;
      return `<div align="center">\n  <img src="${capsuleUrl}" />\n</div>`;
    }

    case 'avatar': {
      const { imageUrl, size, borderRadius } = props as Record<string, string | number>;
      const style =
        borderRadius === 50 ? 'border-radius: 50%;' : `border-radius: ${borderRadius}px;`;
      return `<div align="center">\n  <img src="${imageUrl}" width="${size}" height="${size}" style="${style}" />\n</div>`;
    }

    case 'greeting': {
      const { text, emoji, alignment } = props as Record<string, string>;
      const emojiStr = emoji ? ` ${emoji}` : '';
      if (alignment === 'center') {
        return `<h1 align="center">${text}${emojiStr}</h1>`;
      }
      return `# ${text}${emojiStr}`;
    }

    case 'typing-animation': {
      const { lines, color, width, height } = props as {
        lines: string[];
        color: string;
        width: number;
        height: number;
      };
      const linesParam = lines.join(';');
      const url = `https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3000&pause=1000&color=${color}&center=true&vCenter=true&width=${width}&height=${height}&lines=${encodeURIComponent(linesParam)}`;
      return `<div align="center">\n  <img src="${url}" alt="Typing SVG" />\n</div>`;
    }

    case 'heading': {
      const { text, level, alignment, emoji } = props as Record<string, string | number>;
      const emojiStr = emoji ? ` ${emoji}` : '';
      const prefix = '#'.repeat(level as number);
      if (alignment === 'center') {
        return `<h${level} align="center">${text}${emojiStr}</h${level}>`;
      }
      return `${prefix} ${text}${emojiStr}`;
    }

    case 'paragraph': {
      const { text, alignment } = props as Record<string, string>;
      if (alignment === 'center') {
        return `<p align="center">${text}</p>`;
      }
      return text;
    }

    case 'collapsible': {
      const { title, defaultOpen } = props as Record<string, string | boolean>;
      const childrenMd = children?.map((child) => renderBlock(child, origin)).join('\n\n') || '';
      const openAttr = defaultOpen ? ' open' : '';
      return `<details${openAttr}>\n<summary>${title}</summary>\n\n${childrenMd}\n\n</details>`;
    }

    case 'code-block': {
      const { code, language } = props as Record<string, string>;
      return `\`\`\`${language}\n${code}\n\`\`\``;
    }

    case 'image': {
      const { url, alt, width, height, alignment, borderRadius } = props as Record<
        string,
        string | number
      >;
      let imgTag = `<img src="${url}" alt="${alt}"`;
      if (width) imgTag += ` width="${width}"`;
      if (height) imgTag += ` height="${height}"`;
      if (borderRadius) imgTag += ` style="border-radius: ${borderRadius}px;"`;
      imgTag += ' />';

      if (alignment === 'center') {
        return `<div align="center">\n  ${imgTag}\n</div>`;
      }
      return imgTag;
    }

    case 'gif': {
      const { url, alt, width, alignment } = props as Record<string, string | number>;
      let imgTag = `<img src="${url}" alt="${alt}"`;
      if (width) imgTag += ` width="${width}"`;
      imgTag += ' />';

      if (alignment === 'center') {
        return `<div align="center">\n  ${imgTag}\n</div>`;
      }
      return imgTag;
    }

    case 'social-badges': {
      const { linkedin, twitter, email, portfolio, github, youtube, instagram, discord, style } =
        props as Record<string, string>;
      const badges: string[] = [];

      if (linkedin) {
        badges.push(
          `[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=${style}&logo=linkedin&logoColor=white)](https://linkedin.com/in/${linkedin})`,
        );
      }
      if (twitter) {
        badges.push(
          `[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=${style}&logo=twitter&logoColor=white)](https://twitter.com/${twitter})`,
        );
      }
      if (github) {
        badges.push(
          `[![GitHub](https://img.shields.io/badge/GitHub-100000?style=${style}&logo=github&logoColor=white)](https://github.com/${github})`,
        );
      }
      if (youtube) {
        badges.push(
          `[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=${style}&logo=youtube&logoColor=white)](https://youtube.com/@${youtube})`,
        );
      }
      if (instagram) {
        badges.push(
          `[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=${style}&logo=instagram&logoColor=white)](https://instagram.com/${instagram})`,
        );
      }
      if (discord) {
        badges.push(
          `[![Discord](https://img.shields.io/badge/Discord-7289DA?style=${style}&logo=discord&logoColor=white)](https://discord.gg/${discord})`,
        );
      }
      if (email) {
        badges.push(
          `[![Email](https://img.shields.io/badge/Email-D14836?style=${style}&logo=gmail&logoColor=white)](mailto:${email})`,
        );
      }
      if (portfolio) {
        badges.push(
          `[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=${style}&logo=About.me&logoColor=white)](${portfolio})`,
        );
      }

      if (badges.length === 0) return '';
      return `<div align="center">\n  ${badges.join(' ')}\n</div>`;
    }

    case 'custom-badge': {
      const { label, message, color, labelColor, style, logo, logoColor } = props as Record<
        string,
        string
      >;
      let url = `https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(message)}-${color}?style=${style}`;
      if (labelColor) url += `&labelColor=${labelColor}`;
      if (logo) url += `&logo=${logo}`;
      if (logoColor) url += `&logoColor=${logoColor}`;
      return `![${label}](${url})`;
    }

    case 'skill-icons': {
      const { icons, perLine, theme } = props as {
        icons: string[];
        perLine: number;
        theme: string;
      };
      const iconsStr = icons.join(',');
      const url = `https://skillicons.dev/icons?i=${iconsStr}&perline=${perLine}&theme=${theme}`;
      return `<div align="center">\n  <img src="${url}" />\n</div>`;
    }

    case 'stats-card': {
      const imageTag = renderStatsCardImageTag(block, origin);
      return `<div align="center">\n  ${imageTag}\n</div>`;
    }

    case 'top-languages': {
      const imageTag = renderTopLanguagesImageTag(block, origin);
      return `<div align="center">\n  ${imageTag}\n</div>`;
    }

    case 'streak-stats': {
      const imageTag = renderStreakStatsImageTag(block, origin);
      return `<div align="center">\n  ${imageTag}\n</div>`;
    }

    case 'activity-graph': {
      const globalUsername = useBuilderStore.getState().username;
      const {
        username: blockUsername,
        theme,
        hideBorder,
        bgColor,
        color,
        lineColor,
        pointColor,
        areaColor,
      } = props as Record<string, unknown>;
      // Use global username if block username is empty or is the default placeholder
      const username =
        (!blockUsername || blockUsername === 'github') && globalUsername
          ? globalUsername
          : blockUsername;
      const params = {
        username,
        theme,
        hide_border: hideBorder ? 'true' : 'false',
        bg_color: bgColor,
        color,
        line: lineColor,
        point: pointColor,
        area_color: areaColor,
      };
      const url = origin
        ? buildExternalUrl('activity', params, origin)
        : buildInternalUrl('activity', params);
      return `<div align="center">\n  <img src="${url}" alt="Activity Graph" />\n</div>`;
    }

    case 'trophies': {
      const globalUsername = useBuilderStore.getState().username;
      const {
        username: blockUsername,
        theme,
        column,
        row,
        margin_w,
        margin_h,
        noFrame,
        noBg,
      } = props as Record<string, unknown>;
      // Use global username if block username is empty or is the default placeholder
      const username =
        (!blockUsername || blockUsername === 'github') && globalUsername
          ? globalUsername
          : blockUsername;
      const params = {
        username,
        theme,
        column,
        row,
        margin_w,
        margin_h,
        no_frame: noFrame ? 'true' : 'false',
        no_bg: noBg ? 'true' : 'false',
      };
      const url = origin
        ? buildExternalUrl('trophies', params, origin)
        : buildInternalUrl('trophies', params);
      return `<div align="center">\n  <img src="${url}" alt="GitHub Trophies" />\n</div>`;
    }

    case 'visitor-counter': {
      const globalUsername = useBuilderStore.getState().username;
      const { username: blockUsername, color, style, label } = props as Record<string, string>;
      // Use global username if block username is empty or is the default placeholder
      const username =
        (!blockUsername || blockUsername === 'github') && globalUsername
          ? globalUsername
          : blockUsername;
      const url = `https://komarev.com/ghpvc/?username=${username}&color=${color}&style=${style}&label=${encodeURIComponent(label)}`;
      return `<div align="center">\n  <img src="${url}" alt="Profile Views" />\n</div>`;
    }

    case 'quote': {
      const { theme, type, quote, author } = props as Record<string, string>;
      if (quote && author) {
        // Custom quote
        return `<div align="center">\n\n> "${quote}"\n> — ${author}\n\n</div>`;
      }
      // Random quote from local API
      const params = {
        type,
        theme,
      };
      const url = origin
        ? buildExternalUrl('quotes', params, origin)
        : buildInternalUrl('quotes', params);
      return `<div align="center">\n  <img src="${url}" alt="Quote" />\n</div>`;
    }

    case 'footer-banner': {
      const { text, waveColor, fontColor, height } = props as Record<string, string | number>;
      const url = `https://capsule-render.vercel.app/api?type=waving&color=${encodeURIComponent(String(waveColor))}&height=${height}&section=footer&text=${encodeURIComponent(String(text))}&fontSize=24&fontColor=${fontColor}`;
      return `<div align="center">\n  <img src="${url}" />\n</div>`;
    }

    case 'support-link': {
      const { type, url, alignment } = props as Record<string, string>;
      const linkUrl =
        url ||
        (type === 'coffee'
          ? 'https://buymeacoffee.com/codetibo'
          : 'https://github.com/zntb/github-profile-maker/issues');
      const align = alignment || 'center';
      if (type === 'coffee') {
        return `<div align="${align}">\n  <a href="${linkUrl}" target="_blank">\n    <img src="https://img.shields.io/badge/Buy%20me%20a%20coffee-%23FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black" alt="Buy me a coffee" />\n  </a>\n</div>`;
      }
      return `<div align="${align}">\n  <a href="${linkUrl}" target="_blank">\n    <img src="https://img.shields.io/badge/Leave%20feedback-%23FF6B6B?style=for-the-badge&logo=github&logoColor=white" alt="Leave feedback" />\n  </a>\n</div>`;
    }

    default:
      return '';
  }
}

function toCssSize(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return `${value}`;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /^[0-9]+$/.test(trimmed) ? trimmed : trimmed;
}

function renderStatsCardImageTag(block: Block, origin: string): string {
  const globalUsername = useBuilderStore.getState().username;
  const {
    username: blockUsername,
    theme,
    layoutStyle,
    showIcons,
    hideBorder,
    hideTitle,
    hideRank,
    bgColor,
    textColor,
    titleColor,
    iconColor,
    borderRadius,
  } = block.props as Record<string, unknown>;
  const username =
    (!blockUsername || blockUsername === 'github') && globalUsername
      ? globalUsername
      : blockUsername;
  const params = {
    username,
    theme,
    // 'layoutStyle' maps to the API's 'layout' param ('standard' | 'compact')
    layout: (layoutStyle as string | undefined) ?? 'standard',
    show_icons: showIcons ? 'true' : 'false',
    hide_border: hideBorder ? 'true' : 'false',
    hide_title: hideTitle ? 'true' : 'false',
    hide_rank: hideRank ? 'true' : 'false',
    bg_color: bgColor,
    text_color: textColor,
    title_color: titleColor,
    icon_color: iconColor,
    border_radius: borderRadius,
  };
  const url = origin
    ? buildExternalUrl('stats', params, origin)
    : buildInternalUrl('stats', params);
  return `<img src="${url}" alt="GitHub Stats" />`;
}

function renderTopLanguagesImageTag(block: Block, origin: string): string {
  const globalUsername = useBuilderStore.getState().username;
  const {
    username: blockUsername,
    theme,
    layout,
    hideBorder,
    hideProgress,
    langs_count,
    bgColor,
    textColor,
    titleColor,
    borderRadius,
  } = block.props as Record<string, unknown>;
  const username =
    (!blockUsername || blockUsername === 'github') && globalUsername
      ? globalUsername
      : blockUsername;
  const params = {
    username,
    theme,
    layout,
    hide_border: hideBorder ? 'true' : 'false',
    hide_progress: hideProgress ? 'true' : 'false',
    langs_count,
    bg_color: bgColor,
    text_color: textColor,
    title_color: titleColor,
    border_radius: borderRadius,
  };
  const url = origin
    ? buildExternalUrl('top-langs', params, origin)
    : buildInternalUrl('top-langs', params);
  return `<img src="${url}" alt="Top Languages" />`;
}

function renderStreakStatsImageTag(block: Block, origin: string): string {
  const globalUsername = useBuilderStore.getState().username;
  const {
    username: blockUsername,
    theme,
    hideBorder,
    borderRadius,
    bgColor,
    fireColor,
    ringColor,
    currStreakColor,
    sideNumColor,
    sideLabelColor,
    datesColor,
  } = block.props as Record<string, unknown>;
  const username =
    (!blockUsername || blockUsername === 'github') && globalUsername
      ? globalUsername
      : blockUsername;
  const params = {
    username,
    theme,
    hide_border: hideBorder ? 'true' : 'false',
    border_radius: borderRadius,
    background: bgColor,
    fire: fireColor,
    ring: ringColor,
    currStreakNum: currStreakColor,
    sideNums: sideNumColor,
    sideLabels: sideLabelColor,
    dates: datesColor,
  };
  const url = origin
    ? buildExternalUrl('streak', params, origin)
    : buildInternalUrl('streak', params);
  return `<img src="${url}" alt="GitHub Streak" />`;
}

function isHalfWidthCard(block: Block): boolean {
  const layoutWidth = block.props.layoutWidth as string | undefined;
  if (layoutWidth === 'half') return true;
  if (layoutWidth === 'full') return false;
  // Default to full width (100%) for all card types
  return false;
}

function getHalfWidthCardImageTag(block: Block, origin: string): string | null {
  switch (block.type) {
    case 'stats-card':
      return renderStatsCardImageTag(block, origin);
    case 'top-languages':
      return renderTopLanguagesImageTag(block, origin);
    case 'streak-stats':
      return renderStreakStatsImageTag(block, origin);
    default:
      return null;
  }
}

// Render all blocks to markdown
export function renderMarkdown(blocks: Block[], origin: string = ''): string {
  const rendered: string[] = [];

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];

    const imageTag = getHalfWidthCardImageTag(block, origin);
    if (imageTag && isHalfWidthCard(block)) {
      const nextBlock = blocks[i + 1];
      const nextImageTag =
        nextBlock && isHalfWidthCard(nextBlock)
          ? getHalfWidthCardImageTag(nextBlock, origin)
          : null;
      if (nextImageTag) {
        // Determine alt text based on block types
        const getAltText = (blockType: string, isSecond: boolean = false): string => {
          if (blockType === 'stats-card') return 'GitHub Stats';
          if (blockType === 'top-languages') return isSecond ? 'Top Languages' : 'Top Languages';
          if (blockType === 'streak-stats') return 'GitHub Streak';
          return 'Stats';
        };

        // Get individual card widths from props, default to 50%
        const firstWidthRaw = block.props.width;
        const secondWidthRaw = nextBlock.props.width;

        const firstWidth =
          typeof firstWidthRaw === 'string' && firstWidthRaw.trim() !== ''
            ? firstWidthRaw.trim()
            : '50%';
        const secondWidth =
          typeof secondWidthRaw === 'string' && secondWidthRaw.trim() !== ''
            ? secondWidthRaw.trim()
            : '50%';

        // Get cardHeight from block props
        const cardHeight = block.props.cardHeight || nextBlock.props.cardHeight;

        rendered.push(
          `<div align="center">\n  <img src="${imageTag.match(/src="([^"]+)"/)?.[1]}" width="${firstWidth}" alt="${getAltText(block.type)}"${cardHeight ? ` height="${cardHeight}"` : ''} />\n  <img src="${nextImageTag.match(/src="([^"]+)"/)?.[1]}" width="${secondWidth}" alt="${getAltText(nextBlock.type, true)}"${cardHeight ? ` height="${cardHeight}"` : ''} />\n</div>`,
        );
        i += 1;
        continue;
      }
    }

    rendered.push(renderBlock(block, origin));
  }

  return rendered.join('\n\n');
}

// Download markdown file
export function downloadMarkdown(content: string, filename: string = 'README.md'): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
