/* eslint-disable @next/next/no-img-element */
'use client';

import { Eye } from 'lucide-react';
import { JSX, useEffect, useMemo, useState, type CSSProperties } from 'react';

import { useBuilderStore } from '@/lib/store';
import type { Block } from '@/lib/types';

/**
 * Hook to prefetch all API images in parallel for a list of blocks.
 * Returns a map of URL -> { loading, data, error } for each image URL.
 */
function usePrefetchedImages(
  blocks: Block[],
  globalUsername: string,
): Map<string, { loading: boolean; data: string | null; error: Error | null }> {
  const [imageStates, setImageStates] = useState<
    Map<string, { loading: boolean; data: string | null; error: Error | null }>
  >(new Map());

  // Collect all unique URLs that need fetching
  const urls = useMemo(() => {
    const urlSet = new Set<string>();

    const getUsername = (blockUsername: string) => {
      return (!blockUsername || blockUsername === 'github') && globalUsername
        ? globalUsername
        : blockUsername;
    };

    const collectUrls = (blockList: Block[]) => {
      for (const block of blockList) {
        switch (block.type) {
          case 'stats-card': {
            const username = getUsername(block.props.username as string);
            if (username && username !== 'github') {
              const params = new URLSearchParams({
                username,
                theme: block.props.theme as string,
                layout: (block.props.layoutStyle as string | undefined) ?? 'standard',
                show_icons: block.props.showIcons ? 'true' : 'false',
                hide_border: block.props.hideBorder ? 'true' : 'false',
                hide_title: block.props.hideTitle ? 'true' : 'false',
                hide_rank: block.props.hideRank ? 'true' : 'false',
                border_radius: String(block.props.borderRadius),
              });
              urlSet.add(`/api/stats?${params.toString()}`);
            }
            break;
          }
          case 'top-languages': {
            const username = getUsername(block.props.username as string);
            if (username) {
              const params = new URLSearchParams({
                username,
                theme: block.props.theme as string,
                layout: block.props.layout as string,
                hide_border: block.props.hideBorder ? 'true' : 'false',
                hide_progress: block.props.hideProgress ? 'true' : 'false',
                langs_count: String(block.props.langs_count),
                border_radius: String(block.props.borderRadius),
              });
              urlSet.add(`/api/top-langs?${params.toString()}`);
            }
            break;
          }
          case 'streak-stats': {
            const username = getUsername(block.props.username as string);
            if (username) {
              const params = new URLSearchParams({
                username,
                theme: block.props.theme as string,
                hide_border: block.props.hideBorder ? 'true' : 'false',
                border_radius: String(block.props.borderRadius),
              });
              urlSet.add(`/api/streak?${params.toString()}`);
            }
            break;
          }
          case 'activity-graph': {
            const username = getUsername(block.props.username as string);
            if (username) {
              const params = new URLSearchParams({
                username,
                theme: block.props.theme as string,
                hide_border: block.props.hideBorder ? 'true' : 'false',
              });
              urlSet.add(`/api/activity?${params.toString()}`);
            }
            break;
          }
          case 'trophies': {
            const username = getUsername(block.props.username as string);
            if (username) {
              const params = new URLSearchParams({
                username,
                theme: block.props.theme as string,
                column: String(block.props.column),
                row: String(block.props.row),
                margin_w: String(block.props.margin_w),
                margin_h: String(block.props.margin_h),
                no_frame: block.props.noFrame ? 'true' : 'false',
                no_bg: block.props.noBg ? 'true' : 'false',
              });
              urlSet.add(`/api/trophies?${params.toString()}`);
            }
            break;
          }
          case 'quote': {
            if (!block.props.quote || !block.props.author) {
              const params = new URLSearchParams({
                type: block.props.type as string,
                theme: block.props.theme as string,
              });
              urlSet.add(`/api/quotes?${params.toString()}`);
            }
            break;
          }
        }
        if (block.children) {
          collectUrls(block.children);
        }
      }
    };

    collectUrls(blocks);
    return Array.from(urlSet);
  }, [blocks, globalUsername]);

  // Fetch all URLs in parallel on mount and when urls change
  useEffect(() => {
    if (urls.length === 0) return;

    // Initialize state with all URLs as loading
    const initialStates = new Map<
      string,
      { loading: boolean; data: string | null; error: Error | null }
    >();
    for (const url of urls) {
      initialStates.set(url, { loading: true, data: null, error: null });
    }
    setImageStates(initialStates);

    // Fetch all URLs in parallel using Promise.allSettled
    Promise.all(
      urls.map(async (url) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const blob = await response.blob();
          const dataUrl = await blobToDataUrl(blob);
          return { url, dataUrl, success: true };
        } catch (error) {
          return { url, error: error as Error, success: false };
        }
      }),
    ).then((results) => {
      setImageStates((prev) => {
        const newStates = new Map(prev);
        for (const result of results) {
          if (result.success && result.dataUrl) {
            newStates.set(result.url, { loading: false, data: result.dataUrl, error: null });
          } else {
            newStates.set(result.url, { loading: false, data: null, error: result.error ?? null });
          }
        }
        return newStates;
      });
    });
  }, [urls]);

  return imageStates;
}

