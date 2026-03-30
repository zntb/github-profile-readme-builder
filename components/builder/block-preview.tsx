/* eslint-disable @next/next/no-img-element */

import type { Block } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BlockPreviewProps {
  block: Block;
  className?: string;
}

export function BlockPreview({ block, className }: BlockPreviewProps) {
  const { type, props } = block;

  const renderPreview = () => {
    switch (type) {
      case 'container':
        return (
          <div className={cn('text-sm text-muted-foreground italic', className)}>
            Container ({props.alignment as string}, {props.direction as string})
            {block.children && block.children.length > 0 && (
              <span className="ml-2 text-xs">({block.children.length} items)</span>
            )}
          </div>
        );

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

      case 'capsule-header':
        return (
          <div className="relative h-20 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="font-bold text-foreground">{props.text as string}</span>
          </div>
        );

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

      case 'heading':
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

      case 'social-badges':
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

      case 'skill-icons':
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

      case 'stats-card':
        return (
          <div className="flex justify-center">
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
              <div className="text-sm font-medium">GitHub Stats</div>
              <div className="text-xs text-muted-foreground mt-1">@{props.username as string}</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                Theme: {props.theme as string}
              </div>
            </div>
          </div>
        );

      case 'stats-row':
        return (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
            <div className="text-sm font-medium">Stats Row</div>
            <div className="text-xs text-muted-foreground mt-1">
              {String(props.direction ?? 'row')} • {String(props.gap ?? 12)}px gap
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {block.children?.length ?? 0} child card(s)
            </div>
          </div>
        );

      case 'top-languages':
        return (
          <div className="flex justify-center">
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
              <div className="text-sm font-medium">Top Languages</div>
              <div className="text-xs text-muted-foreground mt-1">@{props.username as string}</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                Layout: {props.layout as string}
              </div>
            </div>
          </div>
        );

      case 'streak-stats':
        return (
          <div className="flex justify-center">
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
              <div className="text-sm font-medium">Streak Stats</div>
              <div className="text-xs text-muted-foreground mt-1">@{props.username as string}</div>
            </div>
          </div>
        );

      case 'activity-graph':
        return (
          <div className="flex justify-center">
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-center w-full">
              <div className="text-sm font-medium">Activity Graph</div>
              <div className="text-xs text-muted-foreground mt-1">@{props.username as string}</div>
              <div className="mt-2 h-8 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 rounded" />
            </div>
          </div>
        );

      case 'trophies':
        return (
          <div className="flex justify-center">
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
              <div className="text-sm font-medium">GitHub Trophies</div>
              <div className="text-xs text-muted-foreground mt-1">@{props.username as string}</div>
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

      case 'footer-banner':
        return (
          <div className="relative h-16 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="font-medium text-foreground">{props.text as string}</span>
          </div>
        );

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
