/* eslint-disable @next/next/no-img-element */

import { resolveFooterBannerColors } from '@/lib/footer-banner-utils';
import { getActivityTheme, getLangTheme, getStatsTheme, getStreakTheme } from '@/lib/themes';
import type { Block } from '@/lib/types';
import { cn } from '@/lib/utils';

// Helper functions to get theme colors with null safety
function getStatsThemeColors(
  themeName: string | undefined,
): ReturnType<typeof getStatsTheme> | undefined {
  if (!themeName) return undefined;
  return getStatsTheme(themeName);
}

function getActivityThemeColors(
  themeName: string | undefined,
): ReturnType<typeof getActivityTheme> | undefined {
  if (!themeName) return undefined;
  return getActivityTheme(themeName);
}

function getLangThemeColors(
  themeName: string | undefined,
): ReturnType<typeof getLangTheme> | undefined {
  if (!themeName) return undefined;
  return getLangTheme(themeName);
}

function getStreakThemeColors(
  themeName: string | undefined,
): ReturnType<typeof getStreakTheme> | undefined {
  if (!themeName) return undefined;
  return getStreakTheme(themeName);
}

/** Mirrors the API route's default corner-radii logic. */
function defaultCapRadii(
  type: string,
  section: string,
  height: number,
): { tl: number; tr: number; br: number; bl: number } {
  const maxR = Math.floor(height / 2);
  if (type === 'rect') return { tl: 8, tr: 8, br: 8, bl: 8 };
  if (type === 'cylinder') return { tl: maxR, tr: maxR, br: maxR, bl: maxR };
  if (type === 'soft') return { tl: 36, tr: 36, br: 36, bl: 36 };
  if (type === 'waving') {
    return section === 'header'
      ? { tl: 0, tr: 0, br: 24, bl: 24 }
      : { tl: 24, tr: 24, br: 0, bl: 0 };
  }
  return { tl: 0, tr: 0, br: 0, bl: 0 };
}

interface BlockPreviewProps {
  block: Block;
  className?: string;
}