/**
 * Convert a Blob to a data URL for inline embedding.
 */
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

interface LivePreviewProps {
  blocks: Block[];
}

function isHalfWidthGithubCard(block: Block): boolean {
  if (!['stats-card', 'top-languages', 'streak-stats'].includes(block.type)) return false;
  const layoutWidth = block.props.layoutWidth as string | undefined;
  if (layoutWidth === 'half') return true;
  if (layoutWidth === 'full') return false;
  return false;
}

export function LivePreview({ blocks }: LivePreviewProps) {
  const globalUsername = useBuilderStore((state) => state.username);
  const prefetchedImages = usePrefetchedImages(blocks, globalUsername);

  if (blocks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 sm:p-8 relative">
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

              // Render two adjacent half-width cards side by side, matching GitHub layout
              if (isHalfWidthGithubCard(block) && nextBlock && isHalfWidthGithubCard(nextBlock)) {
                items.push(
                  <div
                    key={`${block.id}-${nextBlock.id}`}
                    className="mb-4 animate-in"
                    style={{ display: 'flex', gap: '8px', animationDelay: `${i * 30}ms` }}
                  >
                    <div style={{ flex: '1 1 0', minWidth: 0 }}>
                      <PreviewBlock
                        block={block}
                        wrapperClassName="mb-0"
                        prefetchedImages={prefetchedImages}
                      />
                    </div>
                    <div style={{ flex: '1 1 0', minWidth: 0 }}>
                      <PreviewBlock
                        block={nextBlock}
                        wrapperClassName="mb-0"
                        prefetchedImages={prefetchedImages}
                      />
                    </div>
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

/**
 * Resolve the img style for a stats card block.
 * Default: fill the container width and let the SVG maintain its natural aspect ratio.
 * An explicit imageStyleOverride (e.g. from stats-row) takes precedence.
 */
function resolvePreviewImageSize(block: Block): CSSProperties {
  const cardHeight = block.props.cardHeight as string | number | undefined;
  const heightValue =
    cardHeight === undefined
      ? 'auto'
      : typeof cardHeight === 'number'
        ? `${cardHeight}px`
        : cardHeight;
  return {
    width: '100%',
    height: heightValue,
    display: 'block',
  };
}

function PreviewBlock({
  block,
  wrapperClassName = 'mb-4',
  imageStyleOverride,
  prefetchedImages,
}: {
  block: Block;
  wrapperClassName?: string;
  imageStyleOverride?: CSSProperties;
  prefetchedImages?: Map<string, { loading: boolean; data: string | null; error: Error | null }>;
}) {
  const { type, props, children } = block;
  const globalUsername = useBuilderStore((state) => state.username);
  const imageSizeStyle = imageStyleOverride ?? resolvePreviewImageSize(block);

  // Memoize stable keys for props and children to prevent unnecessary recalculations
  // Using JSON.stringify for props creates a stable string that only changes when values change
  // Using child IDs for children prevents recalculation when parent re-renders with same children

  const propsKey = useMemo(() => JSON.stringify(props), [props]);

  const childrenKey = useMemo(() => children?.map((child) => child.id).join(',') ?? '', [children]);

  const getPrefetchedSrc = (url: string): string | undefined => {
    const state = prefetchedImages?.get(url);
    return state?.data ?? undefined;
  };

  const getUsername = (blockUsername: string) => {
    return (!blockUsername || blockUsername === 'github') && globalUsername
      ? globalUsername
      : blockUsername;
  };

  /* eslint-disable react-hooks/preserve-manual-memoization, react-hooks/exhaustive-deps */
  const renderBlock = useMemo(() => {
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
        const cardWidth = (props.cardWidth as string) || '49%';
        // For the preview, let images maintain natural aspect ratio (height: auto).
        // Forcing an explicit pixel height on SVG <img> can cause letterboxing.
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: direction,
              gap: `${gap}px`,
              justifyContent: 'center',
              alignItems: 'flex-start',
              width: '100%',
            }}
          >
            {children?.map((child) => (
              <div
                key={child.id}
                style={{
                  width: direction === 'row' ? cardWidth : '100%',
                  minWidth: 0,
                  flex: direction === 'row' ? `0 0 ${cardWidth}` : undefined,
                }}
              >
                <PreviewBlock
                  block={child}
                  wrapperClassName="mb-0"
                  imageStyleOverride={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            ))}
          </div>
        );
      }

      case 'divider':
        return props.type === 'gif' && props.gifUrl ? (
          <img
            src={props.gifUrl as string}
            alt="Divider"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        ) : (
          <hr className="my-4" />
        );

      case 'spacer':
        return <div style={{ height: `${props.height}px` }} />;

      case 'capsule-header': {
        const capsuleUrl = `https://capsule-render.vercel.app/api?type=${props.type}&color=${encodeURIComponent(String(props.color))}&height=${props.height}&section=${props.section}&text=${encodeURIComponent(String(props.text))}&fontSize=50&animation=fadeIn&fontColor=ffffff`;
        return (
          <img
            src={capsuleUrl}
            alt="Header"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        );
      }

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

      case 'typing-animation': {
        const lines = props.lines as string[];
        const typingUrl = `https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3000&pause=1000&color=${props.color}&center=true&vCenter=true&width=${props.width}&height=${props.height}&lines=${encodeURIComponent(lines.join(';'))}`;
        return (
          <div className="text-center">
            <img src={typingUrl} alt="Typing Animation" style={{ height: 'auto' }} />
          </div>
        );
      }

      case 'heading': {
        const HeadingTag = `h${props.level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag style={{ textAlign: props.alignment as 'left' | 'center' | 'right' }}>
            {Boolean(props.emoji) ? <span>{props.emoji as string} </span> : null}
            {props.text as string}
          </HeadingTag>
        );
      }

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
        if (!props.url) return null;
        return (
          <div style={{ textAlign: props.alignment as 'left' | 'center' | 'right' }}>
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
        if (!props.url) return null;
        return (
          <div style={{ textAlign: props.alignment as 'left' | 'center' | 'right' }}>
            <img
              src={props.url as string}
              alt={props.alt as string}
              style={{ width: props.width ? `${props.width}px` : 'auto', height: 'auto' }}
            />
          </div>
        );

      case 'social-badges': {
        const badges: JSX.Element[] = [];
        const badgeStyle = props.style as string;

        if (props.linkedin)
          badges.push(
            <a
              key="linkedin"
              href={`https://linkedin.com/in/${props.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://img.shields.io/badge/LinkedIn-0077B5?style=${badgeStyle}&logo=linkedin&logoColor=white`}
                alt="LinkedIn"
                style={{ height: 'auto' }}
              />
            </a>,
          );
        if (props.twitter)
          badges.push(
            <a
              key="twitter"
              href={`https://twitter.com/${props.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://img.shields.io/badge/Twitter-1DA1F2?style=${badgeStyle}&logo=twitter&logoColor=white`}
                alt="Twitter"
                style={{ height: 'auto' }}
              />
            </a>,
          );
        if (props.github)
          badges.push(
            <a
              key="github"
              href={`https://github.com/${props.github}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://img.shields.io/badge/GitHub-100000?style=${badgeStyle}&logo=github&logoColor=white`}
                alt="GitHub"
                style={{ height: 'auto' }}
              />
            </a>,
          );
        if (props.youtube)
          badges.push(
            <a
              key="youtube"
              href={`https://youtube.com/@${props.youtube}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://img.shields.io/badge/YouTube-FF0000?style=${badgeStyle}&logo=youtube&logoColor=white`}
                alt="YouTube"
                style={{ height: 'auto' }}
              />
            </a>,
          );
        if (props.instagram)
          badges.push(
            <a
              key="instagram"
              href={`https://instagram.com/${props.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://img.shields.io/badge/Instagram-E4405F?style=${badgeStyle}&logo=instagram&logoColor=white`}
                alt="Instagram"
                style={{ height: 'auto' }}
              />
            </a>,
          );
        if (props.discord)
          badges.push(
            <a
              key="discord"
              href={`https://discord.gg/${props.discord}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://img.shields.io/badge/Discord-7289DA?style=${badgeStyle}&logo=discord&logoColor=white`}
                alt="Discord"
                style={{ height: 'auto' }}
              />
            </a>,
          );
        if (props.email)
          badges.push(
            <a key="email" href={`mailto:${props.email}`}>
              <img
                src={`https://img.shields.io/badge/Email-D14836?style=${badgeStyle}&logo=gmail&logoColor=white`}
                alt="Email"
                style={{ height: 'auto' }}
              />
            </a>,
          );
        if (props.portfolio)
          badges.push(
            <a
              key="portfolio"
              href={props.portfolio as string}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://img.shields.io/badge/Portfolio-000000?style=${badgeStyle}&logo=About.me&logoColor=white`}
                alt="Portfolio"
                style={{ height: 'auto' }}
              />
            </a>,
          );

        return badges.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">{badges}</div>
        ) : null;
      }

      case 'custom-badge': {
        const badgeUrl = `https://img.shields.io/badge/${encodeURIComponent(props.label as string)}-${encodeURIComponent(props.message as string)}-${props.color}?style=${props.style}${props.logo ? `&logo=${props.logo}` : ''}`;
        return (
          <div className="text-center">
            <img
              src={badgeUrl}
              alt={`${props.label}: ${props.message}`}
              style={{ height: 'auto' }}
            />
          </div>
        );
      }

      case 'skill-icons': {
        const icons = props.icons as string[];
        const skillUrl = `https://skillicons.dev/icons?i=${icons.join(',')}&perline=${props.perLine}&theme=${props.theme}`;
        return (
          <div className="text-center">
            <img src={skillUrl} alt="Skills" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
        );
      }

      /**
       * Stats card — uses <img> so the browser respects the SVG viewBox aspect ratio.
       * The previous StatsCardInline approach (fetch + dangerouslySetInnerHTML) stripped
       * the height attribute from the SVG, causing distorted proportions.
       */
      case 'stats-card': {
        const layoutStyle = (props.layoutStyle as string | undefined) ?? 'standard';
        const username = getUsername(props.username as string);

        if (!username || username === 'github') {
          return (
            <div className="p-4 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20 text-center">
              <p className="text-muted-foreground text-sm">Enter a GitHub username to see stats</p>
            </div>
          );
        }

        const statsParams = new URLSearchParams({
          username,
          theme: props.theme as string,
          layout: layoutStyle,
          show_icons: props.showIcons ? 'true' : 'false',
          hide_border: props.hideBorder ? 'true' : 'false',
          hide_title: props.hideTitle ? 'true' : 'false',
          hide_rank: props.hideRank ? 'true' : 'false',
          border_radius: String(props.borderRadius),
        });

        const statsUrl = `/api/stats?${statsParams.toString()}`;
        const prefetchedSrc = getPrefetchedSrc(statsUrl);

        return <img src={prefetchedSrc ?? statsUrl} alt="GitHub Stats" style={imageSizeStyle} />;
      }

      case 'top-languages': {
        const langsParams = new URLSearchParams({
          username: getUsername(props.username as string),
          theme: props.theme as string,
          layout: props.layout as string,
          hide_border: props.hideBorder ? 'true' : 'false',
          hide_progress: props.hideProgress ? 'true' : 'false',
          langs_count: String(props.langs_count),
          border_radius: String(props.borderRadius),
        });
        const langsUrl = `/api/top-langs?${langsParams.toString()}`;
        const prefetchedLangsSrc = getPrefetchedSrc(langsUrl);
        return (
          <img src={prefetchedLangsSrc ?? langsUrl} alt="Top Languages" style={imageSizeStyle} />
        );
      }

      case 'streak-stats': {
        const streakParams = new URLSearchParams({
          username: getUsername(props.username as string),
          theme: props.theme as string,
          hide_border: props.hideBorder ? 'true' : 'false',
          border_radius: String(props.borderRadius),
        });
        const streakUrl = `/api/streak?${streakParams.toString()}`;
        const prefetchedStreakSrc = getPrefetchedSrc(streakUrl);
        return (
          <img src={prefetchedStreakSrc ?? streakUrl} alt="GitHub Streak" style={imageSizeStyle} />
        );
      }

      case 'activity-graph': {
        const activityParams = new URLSearchParams({
          username: getUsername(props.username as string),
          theme: props.theme as string,
          hide_border: props.hideBorder ? 'true' : 'false',
        });
        const activityUrl = `/api/activity?${activityParams.toString()}`;
        const prefetchedActivitySrc = getPrefetchedSrc(activityUrl);
        return (
          // Activity graph SVG is 850 px wide — always fill the full container width
          <img
            src={prefetchedActivitySrc ?? activityUrl}
            alt="Activity Graph"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        );
      }

      case 'trophies': {
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
        const trophyUrl = `/api/trophies?${trophyParams.toString()}`;
        const prefetchedTrophySrc = getPrefetchedSrc(trophyUrl);
        return (
          <div className="text-center">
            <img
              src={prefetchedTrophySrc ?? trophyUrl}
              alt="GitHub Trophies"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        );
      }

      case 'visitor-counter': {
        const visitorUrl = `https://komarev.com/ghpvc/?username=${getUsername(props.username as string)}&color=${props.color}&style=${props.style}&label=${encodeURIComponent(props.label as string)}`;
        return (
          <div className="text-center">
            <img src={visitorUrl} alt="Profile Views" style={{ height: 'auto' }} />
          </div>
        );
      }

      case 'quote': {
        const quoteText = String(props.quote ?? '');
        const quoteAuthor = String(props.author ?? '');
        const quoteTheme = String(props.theme ?? 'tokyonight');
        const quoteType = String(props.type ?? 'default');

        const quoteParams = new URLSearchParams({
          type: quoteType,
          theme: quoteTheme,
          ...(quoteText ? { quote: quoteText } : {}),
          ...(quoteAuthor ? { author: quoteAuthor } : {}),
        });
        const quoteUrl = `/api/quotes?${quoteParams.toString()}`;

        // Show custom quote text if available, otherwise show random quote image
        if (quoteText && quoteAuthor) {
          return (
            <div className="text-center p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg">
              <p className="text-sm italic text-foreground">&ldquo;{quoteText}&rdquo;</p>
              <p className="text-xs text-muted-foreground mt-1">— {quoteAuthor}</p>
              <p className="text-xs text-muted-foreground/50 mt-2">Theme: {quoteTheme}</p>
            </div>
          );
        }

        return (
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">
              Random Quote ({quoteType}, {quoteTheme})
            </p>
            <img src={quoteUrl} alt="Quote" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
        );
      }

      case 'footer-banner': {
        const footerUrl = `https://capsule-render.vercel.app/api?type=waving&color=${encodeURIComponent(String(props.waveColor))}&height=${props.height}&section=footer&text=${encodeURIComponent(String(props.text))}&fontSize=24&fontColor=${props.fontColor}`;
        return (
          <img
            src={footerUrl}
            alt="Footer"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        );
      }

      case 'support-link': {
        const linkType = props.type as string;
        const alignment = (props.alignment as string) || 'center';
        const linkUrl =
          (props.url as string) ||
          (linkType === 'coffee'
            ? 'https://buymeacoffee.com/codetibo'
            : 'https://github.com/zntb/github-profile-maker/issues');
        const containerStyle: CSSProperties = {
          display: 'flex',
          justifyContent:
            alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center',
          width: '100%',
        };
        if (linkType === 'coffee') {
          return (
            <div style={containerStyle}>
              <a href={linkUrl} target="_blank">
                <img
                  src="https://img.shields.io/badge/Buy%20me%20a%20coffee-%23FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black"
                  alt="Buy me a coffee"
                />
              </a>
            </div>
          );
        }
        return (
          <div style={containerStyle}>
            <a href={linkUrl} target="_blank">
              <img
                src="https://img.shields.io/badge/Leave%20feedback-%23FF6B6B?style=for-the-badge&logo=github&logoColor=white"
                alt="Leave feedback"
              />
            </a>
          </div>
        );
      }

      default:
        return null;
    }
  }, [type, propsKey, childrenKey, globalUsername, prefetchedImages]);

  return <div className={wrapperClassName}>{renderBlock}</div>;
}
