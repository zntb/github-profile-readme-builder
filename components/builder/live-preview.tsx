/* eslint-disable @next/next/no-img-element */
'use client';

import { AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import { JSX, useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';

import { Button } from '@/components/ui/button';
import { resolveFooterBannerColors } from '@/lib/footer-banner-utils';
import { getQuoteTheme } from '@/lib/quote-themes';
import { useBuilderStore } from '@/lib/store';
import type { Block } from '@/lib/types';

import { BlockTypeSkeleton } from './skeleton-loaders';

/**
 * Extended image state that includes loading information
 */
interface ImageState {
  loading: boolean;
  data: string | null;
  error: Error | null;
}

/**
 * Check if a block has an error in its API call
 */
function isBlockErrored(
  block: Block,
  imageStates: Map<string, ImageState>,
  globalUsername: string,
): boolean {
  // For non-API blocks, no error tracking needed
  const apiBlockTypes = [
    'stats-card',
    'top-languages',
    'streak-stats',
    'activity-graph',
    'trophies',
    'quote',
  ];
  if (!apiBlockTypes.includes(block.type)) return false;

  // Quote blocks don't need a username, handle separately
  if (block.type === 'quote') {
    const quoteParams = new URLSearchParams({
      type: (block.props.type as string) || 'default',
      theme: (block.props.theme as string) || 'default',
      textAlign: (block.props.textAlign as string) || 'center',
      authorAlign: (block.props.authorAlign as string) || 'center',
      ...(block.props.quote ? { quote: String(block.props.quote) } : {}),
      ...(block.props.author ? { author: String(block.props.author) } : {}),
    });
    const quoteUrl = `/api/quotes?${quoteParams.toString()}`;
    const state = imageStates.get(quoteUrl);
    return state?.error !== null;
  }

  const getUsername = (blockUsername: string) => {
    return (!blockUsername || blockUsername === 'github') && globalUsername
      ? globalUsername
      : blockUsername;
  };

  const username = getUsername(block.props.username as string);
  if (!username || username === 'github') return false;

  const baseUrl = getApiUrlForBlock(block, username);
  if (!baseUrl) return false;

  const state = imageStates.get(baseUrl);
  return state?.error !== null;
}

/**
 * Hook to prefetch all API images in parallel for a list of blocks.
 * Returns a map of URL -> { loading, data, error } for each image URL.
 * Also returns an isLoading state for overall loading progress.
 */
function usePrefetchedImages(
  blocks: Block[],
  globalUsername: string,
): {
  imageStates: Map<string, ImageState>;
  isLoading: boolean;
  refetch: () => void;
} {
  const [imageStates, setImageStates] = useState<Map<string, ImageState>>(new Map());

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
            const params = new URLSearchParams({
              type: (block.props.type as string) || 'default',
              theme: (block.props.theme as string) || 'default',
              ...(block.props.quote ? { quote: String(block.props.quote) } : {}),
              ...(block.props.author ? { author: String(block.props.author) } : {}),
            });
            urlSet.add(`/api/quotes?${params.toString()}`);
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

  // Fetch images sequentially with priority - visible blocks first, then background
  // This optimizes perceived performance by loading visible content before background content
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

    // Fetch images sequentially to prioritize visible blocks
    // This prevents bandwidth contention and gives faster visual feedback
    let isCancelled = false;

    const fetchSequentially = async () => {
      for (const url of urls) {
        if (isCancelled) break;

        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const blob = await response.blob();
          const dataUrl = await blobToDataUrl(blob);

          if (!isCancelled) {
            setImageStates((prev) => {
              const newStates = new Map(prev);
              newStates.set(url, { loading: false, data: dataUrl, error: null });
              return newStates;
            });
          }
        } catch (error) {
          if (!isCancelled) {
            setImageStates((prev) => {
              const newStates = new Map(prev);
              newStates.set(url, { loading: false, data: null, error: error as Error });
              return newStates;
            });
          }
        }
      }
    };

    fetchSequentially();

    return () => {
      isCancelled = true;
    };
  }, [urls]);

  // Refetch function for retry functionality
  const refetch = useCallback(() => {
    if (urls.length === 0) return;

    // Set all URLs to loading again
    setImageStates((prev) => {
      const newStates = new Map(prev);
      for (const url of urls) {
        const currentState = prev.get(url);
        newStates.set(url, { loading: true, data: currentState?.data ?? null, error: null });
      }
      return newStates;
    });

    // Refetch all URLs
    Promise.all(
      urls.map(async (url) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const blob = await response.blob();
          const dataUrl = await blobToDataUrl(blob);
          return { url, dataUrl, success: true };
        } catch (fetchError) {
          return { url, error: fetchError as Error, success: false };
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

  // Check if any images are still loading
  const isLoading = useMemo(() => {
    if (urls.length === 0) return false;
    for (const url of urls) {
      const state = imageStates.get(url);
      if (state?.loading) return true;
    }
    return false;
  }, [imageStates, urls]);

  return { imageStates, isLoading, refetch } as const;
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

/**
 * Check if a block's images are still loading
 */
function isBlockLoading(
  block: Block,
  imageStates: Map<string, ImageState>,
  globalUsername: string,
): boolean {
  // For non-API blocks, no loading needed
  const apiBlockTypes = [
    'stats-card',
    'top-languages',
    'streak-stats',
    'activity-graph',
    'trophies',
    'quote',
  ];
  if (!apiBlockTypes.includes(block.type)) return false;

  // Quote blocks don't need a username, handle separately
  if (block.type === 'quote') {
    // For quote blocks, only show loading if no custom quote/author provided
    if (block.props.quote && block.props.author) return false;

    const quoteParams = new URLSearchParams({
      type: (block.props.type as string) || 'default',
      theme: (block.props.theme as string) || 'default',
      textAlign: (block.props.textAlign as string) || 'center',
      authorAlign: (block.props.authorAlign as string) || 'center',
      ...(block.props.quote ? { quote: String(block.props.quote) } : {}),
      ...(block.props.author ? { author: String(block.props.author) } : {}),
    });
    const quoteUrl = `/api/quotes?${quoteParams.toString()}`;
    const state = imageStates.get(quoteUrl);
    return state?.loading ?? false;
  }

  const getUsername = (blockUsername: string) => {
    return (!blockUsername || blockUsername === 'github') && globalUsername
      ? globalUsername
      : blockUsername;
  };

  const username = getUsername(block.props.username as string);

  // No username means no API call, so not loading
  if (!username || username === 'github') return false;

  const baseUrl = getApiUrlForBlock(block, username);
  if (!baseUrl) return false;

  const state = imageStates.get(baseUrl);
  return state?.loading ?? false;
}

/**
 * Generate the API URL for a block (same logic as usePrefetchedImages)
 */
function getApiUrlForBlock(block: Block, username: string): string | null {
  switch (block.type) {
    case 'stats-card': {
      const params = new URLSearchParams({
        username,
        theme: (block.props.theme as string) || 'default',
        layout: (block.props.layoutStyle as string | undefined) ?? 'standard',
        show_icons: block.props.showIcons ? 'true' : 'false',
        hide_border: block.props.hideBorder ? 'true' : 'false',
        hide_title: block.props.hideTitle ? 'true' : 'false',
        hide_rank: block.props.hideRank ? 'true' : 'false',
        border_radius: String(block.props.borderRadius ?? 4),
      });
      return `/api/stats?${params.toString()}`;
    }
    case 'top-languages': {
      const params = new URLSearchParams({
        username,
        theme: (block.props.theme as string) || 'default',
        layout: (block.props.layout as string) || 'compact',
        hide_border: block.props.hideBorder ? 'true' : 'false',
        hide_progress: block.props.hideProgress ? 'true' : 'false',
        langs_count: String(block.props.langs_count ?? 5),
        border_radius: String(block.props.borderRadius ?? 4),
      });
      return `/api/top-langs?${params.toString()}`;
    }
    case 'streak-stats': {
      const params = new URLSearchParams({
        username,
        theme: (block.props.theme as string) || 'default',
        hide_border: block.props.hideBorder ? 'true' : 'false',
        border_radius: String(block.props.borderRadius ?? 4),
      });
      return `/api/streak?${params.toString()}`;
    }
    case 'activity-graph': {
      const params = new URLSearchParams({
        username,
        theme: (block.props.theme as string) || 'default',
        hide_border: block.props.hideBorder ? 'true' : 'false',
      });
      return `/api/activity?${params.toString()}`;
    }
    case 'trophies': {
      const params = new URLSearchParams({
        username,
        theme: (block.props.theme as string) || 'default',
        column: String(block.props.column ?? 4),
        row: String(block.props.row ?? 1),
        margin_w: String(block.props.margin_w ?? 2),
        margin_h: String(block.props.margin_h ?? 2),
        no_frame: block.props.noFrame ? 'true' : 'false',
        no_bg: block.props.noBg ? 'true' : 'false',
      });
      return `/api/trophies?${params.toString()}`;
    }
    case 'quote': {
      const params = new URLSearchParams({
        type: (block.props.type as string) || 'default',
        theme: (block.props.theme as string) || 'default',
        textAlign: (block.props.textAlign as string) || 'center',
        authorAlign: (block.props.authorAlign as string) || 'center',
        ...(block.props.quote ? { quote: String(block.props.quote) } : {}),
        ...(block.props.author ? { author: String(block.props.author) } : {}),
      });
      return `/api/quotes?${params.toString()}`;
    }
    default:
      return null;
  }
}

export function LivePreview({ blocks }: LivePreviewProps) {
  const globalUsername = useBuilderStore((state) => state.username);
  const { imageStates: prefetchedImages, refetch } = usePrefetchedImages(blocks, globalUsername);

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
                // Check if either block's images are loading
                const firstBlockLoading = isBlockLoading(block, prefetchedImages, globalUsername);
                const secondBlockLoading = isBlockLoading(
                  nextBlock,
                  prefetchedImages,
                  globalUsername,
                );

                items.push(
                  <div
                    key={`${block.id}-${nextBlock.id}`}
                    className="mb-4 animate-in"
                    style={{ display: 'flex', gap: '8px', animationDelay: `${i * 30}ms` }}
                  >
                    <div style={{ flex: '1 1 0', minWidth: 0 }}>
                      {firstBlockLoading ? (
                        <BlockTypeSkeleton type={block.type} />
                      ) : (
                        <PreviewBlock
                          block={block}
                          wrapperClassName="mb-0"
                          prefetchedImages={prefetchedImages}
                        />
                      )}
                    </div>
                    <div style={{ flex: '1 1 0', minWidth: 0 }}>
                      {secondBlockLoading ? (
                        <BlockTypeSkeleton type={nextBlock.type} />
                      ) : (
                        <PreviewBlock
                          block={nextBlock}
                          wrapperClassName="mb-0"
                          prefetchedImages={prefetchedImages}
                        />
                      )}
                    </div>
                  </div>,
                );
                i += 1;
                continue;
              }

              // Check if this block needs to show a loading skeleton or error
              const blockLoading = isBlockLoading(block, prefetchedImages, globalUsername);
              const blockError = isBlockErrored(block, prefetchedImages, globalUsername);

              items.push(
                <div
                  key={block.id}
                  className="animate-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {blockLoading ? (
                    <BlockTypeSkeleton type={block.type} />
                  ) : blockError ? (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <p className="text-sm text-muted-foreground">
                          Failed to load {block.type.replace('-', ' ')}. Click to retry.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refetch()}
                          className="mt-1"
                        >
                          <RefreshCw className="mr-2 h-3 w-3" />
                          Retry
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <PreviewBlock block={block} prefetchedImages={prefetchedImages} />
                  )}
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

      case 'divider': {
        if (props.type === 'gif' && props.gifUrl) {
          return (
            <img
              src={props.gifUrl as string}
              alt="Divider"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          );
        }

        // Line type with new styling options
        const bgType = (props.bgType as string) ?? 'solid';
        const thickness = (props.thickness as number) ?? 2;
        const alignment = (props.alignment as string) ?? 'center';

        // Color handling
        const bgSolidColor = (props.bgSolidColor as string) ?? 'CCCCCC';
        const bgStartColor = (props.bgStartColor as string) ?? 'CCCCCC';
        const bgEndColor = (props.bgEndColor as string) ?? '999999';
        const bgGradientDirection = (props.bgGradientDirection as string) ?? 'horizontal';

        let backgroundStyle: React.CSSProperties = {};

        if (bgType === 'solid') {
          backgroundStyle = { backgroundColor: `#${bgSolidColor}` };
        } else if (bgType === 'gradient') {
          const start = `#${bgStartColor}`;
          const end = `#${bgEndColor}`;
          switch (bgGradientDirection) {
            case 'horizontal':
              backgroundStyle = { background: `linear-gradient(to right, ${start}, ${end})` };
              break;
            case 'vertical':
              backgroundStyle = { background: `linear-gradient(to bottom, ${start}, ${end})` };
              break;
            case 'diagonal':
              backgroundStyle = { background: `linear-gradient(135deg, ${start}, ${end})` };
              break;
            case 'radial':
              backgroundStyle = { background: `radial-gradient(circle, ${start}, ${end})` };
              break;
            case 'conic':
              backgroundStyle = { background: `conic-gradient(from 0deg, ${start}, ${end})` };
              break;
            default:
              backgroundStyle = { background: `linear-gradient(to right, ${start}, ${end})` };
          }
        }

        const alignmentClass =
          alignment === 'left'
            ? 'justify-start'
            : alignment === 'right'
              ? 'justify-end'
              : 'justify-center';

        return (
          <div className={`flex w-full ${alignmentClass}`}>
            <div
              className="rounded"
              style={{
                height: thickness,
                width: '100%',
                ...backgroundStyle,
              }}
            />
          </div>
        );
      }

      case 'spacer':
        return <div style={{ height: `${props.height}px` }} />;

      case 'capsule-header': {
        // Determine the color to use based on bgType
        const bgType = (props.bgType as string) ?? 'gradient';
        const bgGradientDirection = (props.bgGradientDirection as string) ?? 'horizontal';
        const bgAnimation = (props.bgAnimation as string) ?? 'none';
        let bgStartColor = props.bgStartColor ? String(props.bgStartColor) : undefined;
        let bgEndColor = props.bgEndColor ? String(props.bgEndColor) : undefined;
        const bgSolidColor = (props.bgSolidColor as string) ?? 'EEFF00';

        // Parse legacy color format ONLY if modern properties are NOT present
        if ((!bgStartColor || !bgEndColor) && props.color && props.color !== 'gradient') {
          const colorValue = props.color as string;
          const colorParts = colorValue.split(',');
          if (colorParts.length >= 2) {
            const startMatch = colorParts[0].match(/\d+:([0-9a-fA-F]+)/);
            const endMatch = colorParts[1].match(/\d+:([0-9a-fA-F]+)/);
            if (startMatch) bgStartColor = startMatch[1].toUpperCase();
            if (endMatch) bgEndColor = endMatch[1].toUpperCase();
          }
        }

        // Always apply defaults - this ensures new blocks get proper colors immediately
        bgStartColor = bgStartColor ?? 'EEFF00';
        bgEndColor = bgEndColor ?? 'A82DAA';

        const normalizeHex = (value: string, fallback: string) => {
          const sanitized = value?.replace('#', '').trim();
          return sanitized || fallback;
        };

        // For solid type, render natively (no external API needed)
        if (bgType === 'solid') {
          const fontSize = (props.fontSize as number) ?? 30;
          const fontColor = `#${normalizeHex((props.fontColor as string) ?? 'ffffff', 'ffffff')}`;
          const solidColor = normalizeHex(bgSolidColor, 'EEFF00');
          const normalizedSolidColor = solidColor.startsWith('#') ? solidColor : `#${solidColor}`;

          const section = (props.section as string) ?? 'header';
          const type = (props.type as string) ?? 'waving';

          // Compute border radius based on type
          let borderRadius = '0 0 24px 24px';
          if (type === 'rect') borderRadius = '8px';
          else if (type === 'cylinder') borderRadius = '9999px';
          else if (type === 'soft') borderRadius = '36px';
          else if (type === 'slice') borderRadius = '48px 10px 48px 10px';
          else if (type === 'wave')
            borderRadius = section === 'footer' ? '24px 24px 0 0' : '0 0 40px 40px';
          else if (type === 'egg')
            borderRadius = section === 'footer' ? '24px 24px 0 0' : '50px 50px 0 0';
          else if (type === 'shark')
            borderRadius = section === 'footer' ? '24px 24px 0 0' : '20px 20px 0 10px';
          else if (type === 'speech')
            borderRadius = section === 'footer' ? '24px 24px 0 0' : '24px 24px 0 0';
          else if (type === 'transparent' || type === 'blur') borderRadius = '0';
          else if (section === 'footer') borderRadius = '24px 24px 0 0';

          // Special handling for transparent and blur types
          const isTransparent = type === 'transparent';
          const isBlur = type === 'blur';

          return (
            <div
              className="relative overflow-hidden"
              style={{
                width: '100%',
                maxWidth: '896px',
                height: `${props.height}px`,
                backgroundColor: isTransparent ? 'transparent' : normalizedSolidColor,
                borderRadius,
                ...(isBlur
                  ? { backdropFilter: 'blur(10px)', backgroundColor: normalizedSolidColor }
                  : {}),
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="font-bold"
                  style={{
                    fontSize: `${fontSize}px`,
                    color: fontColor,
                    position: 'absolute',
                    left: `${props.textAlignX ?? 50}%`,
                    top: `${props.textAlignY ?? 50}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 'max-content',
                  }}
                >
                  {props.text as string}
                </span>
              </div>
            </div>
          );
        }

        // For gradient/animated types, render custom capsule header
        const startColor = `#${bgStartColor}`;
        const endColor = `#${bgEndColor}`;

        let gradientBgImage: string;
        switch (bgGradientDirection) {
          case 'horizontal':
            gradientBgImage = `linear-gradient(to right, ${startColor}, ${endColor})`;
            break;
          case 'vertical':
            gradientBgImage = `linear-gradient(to bottom, ${startColor}, ${endColor})`;
            break;
          case 'diagonal':
            gradientBgImage = `linear-gradient(135deg, ${startColor}, ${endColor})`;
            break;
          case 'radial':
            gradientBgImage = `radial-gradient(circle, ${startColor}, ${endColor})`;
            break;
          case 'conic':
            gradientBgImage = `conic-gradient(from 0deg, ${startColor}, ${endColor})`;
            break;
          default:
            gradientBgImage = `linear-gradient(to right, ${startColor}, ${endColor})`;
        }

        // Apply animation for animated type
        const fontSize = (props.fontSize as number) ?? 30;
        const fontColor = `#${normalizeHex((props.fontColor as string) ?? 'ffffff', 'ffffff')}`;
        const animationClass =
          bgAnimation !== 'none'
            ? bgAnimation === 'gradient'
              ? 'animate-gradient-flow'
              : bgAnimation === 'pulse'
                ? 'animate-pulse'
                : bgAnimation === 'waving'
                  ? 'animate-wave'
                  : bgAnimation === 'wave'
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
        const section = (props.section as string) ?? 'header';
        const type = (props.type as string) ?? 'waving';

        // Normalize solid color for blur background
        const solidColor = normalizeHex(bgSolidColor, 'EEFF00');
        const normalizedSolidColor = solidColor.startsWith('#') ? solidColor : `#${solidColor}`;

        // Compute border radius based on type
        let borderRadius = '0 0 24px 24px';
        if (type === 'rect') borderRadius = '8px';
        else if (type === 'cylinder') borderRadius = '9999px';
        else if (type === 'soft') borderRadius = '36px';
        else if (type === 'slice') borderRadius = '48px 10px 48px 10px';
        else if (type === 'wave')
          borderRadius = section === 'footer' ? '24px 24px 0 0' : '0 0 40px 40px';
        else if (type === 'egg')
          borderRadius = section === 'footer' ? '24px 24px 0 0' : '50px 50px 0 0';
        else if (type === 'shark')
          borderRadius = section === 'footer' ? '24px 24px 0 0' : '20px 20px 0 10px';
        else if (type === 'speech')
          borderRadius = section === 'footer' ? '24px 24px 0 0' : '24px 24px 0 0';
        else if (type === 'transparent' || type === 'blur') borderRadius = '0';
        else if (section === 'footer') borderRadius = '24px 24px 0 0';

        // For 'waving' type with parallax, render using API image for accurate wave preview
        if (type === 'waving' && props.parallaxEffect === true) {
          const wavePosition = props.wavePosition ?? 70;
          const waveAmplitude = props.waveAmplitude ?? 20;
          const waveSpeed = props.waveSpeed ?? 20;
          const waveFlip = props.waveFlip === true;

          const params = new URLSearchParams({
            type,
            section,
            height: String(props.height ?? 200),
            text: String(props.text ?? ''),
            fontSize: String(fontSize),
            fontColor: String(props.fontColor ?? 'ffffff').replace('#', ''),
            color: String(bgStartColor),
            colorEnd: String(bgEndColor),
            gradientDirection: bgGradientDirection,
            parallax: 'true',
            wavePosition: String(wavePosition),
            waveAmplitude: String(waveAmplitude),
            waveSpeed: String(waveSpeed),
            flipWave: waveFlip ? 'true' : 'false',
            textAlignX: String(props.textAlignX ?? 50),
            textAlignY: String(props.textAlignY ?? 50),
          });

          return (
            <img
              src={`/api/capsule?${params.toString()}`}
              alt="Capsule Header"
              className="w-full"
              style={{
                height: `${props.height ?? 200}px`,
                maxWidth: '896px',
              }}
            />
          );
        }

        // Special handling for transparent and blur types
        const isTransparent = type === 'transparent';
        const isBlur = type === 'blur';

        return (
          <div
            className={`relative flex items-center justify-center w-full overflow-hidden ${animationClass}`}
            style={{
              width: '100%',
              maxWidth: '896px', // GitHub README max width
              height: `${props.height}px`,
              backgroundImage: isTransparent ? 'none' : gradientBgImage,
              backgroundColor: isTransparent
                ? 'transparent'
                : isBlur
                  ? normalizedSolidColor
                  : undefined,
              borderRadius,
              ...(isBlur ? { backdropFilter: 'blur(10px)' } : {}),
              ...animationBgSize,
            }}
          >
            <span
              className="font-bold drop-shadow-md"
              style={{
                fontSize: `${fontSize}px`,
                color: fontColor,
                position: 'absolute',
                left: `${props.textAlignX ?? 50}%`,
                top: `${props.textAlignY ?? 50}%`,
                transform: 'translate(-50%, -50%)',
                width: 'max-content',
              }}
            >
              {props.text as string}
            </span>
          </div>
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
        const quoteTheme = String(props.theme ?? 'default');
        const textAlign = (props.textAlign as string) ?? 'center';
        const authorAlign = (props.authorAlign as string) ?? 'center';
        const { bg, text, accent, border } = getQuoteTheme(quoteTheme);

        // Default layout with alignment support
        return (
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: bg,
              border: `1px solid`,
              borderColor: border,
              textAlign: textAlign as 'left' | 'center' | 'right',
            }}
          >
            <p className="text-sm italic" style={{ color: text }}>
              {quoteText ? `"${quoteText}"` : '"Random inspirational quote..."'}
            </p>
            {quoteAuthor && (
              <p
                className="text-xs mt-1"
                style={{ color: accent, textAlign: authorAlign as 'left' | 'center' | 'right' }}
              >
                - {quoteAuthor}
              </p>
            )}
          </div>
        );
      }

      case 'footer-banner': {
        // Determine the color to use based on bgType
        // FIXED: resolveFooterBannerColors() correctly handles both legacy
        // waveColor ("0:EEFF00,100:A82DAA") and modern (bgStartColor / bgEndColor)
        // props.  The old code split on ':' and produced startColor='0' (not a
        // valid hex) and endColor='EEFF00,100' (also invalid).
        const { bgStartColor, bgEndColor } = resolveFooterBannerColors(props);
        const bgType = (props.bgType as string) ?? 'gradient';
        const bgGradientDirection = (props.bgGradientDirection as string) ?? 'horizontal';
        const bgAnimation = (props.bgAnimation as string) ?? 'none';
        const bgSolidColor = (props.bgSolidColor as string) ?? '3B82F6';

        const normalizeHex = (value: string, fallback: string) => {
          const sanitized = value?.replace('#', '').trim();
          return sanitized || fallback;
        };

        // For solid type, render natively (no external API needed)
        if (bgType === 'solid') {
          const fontSize = (props.fontSize as number) ?? 24;
          const fontColor = `#${normalizeHex((props.fontColor as string) ?? 'ffffff', 'ffffff')}`;
          const solidColor = normalizeHex(bgSolidColor, '3B82F6');
          const normalizedSolidColor = solidColor.startsWith('#') ? solidColor : `#${solidColor}`;

          const type = (props.type as string) ?? 'waving';

          // Compute border radius based on type and section
          let borderRadiusValue: string;
          if (type === 'rect') {
            borderRadiusValue = '8px';
          } else if (type === 'cylinder') {
            borderRadiusValue = '9999px';
          } else if (type === 'soft') {
            borderRadiusValue = '36px';
          } else if (type === 'slice') {
            borderRadiusValue = '48px 10px 48px 10px';
          } else if (type === 'wave') {
            borderRadiusValue = '0 0 40px 40px';
          } else if (type === 'egg') {
            borderRadiusValue = '0 0 50px 50px';
          } else if (type === 'shark') {
            borderRadiusValue = '0 10px 20px 20px';
          } else if (type === 'speech') {
            borderRadiusValue = '0 0 24px 24px';
          } else if (type === 'transparent' || type === 'blur') {
            borderRadiusValue = '0';
          } else {
            // Default: waving or other types - use rounded bottom corners
            borderRadiusValue = '0 0 24px 24px';
          }

          // For 'waving' type with parallax, render using API image for accurate wave preview
          if (type === 'waving' && props.parallaxEffect === true) {
            const wavePosition = props.wavePosition ?? 70;
            const waveAmplitude = props.waveAmplitude ?? 20;
            const waveSpeed = props.waveSpeed ?? 20;
            const waveFlip = props.waveFlip === true;

            const params = new URLSearchParams({
              type,
              section: 'footer',
              height: String(props.height ?? 80),
              text: String(props.text ?? 'Thanks for visiting!'),
              fontSize: String(props.fontSize ?? 24),
              fontColor: String(props.fontColor ?? 'ffffff').replace('#', ''),
              color: String(bgStartColor),
              colorEnd: String(bgEndColor),
              gradientDirection: bgGradientDirection,
              parallax: 'true',
              wavePosition: String(wavePosition),
              waveAmplitude: String(waveAmplitude),
              waveSpeed: String(waveSpeed),
              flipWave: waveFlip ? 'true' : 'false',
              textAlignX: String(props.textAlignX ?? 50),
              textAlignY: String(props.textAlignY ?? 50),
            });

            return (
              <img
                src={`/api/capsule?${params.toString()}`}
                alt="Footer Banner"
                className="w-full"
                style={{
                  height: `${props.height ?? 80}px`,
                  maxWidth: '896px',
                }}
              />
            );
          }

          // Special handling for transparent and blur types
          const isTransparent = type === 'transparent';
          const isBlur = type === 'blur';

          return (
            <div
              className="relative overflow-hidden"
              style={{
                width: '100%',
                maxWidth: '896px',
                height: `${props.height}px`,
                backgroundColor: isTransparent ? 'transparent' : normalizedSolidColor,
                borderRadius: borderRadiusValue,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...(isBlur ? { backdropFilter: 'blur(10px)' } : {}),
              }}
            >
              <span
                className="font-bold"
                style={{
                  fontSize: `${fontSize}px`,
                  color: fontColor,
                  position: 'absolute',
                  left: `${props.textAlignX ?? 50}%`,
                  top: `${props.textAlignY ?? 50}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 'max-content',
                }}
              >
                {props.text as string}
              </span>
            </div>
          );
        }

        // For gradient/animated types
        const startColor = bgStartColor?.startsWith('#') ? bgStartColor : `#${bgStartColor}`;
        const endColor = bgEndColor?.startsWith('#') ? bgEndColor : `#${bgEndColor}`;

        let gradientBgImage: string;
        switch (bgGradientDirection) {
          case 'horizontal':
            gradientBgImage = `linear-gradient(to right, ${startColor}, ${endColor})`;
            break;
          case 'vertical':
            gradientBgImage = `linear-gradient(to bottom, ${startColor}, ${endColor})`;
            break;
          case 'diagonal':
            gradientBgImage = `linear-gradient(135deg, ${startColor}, ${endColor})`;
            break;
          case 'radial':
            gradientBgImage = `radial-gradient(circle, ${startColor}, ${endColor})`;
            break;
          case 'conic':
            gradientBgImage = `conic-gradient(from 0deg, ${startColor}, ${endColor})`;
            break;
          default:
            gradientBgImage = `linear-gradient(to right, ${startColor}, ${endColor})`;
        }

        const section = (props.section as string) ?? 'footer';
        const type = (props.type as string) ?? 'waving';
        const fontSize = (props.fontSize as number) ?? 24;
        const fontColor = `#${normalizeHex((props.fontColor as string) ?? 'ffffff', 'ffffff')}`;

        // Normalize solid color for blur background
        const solidColorFB = normalizeHex(bgSolidColor, '3B82F6');
        const normalizedSolidColor = solidColorFB.startsWith('#')
          ? solidColorFB
          : `#${solidColorFB}`;

        // Apply animation for animated type
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

        // Get custom border radius from props if defined - use explicit check for undefined
        // Note: Add parentheses around ternary expressions to fix operator precedence issues
        // Footer banner always uses rounded bottom corners (matching Capsule Header header styling)
        const height = Number(props.height) || 80;
        const maxR = Math.floor(height / 2);
        const cornerTL = props.borderRadiusTL;
        const cornerTR = props.borderRadiusTR;
        const cornerBR = props.borderRadiusBR;
        const cornerBL = props.borderRadiusBL;
        const borderRadiusTL = cornerTL !== undefined ? Math.min(Number(cornerTL), maxR) : 0;
        const borderRadiusTR = cornerTR !== undefined ? Math.min(Number(cornerTR), maxR) : 0;
        const borderRadiusBR = cornerBR !== undefined ? Math.min(Number(cornerBR), maxR) : 24;
        const borderRadiusBL = cornerBL !== undefined ? Math.min(Number(cornerBL), maxR) : 24;

        const defaultRadiusValue =
          type === 'rect'
            ? '8px'
            : type === 'cylinder'
              ? '9999px'
              : type === 'soft'
                ? '36px'
                : type === 'slice'
                  ? '48px 10px 48px 10px'
                  : type === 'wave'
                    ? '0 0 40px 40px'
                    : type === 'egg'
                      ? '0 0 50px 50px'
                      : type === 'shark'
                        ? '0 10px 20px 20px'
                        : type === 'speech'
                          ? '0 0 24px 24px'
                          : type === 'transparent' || type === 'blur'
                            ? '0'
                            : section === 'footer'
                              ? '0 0 24px 24px'
                              : '24px 24px 0 0';

        const borderRadius =
          props.borderRadiusTL !== undefined ||
          props.borderRadiusTR !== undefined ||
          props.borderRadiusBR !== undefined ||
          props.borderRadiusBL !== undefined
            ? `${borderRadiusTL}px ${borderRadiusTR}px ${borderRadiusBR}px ${borderRadiusBL}px`
            : defaultRadiusValue;

        return (
          <div
            className={`relative overflow-hidden ${animationClass}`}
            style={{
              width: '100%',
              maxWidth: '896px',
              height: `${height}px`,
              backgroundImage: type === 'transparent' ? 'none' : gradientBgImage,
              backgroundColor:
                type === 'transparent'
                  ? 'transparent'
                  : type === 'blur'
                    ? normalizedSolidColor
                    : undefined,
              borderRadius,
              ...(type === 'blur' ? { backdropFilter: 'blur(10px)' } : {}),
              ...animationBgSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="font-bold" style={{ fontSize: `${fontSize}px`, color: fontColor }}>
              {props.text as string}
            </span>
          </div>
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