export function BlockPreview({ block, className }: BlockPreviewProps) {
  const { type, props } = block;

  const renderPreview = () => {
    switch (type) {
      case 'container': {
        const bgType = (props.bgType as string) ?? 'solid';
        const bgStartColor = (props.bgStartColor as string) ?? 'EEFF00';
        const bgEndColor = (props.bgEndColor as string) ?? 'A82DAA';
        const bgGradientDirection = (props.bgGradientDirection as string) ?? 'horizontal';
        const bgSolidColor = (props.bgSolidColor as string) ?? 'transparent';

        let bgStyle: React.CSSProperties = {};
        if (bgType === 'solid') {
          bgStyle = {
            backgroundColor: bgSolidColor === 'transparent' ? 'transparent' : `#${bgSolidColor}`,
          };
        } else {
          const start = `#${bgStartColor}`;
          const end = `#${bgEndColor}`;
          switch (bgGradientDirection) {
            case 'horizontal':
              bgStyle = { background: `linear-gradient(to right, ${start}, ${end})` };
              break;
            case 'vertical':
              bgStyle = { background: `linear-gradient(to bottom, ${start}, ${end})` };
              break;
            case 'diagonal':
              bgStyle = { background: `linear-gradient(135deg, ${start}, ${end})` };
              break;
            case 'radial':
              bgStyle = { background: `radial-gradient(circle, ${start}, ${end})` };
              break;
            case 'conic':
              bgStyle = { background: `conic-gradient(from 0deg, ${start}, ${end})` };
              break;
            default:
              bgStyle = { background: `linear-gradient(to right, ${start}, ${end})` };
          }
        }

        return (
          <div
            className={cn(
              'text-sm text-muted-foreground italic p-4 rounded-lg border-2 border-dashed',
              className,
            )}
            style={bgType !== 'solid' ? bgStyle : {}}
          >
            Container ({props.alignment as string}, {props.direction as string})
            {bgType !== 'solid' && (
              <span className="ml-2 text-xs">(gradient: {bgGradientDirection})</span>
            )}
            {block.children && block.children.length > 0 && (
              <span className="ml-2 text-xs">({block.children.length} items)</span>
            )}
          </div>
        );
      }

      case 'divider':
        return props.type === 'gif' && props.gifUrl ? (
          <img src={props.gifUrl as string} alt="Divider" className="h-4 w-full object-cover" />
        ) : (
          <hr className="border-t-2 border-border" />
        );

      case 'spacer':
        return (
          <div
            className="bg-muted/50 rounded flex items-center justify-center text-xs text-muted-foreground"
            style={{ height: Math.min(props.height as number, 60) }}
          >
            Spacer ({String(props.height)}px)
          </div>
        );

      case 'capsule-header': {
        const colorValue = props.color as string;
        const bgType = (props.bgType as string) ?? 'gradient';
        const bgAnimation = (props.bgAnimation as string) ?? 'none';
        const capHeight = (props.height as number) ?? 200;
        const capType = (props.type as string) ?? 'waving';
        const capSection = (props.section as string) ?? 'header';

        let bgStartColor = props.bgStartColor ? String(props.bgStartColor) : undefined;
        let bgEndColor = props.bgEndColor ? String(props.bgEndColor) : undefined;
        const bgSolidColor = (props.bgSolidColor as string) ?? 'EEFF00';

        // Parse legacy color format ONLY if modern properties are NOT present
        if ((!bgStartColor || !bgEndColor) && colorValue && colorValue !== 'gradient') {
          const colorParts = colorValue.split(',');
          if (colorParts.length >= 2) {
            const startMatch = colorParts[0].match(/\d+:([0-9a-fA-F]+)/);
            const endMatch = colorParts[1].match(/\d+:([0-9a-fA-F]+)/);
            if (startMatch) bgStartColor = startMatch[1].toUpperCase();
            if (endMatch) bgEndColor = endMatch[1].toUpperCase();
          }
        }

        bgStartColor = bgStartColor ?? 'EEFF00';
        bgEndColor = bgEndColor ?? 'A82DAA';
        const bgGradientDirection = (props.bgGradientDirection as string) ?? 'horizontal';

        // ── Border radius (per-corner) ──────────────────────────────
        const def = defaultCapRadii(capType, capSection, capHeight);
        const tl = props.borderRadiusTL !== undefined ? Number(props.borderRadiusTL) : def.tl;
        const tr = props.borderRadiusTR !== undefined ? Number(props.borderRadiusTR) : def.tr;
        const br = props.borderRadiusBR !== undefined ? Number(props.borderRadiusBR) : def.br;
        const bl = props.borderRadiusBL !== undefined ? Number(props.borderRadiusBL) : def.bl;
        const borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;

        // ── Background style ────────────────────────────────────────
        let bgStyle: React.CSSProperties = {};
        if (bgType === 'solid') {
          const solidColor =
            bgSolidColor === 'transparent'
              ? 'transparent'
              : bgSolidColor.startsWith('#')
                ? bgSolidColor
                : `#${bgSolidColor}`;
          bgStyle = { backgroundColor: solidColor };
        } else {
          const start = `#${bgStartColor}`;
          const end = `#${bgEndColor}`;
          switch (bgGradientDirection) {
            case 'horizontal':
              bgStyle = { backgroundImage: `linear-gradient(to right, ${start}, ${end})` };
              break;
            case 'vertical':
              bgStyle = { backgroundImage: `linear-gradient(to bottom, ${start}, ${end})` };
              break;
            case 'diagonal':
              bgStyle = { backgroundImage: `linear-gradient(135deg, ${start}, ${end})` };
              break;
            case 'radial':
              bgStyle = {
                backgroundImage: `radial-gradient(circle, ${start}, ${end})`,
              };
              break;
            case 'conic':
              bgStyle = { backgroundImage: `conic-gradient(from 0deg, ${start}, ${end})` };
              break;
            default:
              bgStyle = { backgroundImage: `linear-gradient(to right, ${start}, ${end})` };
          }
        }

        let fontSize = 30;
        if (props.fontSize && typeof props.fontSize === 'number' && isFinite(props.fontSize)) {
          fontSize = Math.max(12, Math.min(72, props.fontSize as number));
        }

        const normalizedFontColor =
          typeof props.fontColor === 'string' ? props.fontColor.replace('#', '').trim() : 'ffffff';
        const fontColor = `#${normalizedFontColor || 'ffffff'}`;

        const animationClass =
          bgAnimation !== 'none'
            ? bgAnimation === 'gradient'
              ? 'animate-gradient-flow'
              : bgAnimation === 'pulse'
                ? 'animate-pulse'
                : bgAnimation === 'waving' || bgAnimation === 'wave'
                  ? 'animate-wave'
                  : bgAnimation === 'shimmer'
                    ? 'animate-shimmer'
                    : ''
            : '';

        const animationBgSize =
          animationClass !== ''
            ? {
                backgroundSize: bgAnimation === 'gradient' ? '200% 200%' : '200% 100%',
              }
            : {};

        return (
          <div
            className={`relative rounded-lg flex items-center justify-center w-full overflow-hidden ${animationClass}`}
            style={{
              ...bgStyle,
              ...animationBgSize,
              height: `${capHeight}px`,
              borderRadius,
            }}
          >
            <span
              className="font-bold drop-shadow-md"
              style={{ fontSize: `${fontSize}px`, color: fontColor }}
            >
              {props.text as string}
            </span>
          </div>
        );
      }

      case 'avatar':
        return (
          <div className="flex justify-center">
            <img
              src={props.imageUrl as string}
              alt="Avatar"
              className="object-cover"
              style={{
                width: Math.min(props.size as number, 100),
                height: Math.min(props.size as number, 100),
                borderRadius: `${props.borderRadius}%`,
              }}
            />
          </div>
        );

      case 'greeting':
        return (
          <h2
            className={cn(
              'text-xl font-bold',
              props.alignment === 'center' && 'text-center',
              props.alignment === 'right' && 'text-right',
            )}
          >
            {props.text ? String(props.text) : ''}
            {props.emoji ? <span>{String(props.emoji)}</span> : null}
          </h2>
        );

      case 'typing-animation':
        return (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/50 p-3">
            <span className="text-sm text-muted-foreground">Typing: </span>
            <span className="text-sm font-medium text-primary">{(props.lines as string[])[0]}</span>
            <span className="animate-pulse">|</span>
          </div>
        );

      case 'heading': {
        const level = Number(props.level) || 2;
        const HeadingTag =
          level === 1
            ? 'h1'
            : level === 2
              ? 'h2'
              : level === 3
                ? 'h3'
                : level === 4
                  ? 'h4'
                  : level === 5
                    ? 'h5'
                    : 'h6';
        return (
          <HeadingTag
            className={cn(
              'font-bold',
              props.level === 1 && 'text-2xl',
              props.level === 2 && 'text-xl',
              props.level === 3 && 'text-lg',
              props.alignment === 'center' && 'text-center',
              props.alignment === 'right' && 'text-right',
            )}
          >
            {props.emoji ? <span>{String(props.emoji)} </span> : null}
            {props.text as string}
          </HeadingTag>
        );
      }

      case 'paragraph':
        return (
          <p
            className={cn(
              'text-sm',
              props.alignment === 'center' && 'text-center',
              props.alignment === 'right' && 'text-right',
            )}
          >
            {props.text as string}
          </p>
        );

      case 'collapsible':
        return (
          <details open={Boolean(props.defaultOpen)}>
            <summary className="cursor-pointer font-medium">{props.title as string}</summary>
            <div className="mt-2 pl-4 text-sm text-muted-foreground">
              {block.children && block.children.length > 0
                ? `${block.children.length} nested blocks`
                : 'Add blocks inside...'}
            </div>
          </details>
        );

      case 'code-block':
        return (
          <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto">
            <code>{props.code as string}</code>
          </pre>
        );

      case 'image':
        if (!props.url) return null;
        return (
          <div
            className={cn(
              'flex',
              props.alignment === 'center' && 'justify-center',
              props.alignment === 'right' && 'justify-end',
            )}
          >
            <img
              src={props.url as string}
              alt={props.alt as string}
              className="max-h-40 rounded object-contain"
              style={{
                borderRadius: `${props.borderRadius}px`,
                maxWidth: props.width ? `${props.width}px` : '100%',
              }}
            />
          </div>
        );

      case 'gif':
        if (!props.url) return null;
        return (
          <div
            className={cn(
              'flex',
              props.alignment === 'center' && 'justify-center',
              props.alignment === 'right' && 'justify-end',
            )}
          >
            <img
              src={props.url as string}
              alt={props.alt as string}
              style={{ width: props.width ? `${props.width}px` : 'auto' }}
              className="max-h-20"
            />
          </div>
        );

      case 'social-badges': {
        const badges = [];
        if (props.linkedin) badges.push('LinkedIn');
        if (props.twitter) badges.push('Twitter');
        if (props.github) badges.push('GitHub');
        if (props.email) badges.push('Email');
        if (props.portfolio) badges.push('Portfolio');
        if (props.youtube) badges.push('YouTube');
        if (props.instagram) badges.push('Instagram');
        if (props.discord) badges.push('Discord');

        return (
          <div className="flex flex-wrap gap-2 justify-center">
            {badges.length > 0 ? (
              badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {badge}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground italic">
                Configure social links...
              </span>
            )}
          </div>
        );
      }

      case 'custom-badge':
        return (
          <div className="flex justify-center">
            <span
              className="rounded px-3 py-1 text-xs font-bold text-white"
              style={{ backgroundColor: props.color as string }}
            >
              {props.label as string}: {props.message as string}
            </span>
          </div>
        );

      case 'skill-icons': {
        const icons = props.icons as string[];
        return (
          <div className="flex flex-wrap gap-2 justify-center">
            {icons.slice(0, 8).map((icon) => (
              <span key={icon} className="rounded bg-muted px-2 py-1 text-xs font-medium">
                {icon}
              </span>
            ))}
            {icons.length > 8 && (
              <span className="text-xs text-muted-foreground">+{icons.length - 8} more</span>
            )}
          </div>
        );
      }

      case 'stats-card': {
        const statsTheme = getStatsThemeColors(props.theme as string | undefined);
        return (
          <div className="flex justify-center">
            <div
              className="rounded-lg border p-4 text-center"
              style={{
                borderColor: statsTheme ? `#${statsTheme.border}` : undefined,
                backgroundColor: statsTheme ? `#${statsTheme.bg}` : undefined,
              }}
            >
              <div
                className="text-sm font-medium"
                style={{ color: statsTheme ? `#${statsTheme.title}` : undefined }}
              >
                GitHub Stats
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: statsTheme ? `#${statsTheme.text}` : undefined }}
              >
                @{props.username as string}
              </div>
              <div
                className="text-[10px] mt-1"
                style={{ color: statsTheme ? `#${statsTheme.text}` : undefined }}
              >
                Theme: {props.theme as string}
              </div>
            </div>
          </div>
        );
      }

      case 'stats-row': {
        const rowTheme = getStatsThemeColors(props.theme as string | undefined);
        return (
          <div
            className="rounded-lg border p-3 text-center"
            style={{
              borderColor: rowTheme ? `#${rowTheme.border}` : undefined,
              backgroundColor: rowTheme ? `#${rowTheme.bg}` : undefined,
            }}
          >
            <div
              className="text-sm font-medium"
              style={{ color: rowTheme ? `#${rowTheme.title}` : undefined }}
            >
              Stats Row
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: rowTheme ? `#${rowTheme.text}` : undefined }}
            >
              {String(props.direction ?? 'row')} • {String(props.gap ?? 12)}px gap
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: rowTheme ? `#${rowTheme.text}` : undefined }}
            >
              {block.children?.length ?? 0} child card(s)
            </div>
          </div>
        );
      }

      case 'top-languages': {
        const langTheme = getLangThemeColors(props.theme as string | undefined);
        return (
          <div className="flex justify-center">
            <div
              className="rounded-lg border p-4 text-center"
              style={{
                borderColor: langTheme ? `#${langTheme.border}` : undefined,
                backgroundColor: langTheme ? `#${langTheme.bg}` : undefined,
              }}
            >
              <div
                className="text-sm font-medium"
                style={{ color: langTheme ? `#${langTheme.title}` : undefined }}
              >
                Top Languages
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: langTheme ? `#${langTheme.text}` : undefined }}
              >
                @{props.username as string}
              </div>
              <div
                className="text-[10px] mt-1"
                style={{ color: langTheme ? `#${langTheme.text}` : undefined }}
              >
                Layout: {props.layout as string}
              </div>
            </div>
          </div>
        );
      }

      case 'streak-stats': {
        const streakTheme = getStreakThemeColors(props.theme as string | undefined);
        return (
          <div className="flex justify-center">
            <div
              className="rounded-lg border p-4 text-center"
              style={{
                borderColor: streakTheme ? `#${streakTheme.border}` : undefined,
                backgroundColor: streakTheme ? `#${streakTheme.bg}` : undefined,
              }}
            >
              <div
                className="text-sm font-medium"
                style={{ color: streakTheme ? `#${streakTheme.text}` : undefined }}
              >
                Streak Stats
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: streakTheme ? `#${streakTheme.text}` : undefined }}
              >
                @{props.username as string}
              </div>
            </div>
          </div>
        );
      }

      case 'activity-graph': {
        const activityTheme = getActivityThemeColors(props.theme as string | undefined);
        return (
          <div className="flex justify-center">
            <div
              className="rounded-lg border p-4 text-center w-full"
              style={{
                borderColor: activityTheme ? `#${activityTheme.border}` : undefined,
                backgroundColor: activityTheme ? `#${activityTheme.bg}` : undefined,
              }}
            >
              <div
                className="text-sm font-medium"
                style={{ color: activityTheme ? `#${activityTheme.text}` : undefined }}
              >
                Activity Graph
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: activityTheme ? `#${activityTheme.text}` : undefined }}
              >
                @{props.username as string}
              </div>
              <div className="mt-2 h-8 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded" />
            </div>
          </div>
        );
      }

      case 'trophies': {
        const trophiesTheme = getStatsThemeColors(props.theme as string | undefined);
        return (
          <div className="flex justify-center">
            <div
              className="rounded-lg border p-4 text-center"
              style={{
                borderColor: trophiesTheme ? `#${trophiesTheme.border}` : undefined,
                backgroundColor: trophiesTheme ? `#${trophiesTheme.bg}` : undefined,
              }}
            >
              <div
                className="text-sm font-medium"
                style={{ color: trophiesTheme ? `#${trophiesTheme.title}` : undefined }}
              >
                GitHub Trophies
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: trophiesTheme ? `#${trophiesTheme.text}` : undefined }}
              >
                @{props.username as string}
              </div>
              <div className="flex gap-1 mt-2 justify-center">
                {['🏆', '🥇', '🥈', '🥉'].map((trophy, i) => (
                  <span key={i} className="text-lg">
                    {trophy}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'visitor-counter':
        return (
          <div className="flex justify-center">
            <span className="rounded bg-muted px-3 py-1 text-xs">
              {props.label as string}: 1,234
            </span>
          </div>
        );

      case 'quote':
        return (
          <div className="rounded-lg bg-muted/50 p-4 text-center italic">
            <p className="text-sm">
              {props.quote ? `"${props.quote as string}"` : '"Random inspirational quote..."'}
            </p>
            {props.author ? (
              <p className="text-xs text-muted-foreground mt-1">- {String(props.author)}</p>
            ) : null}
          </div>
        );

      case 'footer-banner': {
        // Determine background settings
        // FIXED: resolveFooterBannerColors() correctly handles both legacy
        // waveColor ("0:EEFF00,100:A82DAA") and modern (bgStartColor / bgEndColor)
        // props.  The old code split on ':' and produced startColor='0' (not a
        // valid hex) and endColor='EEFF00,100' (also invalid).
        const { bgStartColor, bgEndColor } = resolveFooterBannerColors(props);
        const bgType = (props.bgType as string) ?? 'gradient';
        const bgAnimation = (props.bgAnimation as string) ?? 'none';
        const bgSolidColor = (props.bgSolidColor as string) ?? '3B82F6';

        const type = (props.type as string) ?? 'waving';
        const height = Number(props.height) || 80;

        // Apply animation class
        const animationClass =
          bgAnimation !== 'none'
            ? bgAnimation === 'gradient'
              ? 'animate-gradient-flow'
              : bgAnimation === 'pulse'
                ? 'animate-pulse'
                : bgAnimation === 'waving'
                  ? 'animate-wave'
                  : bgAnimation === 'shimmer'
                    ? 'animate-shimmer'
                    : ''
            : '';

        // Add required background size for animations
        const animationBgSize =
          animationClass !== ''
            ? {
                backgroundSize: bgAnimation === 'gradient' ? '200% 200%' : '200% 100%',
              }
            : {};

        // Build gradient style
        const gradientStyle =
          bgType === 'solid'
            ? { backgroundColor: `#${bgSolidColor}` }
            : {
                backgroundImage: `linear-gradient(to right, #${bgStartColor}, #${bgEndColor})`,
                ...animationBgSize,
              };

        // Build border radius - use explicit undefined check to respect explicit 0 values
        // Footer banner always uses rounded bottom corners (matching Capsule Header header styling)
        const heightVal = Number(props.height) || 80;
        const maxR = Math.floor(heightVal / 2);
        const borderRadiusTL =
          props.borderRadiusTL !== undefined ? Math.min(Number(props.borderRadiusTL), maxR) : 0;
        const borderRadiusTR =
          props.borderRadiusTR !== undefined ? Math.min(Number(props.borderRadiusTR), maxR) : 0;
        const borderRadiusBR =
          props.borderRadiusBR !== undefined ? Math.min(Number(props.borderRadiusBR), maxR) : 24;
        const borderRadiusBL =
          props.borderRadiusBL !== undefined ? Math.min(Number(props.borderRadiusBL), maxR) : 24;

        const hasCustomRadius =
          props.borderRadiusTL !== undefined ||
          props.borderRadiusTR !== undefined ||
          props.borderRadiusBR !== undefined ||
          props.borderRadiusBL !== undefined;
        const borderRadiusValue = hasCustomRadius
          ? `${borderRadiusTL}px ${borderRadiusTR}px ${borderRadiusBR}px ${borderRadiusBL}px`
          : type === 'rect'
            ? '8px'
            : type === 'cylinder'
              ? '9999px'
              : type === 'soft'
                ? '36px'
                : type === 'slice'
                  ? '48px 10px 48px 10px'
                  : '0 0 24px 24px';

        return (
          <div
            className={`relative flex items-center justify-center ${animationClass}`}
            style={{
              ...gradientStyle,
              borderRadius: borderRadiusValue,
              height: `${height}px`,
            }}
          >
            <span className="font-medium text-white">{props.text as string}</span>
          </div>
        );
      }

      case 'support-link':
        return (
          <div className="flex items-center justify-center gap-2 py-2">
            {(props.type as string) === 'coffee' ? (
              <span className="text-sm text-muted-foreground">☕ Buy me a coffee</span>
            ) : (
              <span className="text-sm text-muted-foreground">💬 Leave feedback</span>
            )}
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground italic">Unknown block type: {type}</div>
        );
    }
  };

  return <div className={className}>{renderPreview()}</div>;
}
