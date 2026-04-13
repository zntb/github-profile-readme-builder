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
 * Build a relative /api/capsule URL from block props.
 * This ensures the Live Preview renders identically to GitHub,
 * which fetches the same endpoint when embedding the image.
 */
function buildCapsulePreviewUrl(
  props: Record<string, unknown>,
  defaultSection: string = 'header',
): string {
  // Support both new format (bgStartColor/bgEndColor) and legacy format (color)
  const bgType = (props.bgType as string) ?? 'gradient';
  let bgStartColor = props.bgStartColor as string;
  let bgEndColor = props.bgEndColor as string;

  // Parse legacy color format ONLY if modern properties are NOT present
  if (!bgStartColor && !bgEndColor && props.color) {
    const colorValue = props.color as string;
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
  const bgSolidColor = (props.bgSolidColor as string) ?? 'EEFF00';
  const bgGradientDirection = (props.bgGradientDirection as string) ?? 'horizontal';

  const bgColor = bgType === 'solid' ? bgSolidColor || 'EEFF00' : bgStartColor || 'EEFF00';
  const colorEnd = bgType !== 'solid' ? bgEndColor || 'A82DAA' : '';

  const params: Record<string, string> = {
    type: (props.type as string) ?? 'waving',
    color: bgColor,
    height: String(props.height ?? 200),
    section: (props.section as string) ?? defaultSection,
    fontSize: String(props.fontSize ?? 30),
    fontColor: ((props.fontColor as string) ?? 'ffffff').replace('#', ''),
    animation: (props.bgAnimation as string) ?? 'none',
    gradientDirection: bgGradientDirection,
    parallax: String(props.parallaxEffect === true),
    wavePosition: String(props.wavePosition ?? 70),
    waveAmplitude: String(props.waveAmplitude ?? 20),
    waveSpeed: String(props.waveSpeed ?? 20),
    flipWave: String(props.waveFlip === true),
    textAlignX: String(props.textAlignX ?? 50),
    textAlignY: String(props.textAlignY ?? 50),
  };

  if (colorEnd) params.colorEnd = colorEnd;
  if (props.text) params.text = String(props.text);
  if (props.borderRadiusTL !== undefined) params.rtl = String(props.borderRadiusTL);
  if (props.borderRadiusTR !== undefined) params.rtr = String(props.borderRadiusTR);
  if (props.borderRadiusBR !== undefined) params.rbr = String(props.borderRadiusBR);
  if (props.borderRadiusBL !== undefined) params.rbl = String(props.borderRadiusBL);

  return `/api/capsule?${new URLSearchParams(params).toString()}`;
}

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
    'wakatime-stats',
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
          case 'wakatime-stats': {
            const username = getUsername(block.props.username as string);
            if (username) {
              const params = new URLSearchParams({
                username,
                theme: block.props.theme as string,
                hide_border: block.props.hideBorder ? 'true' : 'false',
                border_radius: String(block.props.borderRadius ?? 4),
                hide_title: block.props.hideTitle ? 'true' : 'false',
                hide_recent: block.props.hideRecent ? 'true' : 'false',
                hide_editors: block.props.hideEditors ? 'true' : 'false',
                hide_languages: block.props.hideLanguages ? 'true' : 'false',
                hide_operating_systems: block.props.hideOperatingSystems ? 'true' : 'false',
              });
              urlSet.add(`/api/wakatime?${params.toString()}`);
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
            setImageStates((prev: Map<string, ImageState>) => {
              const newStates = new Map(prev);
              newStates.set(url, { loading: false, data: dataUrl, error: null });
              return newStates;
            });
          }
        } catch (error) {
          if (!isCancelled) {
            setImageStates((prev: Map<string, ImageState>) => {
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

    setImageStates((prev: Map<string, ImageState>) => {
      const newStates = new Map(prev);
      for (const url of urls) {
        const currentState = prev.get(url);
        newStates.set(url, { loading: true, data: currentState?.data ?? null, error: null });
      }
      return newStates;
    });

    Promise.all(
      urls.map(async (url: string) => {
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
      setImageStates((prev: Map<string, ImageState>) => {
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
  if (!['stats-card', 'top-languages', 'streak-stats', 'wakatime-stats'].includes(block.type))
    return false;
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
    'wakatime-stats',
  ];
  if (!apiBlockTypes.includes(block.type)) return false;

  // Quote blocks don't need a username, handle separately
  if (block.type === 'quote') {
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
    case 'wakatime-stats': {
      const params = new URLSearchParams({
        username,
        theme: (block.props.theme as string) || 'default',
        hide_border: block.props.hideBorder ? 'true' : 'false',
        border_radius: String(block.props.borderRadius ?? 4),
        hide_title: block.props.hideTitle ? 'true' : 'false',
        hide_recent: block.props.hideRecent ? 'true' : 'false',
        hide_editors: block.props.hideEditors ? 'true' : 'false',
        hide_languages: block.props.hideLanguages ? 'true' : 'false',
        hide_operating_systems: block.props.hideOperatingSystems ? 'true' : 'false',
      });
      return `/api/wakatime?${params.toString()}`;
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

  const propsKey = useMemo(() => JSON.stringify(props), [props]);
  const childrenKey = useMemo(
    () => children?.map((child) => `${child.id}:${JSON.stringify(child.props)}`).join(',') ?? '',
    [children],
  );

  const getPrefetchedSrc = (url: string): string | undefined => {
    const state: ImageState | undefined = prefetchedImages?.get(url);
    return state?.data ?? undefined;
  };

  const getUsername = (blockUsername: string) => {
    return (!blockUsername || blockUsername === 'github') && globalUsername
      ? globalUsername
      : blockUsername;
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  const renderBlock = useMemo(() => {
    switch (type) {
      case 'stats-row': {
        const direction = (props.direction as 'row' | 'column') ?? 'row';
        const gap = Number(props.gap ?? 12);
        const cardWidth = (props.cardWidth as string) || '49%';
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
        // Support both new format (bgStartColor/bgEndColor) and legacy format (color)
        let bgType = (props.bgType as string) ?? 'solid';
        let bgStartColor = props.bgStartColor as string;
        let bgEndColor = props.bgEndColor as string;
        let bgSolidColor = props.bgSolidColor as string;

        // Parse legacy color format ONLY if modern properties are NOT present
        if (!bgStartColor && !bgEndColor && !bgSolidColor && props.color) {
          const colorValue = props.color as string;
          // Legacy format might be a single color or comma-separated
          if (colorValue.includes(',')) {
            const colorParts = colorValue.split(',');
            if (colorParts.length >= 2) {
              const startMatch = colorParts[0].match(/\d+:([0-9a-fA-F]+)/);
              const endMatch = colorParts[1].match(/\d+:([0-9a-fA-F]+)/);
              if (startMatch) bgStartColor = startMatch[1].toUpperCase();
              if (endMatch) bgEndColor = endMatch[1].toUpperCase();
              bgType = 'gradient';
            }
          } else {
            // Single color - treat as solid
            bgSolidColor = colorValue.replace('#', '').toUpperCase();
            bgType = 'solid';
          }
        }

        bgSolidColor = bgSolidColor ?? 'CCCCCC';
        bgStartColor = bgStartColor ?? 'CCCCCC';
        bgEndColor = bgEndColor ?? '999999';

        const thickness = (props.thickness as number) ?? 2;
        const alignment = (props.alignment as string) ?? 'center';
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

      /**
       * capsule-header — always render via /api/capsule so the Live Preview
       * matches exactly what GitHub displays when it fetches the same URL.
       */
      case 'capsule-header': {
        const capsuleUrl = buildCapsulePreviewUrl(props, 'header');
        return (
          <img
            src={capsuleUrl}
            alt="Capsule Header"
            style={{ width: '100%', height: `${props.height ?? 200}px`, display: 'block' }}
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

      case 'wakatime-stats': {
        const wakatimeParams = new URLSearchParams({
          username: getUsername(props.username as string),
          theme: props.theme as string,
          hide_border: props.hideBorder ? 'true' : 'false',
          border_radius: String(props.borderRadius ?? 4),
          hide_title: props.hideTitle ? 'true' : 'false',
          hide_recent: props.hideRecent ? 'true' : 'false',
          hide_editors: props.hideEditors ? 'true' : 'false',
          hide_languages: props.hideLanguages ? 'true' : 'false',
          hide_operating_systems: props.hideOperatingSystems ? 'true' : 'false',
        });
        const wakatimeUrl = `/api/wakatime?${wakatimeParams.toString()}`;
        const prefetchedWakatimeSrc = getPrefetchedSrc(wakatimeUrl);
        return (
          <img
            src={prefetchedWakatimeSrc ?? wakatimeUrl}
            alt="Wakatime Stats"
            style={imageSizeStyle}
          />
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
        const alignment = (props.alignment as string) ?? 'center';
        return (
          <div style={{ textAlign: alignment as 'left' | 'center' | 'right' }}>
            <img
              src={visitorUrl}
              alt="Profile Views"
              style={{ height: 'auto', display: 'inline-block' }}
            />
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

      /**
       * footer-banner — always render via /api/capsule so the Live Preview
       * matches exactly what GitHub displays when it fetches the same URL.
       * resolveFooterBannerColors() ensures both legacy (waveColor) and modern
       * (bgStartColor / bgEndColor) props produce the correct colours.
       */
      case 'footer-banner': {
        const { bgStartColor, bgEndColor } = resolveFooterBannerColors(props);
        const footerProps: Record<string, unknown> = {
          ...props,
          bgStartColor,
          bgEndColor,
          // footer-banner always renders as footer section
          section: 'footer',
        };
        const capsuleUrl = buildCapsulePreviewUrl(footerProps, 'footer');
        return (
          <img
            src={capsuleUrl}
            alt="Footer Banner"
            style={{ width: '100%', height: `${props.height ?? 100}px`, display: 'block' }}
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
