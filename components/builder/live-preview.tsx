/* eslint-disable @next/next/no-img-element */
'use client';

import { Eye } from 'lucide-react';
import { JSX, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import { useBuilderStore } from '@/lib/store';
import type { Block } from '@/lib/types';

interface LivePreviewProps {
  blocks: Block[];
}

function isHalfWidthGithubCard(block: Block): boolean {
  if (!['stats-card', 'top-languages', 'streak-stats'].includes(block.type)) return false;
  const layoutWidth = block.props.layoutWidth as string | undefined;
  if (layoutWidth === 'half') return true;
  if (layoutWidth === 'full') return false;
  // Default to full width (100%) for all card types
  return false;
}

// Inline SVG stats card component that fetches and renders SVG directly
// Using key to force remount when params change - avoids setState in effect for resetting
function StatsCardInline({ params, style }: { params: string; style?: CSSProperties }) {
  // Force remount when params change to reset state naturally
  return <StatsCardInlineCore key={params} params={params} style={style} />;
}

// Core component that actually renders the content
function StatsCardInlineCore({ params, style }: { params: string; style?: CSSProperties }) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const mountedRef = useRef(true);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/stats?${params}`, { signal: controller.signal })
      .then((res) => res.text())
      .then((svg) => {
        if (mountedRef.current) {
          setSvgContent(svg);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError' || !mountedRef.current) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      mountedRef.current = false;
      controller.abort();
    };
  }, [params]);

  useEffect(() => {
    const svg = svgContainerRef.current?.querySelector('svg');
    if (!svg) return;

    svg.setAttribute('width', '100%');
    svg.removeAttribute('height');
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.maxWidth = '100%';
  }, [svgContent]);

  if (loading) {
    return <div className="text-center p-4 text-muted-foreground">Loading...</div>;
  }
  if (error || !svgContent) {
    return (
      <div className="text-center p-4 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
        <p className="text-muted-foreground text-sm">Failed to load stats</p>
      </div>
    );
  }

  const hasExplicitWidth = Boolean(style?.width || style?.maxWidth);
  const containerStyle: CSSProperties = {
    ...style,
    display: 'inline-block',
    width: hasExplicitWidth ? style?.width : undefined,
    maxWidth: hasExplicitWidth ? style?.maxWidth : undefined,
  };

  return (
    <div className="text-center" style={containerStyle}>
      <div
        ref={svgContainerRef}
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{ width: hasExplicitWidth ? '100%' : undefined, height: 'auto' }}
      />
    </div>
  );
}

export function LivePreview({ blocks }: LivePreviewProps) {
  if (blocks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 sm:p-8 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
        </div>
        <div className="relative text-center animate-in">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground">Add blocks to see a live preview of your README</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="p-3 sm:p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-3 sm:p-6 shadow-lg shadow-muted/10 github-preview">
          {(() => {
            const items: JSX.Element[] = [];
            for (let i = 0; i < blocks.length; i += 1) {
              const block = blocks[i];
              const nextBlock = blocks[i + 1];

              if (isHalfWidthGithubCard(block) && nextBlock && isHalfWidthGithubCard(nextBlock)) {
                items.push(
                  <div
                    key={`${block.id}-${nextBlock.id}`}
                    className="mb-4 flex flex-wrap items-start justify-center gap-2 animate-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <PreviewBlock block={block} wrapperClassName="mb-0" />
                    <PreviewBlock block={nextBlock} wrapperClassName="mb-0" />
                  </div>,
                );
                i += 1;
                continue;
              }

              items.push(
                <div
                  key={block.id}
                  className="animate-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <PreviewBlock block={block} />
                </div>,
              );
            }
            return items;
          })()}
        </div>
      </div>
    </div>
  );
}

function resolvePreviewImageSize(block: Block): CSSProperties {
  const width = block.props.cardWidth as string | number | undefined;
  const height = block.props.cardHeight as string | number | undefined;
  const fallbackWidth = isHalfWidthGithubCard(block) ? '48%' : undefined;
  const widthValue = width ?? fallbackWidth;

  const toCssSize = (value?: string | number) => {
    if (value === undefined) return undefined;
    if (typeof value === 'number') return `${value}px`;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return /^[0-9]+$/.test(trimmed) ? `${trimmed}px` : trimmed;
  };

  return {
    width: toCssSize(widthValue),
    height: toCssSize(height),
  };
}

function PreviewBlock({
  block,
  wrapperClassName = 'mb-4',
  imageStyleOverride,
}: {
  block: Block;
  wrapperClassName?: string;
  imageStyleOverride?: CSSProperties;
}) {
  const { type, props, children } = block;
  const globalUsername = useBuilderStore((state) => state.username);
  const imageSizeStyle = imageStyleOverride ?? resolvePreviewImageSize(block);

  const renderBlock = useMemo(() => {
    // Helper function to get username with global fallback
    const getUsername = (blockUsername: string) => {
      return (!blockUsername || blockUsername === 'github') && globalUsername
        ? globalUsername
        : blockUsername;
    };

    switch (type) {
      case 'container':
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: props.direction as 'row' | 'column',
              alignItems:
                props.alignment === 'center'
                  ? 'center'
                  : props.alignment === 'right'
                    ? 'flex-end'
                    : 'flex-start',
              gap: `${props.gap}px`,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {children?.map((child) => (
              <PreviewBlock key={child.id} block={child} />
            ))}
          </div>
        );

      case 'stats-row': {
        const direction = (props.direction as 'row' | 'column') ?? 'row';
        const gap = Number(props.gap ?? 12);
        const cardWidth = (props.cardWidth as string) || '48%';
        const cardHeight = props.cardHeight as string | undefined;
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: direction,
              gap: `${gap}px`,
              justifyContent: 'center',
              alignItems: direction === 'row' ? 'stretch' : 'center',
              width: '100%',
            }}
          >
            {children?.map((child) => (
              <div
                key={child.id}
                style={{
                  width: direction === 'row' ? cardWidth : '100%',
                  maxWidth: '100%',
                }}
              >
                <PreviewBlock
                  block={child}
                  wrapperClassName="mb-0"
                  imageStyleOverride={{
                    width: '100%',
                    maxWidth: '100%',
                    height: cardHeight,
                  }}
                />
              </div>
            ))}
          </div>
        );
      }

      case 'divider':
        return props.type === 'gif' && props.gifUrl ? (
          <img src={props.gifUrl as string} alt="Divider" className="w-full h-auto" />
        ) : (
          <hr className="my-4" />
        );

      case 'spacer':
        return <div style={{ height: `${props.height}px` }} />;

      case 'capsule-header':
        const capsuleUrl = `https://capsule-render.vercel.app/api?type=${props.type}&color=${encodeURIComponent(String(props.color))}&height=${props.height}&section=${props.section}&text=${encodeURIComponent(String(props.text))}&fontSize=50&animation=fadeIn&fontColor=ffffff`;
        return (
          <div className="text-center">
            <img src={capsuleUrl} alt="Header" className="w-full" />
          </div>
        );

      case 'avatar':
        return (
          <div className="text-center">
            <img
              src={props.imageUrl as string}
              alt="Avatar"
              style={{
                width: `${props.size}px`,
                height: `${props.size}px`,
                borderRadius: `${props.borderRadius}%`,
                display: 'inline-block',
              }}
            />
          </div>
        );

      case 'greeting':
        return (
          <h1
            style={{
              textAlign: props.alignment as 'left' | 'center' | 'right',
              marginBottom: '1rem',
            }}
          >
            {props.text as string}{' '}
            {Boolean(props.emoji) ? <span>{props.emoji as string}</span> : null}
          </h1>
        );

      case 'typing-animation':
        const lines = props.lines as string[];
        const typingUrl = `https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3000&pause=1000&color=${props.color}&center=true&vCenter=true&width=${props.width}&height=${props.height}&lines=${encodeURIComponent(lines.join(';'))}`;
        return (
          <div className="text-center">
            <img src={typingUrl} alt="Typing Animation" />
          </div>
        );

      case 'heading':
        const HeadingTag = `h${props.level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag style={{ textAlign: props.alignment as 'left' | 'center' | 'right' }}>
            {Boolean(props.emoji) ? <span>{props.emoji as string} </span> : null}
            {props.text as string}
          </HeadingTag>
        );

      case 'paragraph':
        return (
          <p style={{ textAlign: props.alignment as 'left' | 'center' | 'right' }}>
            {props.text as string}
          </p>
        );

      case 'collapsible':
        return (
          <details open={Boolean(props.defaultOpen)}>
            <summary>{props.title as string}</summary>
            <div className="pl-4 mt-2">
              {children?.map((child) => (
                <PreviewBlock key={child.id} block={child} />
              ))}
            </div>
          </details>
        );

      case 'code-block':
        return (
          <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
            <code>{props.code as string}</code>
          </pre>
        );

      case 'image':
        return (
          <div
            style={{
              textAlign: props.alignment as 'left' | 'center' | 'right',
            }}
          >
            <img
              src={props.url as string}
              alt={props.alt as string}
              style={{
                maxWidth: '100%',
                width: props.width ? `${props.width}px` : 'auto',
                height: props.height ? `${props.height}px` : 'auto',
                borderRadius: `${props.borderRadius}px`,
                display: 'inline-block',
              }}
            />
          </div>
        );

      case 'gif':
        return (
          <div style={{ textAlign: props.alignment as 'left' | 'center' | 'right' }}>
            <img
              src={props.url as string}
              alt={props.alt as string}
              style={{ width: props.width ? `${props.width}px` : 'auto' }}
            />
          </div>
        );

      case 'social-badges':
        const badges: JSX.Element[] = [];
        const style = props.style as string;

        if (props.linkedin) {
          badges.push(
            <a
              key="linkedin"
              href={`https://linkedin.com/in/${props.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://img.shields.io/badge/LinkedIn-0077B5?style=${style}&logo=linkedin&logoColor=white`}
                alt="LinkedIn"
              />
            </a>,
          );
        }
        if (props.twitter) {
          badges.push(
            <a
              key="twitter"
              href={`https://twitter.com/${props.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://img.shields.io/badge/Twitter-1DA1F2?style=${style}&logo=twitter&logoColor=white`}
                alt="Twitter"
              />
            </a>,
          );
        }
        if (props.github) {
          badges.push(
            <a
              key="github"
              href={`https://github.com/${props.github}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://img.shields.io/badge/GitHub-100000?style=${style}&logo=github&logoColor=white`}
                alt="GitHub"
              />
            </a>,
          );
        }
        if (props.youtube) {
          badges.push(
            <a
              key="youtube"
              href={`https://youtube.com/@${props.youtube}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://img.shields.io/badge/YouTube-FF0000?style=${style}&logo=youtube&logoColor=white`}
                alt="YouTube"
              />
            </a>,
          );
        }
        if (props.instagram) {
          badges.push(
            <a
              key="instagram"
              href={`https://instagram.com/${props.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://img.shields.io/badge/Instagram-E4405F?style=${style}&logo=instagram&logoColor=white`}
                alt="Instagram"
              />
            </a>,
          );
        }
        if (props.discord) {
          badges.push(
            <a
              key="discord"
              href={`https://discord.gg/${props.discord}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://img.shields.io/badge/Discord-7289DA?style=${style}&logo=discord&logoColor=white`}
                alt="Discord"
              />
            </a>,
          );
        }
        if (props.email) {
          badges.push(
            <a key="email" href={`mailto:${props.email}`}>
              <img
                src={`https://img.shields.io/badge/Email-D14836?style=${style}&logo=gmail&logoColor=white`}
                alt="Email"
              />
            </a>,
          );
        }
        if (props.portfolio) {
          badges.push(
            <a
              key="portfolio"
              href={props.portfolio as string}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://img.shields.io/badge/Portfolio-000000?style=${style}&logo=About.me&logoColor=white`}
                alt="Portfolio"
              />
            </a>,
          );
        }

        return badges.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">{badges}</div>
        ) : null;

      case 'custom-badge':
        const badgeUrl = `https://img.shields.io/badge/${encodeURIComponent(props.label as string)}-${encodeURIComponent(props.message as string)}-${props.color}?style=${props.style}${props.logo ? `&logo=${props.logo}` : ''}`;
        return (
          <div className="text-center">
            <img src={badgeUrl} alt={`${props.label}: ${props.message}`} />
          </div>
        );

      case 'skill-icons':
        const icons = props.icons as string[];
        const skillUrl = `https://skillicons.dev/icons?i=${icons.join(',')}&perline=${props.perLine}&theme=${props.theme}`;
        return (
          <div className="text-center">
            <img src={skillUrl} alt="Skills" />
          </div>
        );

      case 'stats-card': {
        // Forward layoutStyle → layout query param ('standard' | 'compact')
        const layoutStyle = (props.layoutStyle as string | undefined) ?? 'standard';
        const statsParams = new URLSearchParams({
          username: getUsername(props.username as string),
          theme: props.theme as string,
          layout: layoutStyle,
          show_icons: props.showIcons ? 'true' : 'false',
          hide_border: props.hideBorder ? 'true' : 'false',
          hide_title: props.hideTitle ? 'true' : 'false',
          hide_rank: props.hideRank ? 'true' : 'false',
          border_radius: String(props.borderRadius),
        });
        const username = getUsername(props.username as string);
        if (!username || username === 'github') {
          return (
            <div className="text-center p-4 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
              <p className="text-muted-foreground text-sm">Enter a GitHub username to see stats</p>
            </div>
          );
        }
        // Use fetch to get SVG content and render inline
        return (
          <div className="text-center">
            <StatsCardInline params={statsParams.toString()} style={imageSizeStyle} />
          </div>
        );
      }

      case 'top-languages':
        const langsParams = new URLSearchParams({
          username: getUsername(props.username as string),
          theme: props.theme as string,
          layout: props.layout as string,
          hide_border: props.hideBorder ? 'true' : 'false',
          hide_progress: props.hideProgress ? 'true' : 'false',
          langs_count: String(props.langs_count),
          border_radius: String(props.borderRadius),
        });
        return (
          <div className="text-center">
            <img
              src={`/api/top-langs?${langsParams.toString()}`}
              alt="Top Languages"
              style={imageSizeStyle}
            />
          </div>
        );

      case 'streak-stats':
        const streakParams = new URLSearchParams({
          username: getUsername(props.username as string),
          theme: props.theme as string,
          hide_border: props.hideBorder ? 'true' : 'false',
          border_radius: String(props.borderRadius),
        });
        return (
          <div className="text-center">
            <img
              src={`/api/streak?${streakParams.toString()}`}
              alt="GitHub Streak"
              style={imageSizeStyle}
            />
          </div>
        );

      case 'activity-graph':
        const activityParams = new URLSearchParams({
          username: getUsername(props.username as string),
          theme: props.theme as string,
          hide_border: props.hideBorder ? 'true' : 'false',
        });
        return (
          <div className="text-center">
            <img
              src={`/api/activity?${activityParams.toString()}`}
              alt="Activity Graph"
              className="w-full"
            />
          </div>
        );

      case 'trophies':
        const trophyParams = new URLSearchParams({
          username: getUsername(props.username as string),
          theme: props.theme as string,
          column: String(props.column),
          row: String(props.row),
          margin_w: String(props.margin_w),
          margin_h: String(props.margin_h),
          no_frame: props.noFrame ? 'true' : 'false',
          no_bg: props.noBg ? 'true' : 'false',
        });
        return (
          <div className="text-center">
            <img src={`/api/trophies?${trophyParams.toString()}`} alt="GitHub Trophies" />
          </div>
        );

      case 'visitor-counter':
        const visitorUrl = `https://komarev.com/ghpvc/?username=${getUsername(props.username as string)}&color=${props.color}&style=${props.style}&label=${encodeURIComponent(props.label as string)}`;
        return (
          <div className="text-center">
            <img src={visitorUrl} alt="Profile Views" />
          </div>
        );

      case 'quote':
        if (props.quote && props.author) {
          return (
            <blockquote className="border-l-4 border-primary pl-4 italic my-4">
              <p>"{props.quote as string}"</p>
              <cite className="text-muted-foreground">- {props.author as string}</cite>
            </blockquote>
          );
        }
        const quoteParams = new URLSearchParams({
          type: props.type as string,
          theme: props.theme as string,
        });
        return (
          <div className="text-center">
            <img src={`/api/quotes?${quoteParams.toString()}`} alt="Quote" />
          </div>
        );

      case 'footer-banner':
        const footerUrl = `https://capsule-render.vercel.app/api?type=waving&color=${encodeURIComponent(String(props.waveColor))}&height=${props.height}&section=footer&text=${encodeURIComponent(String(props.text))}&fontSize=24&fontColor=${props.fontColor}`;
        return (
          <div className="text-center">
            <img src={footerUrl} alt="Footer" className="w-full" />
          </div>
        );

      default:
        return null;
    }
  }, [type, props, children, globalUsername, imageSizeStyle]);

  return <div className={wrapperClassName}>{renderBlock}</div>;
}
