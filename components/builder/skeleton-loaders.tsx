'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Base skeleton component with customizable dimensions
 */
function BlockSkeleton({
  className,
  variant = 'default',
}: {
  className?: string;
  variant?: 'default' | 'stats-card' | 'avatar' | 'heading' | 'text' | 'image' | 'badges';
}) {
  const variantClasses = {
    default: 'h-20 w-full',
    'stats-card': 'h-[195px] w-full',
    avatar: 'h-24 w-24 rounded-full',
    heading: 'h-8 w-3/4',
    text: 'h-4 w-full',
    image: 'h-48 w-full',
    badges: 'h-8 w-full',
  };

  return <Skeleton className={cn(variantClasses[variant], className)} />;
}

/**
 * Skeleton loader for GitHub stats card
 */
export function StatsCardSkeleton() {
  return (
    <div className="w-full">
      <BlockSkeleton variant="stats-card" />
    </div>
  );
}

/**
 * Skeleton loader for top languages card
 */
export function TopLanguagesSkeleton() {
  return (
    <div className="w-full space-y-3">
      <BlockSkeleton variant="stats-card" />
    </div>
  );
}

/**
 * Skeleton loader for streak stats
 */
export function StreakStatsSkeleton() {
  return (
    <div className="w-full">
      <BlockSkeleton variant="stats-card" />
    </div>
  );
}

/**
 * Skeleton loader for activity graph
 */
export function ActivityGraphSkeleton() {
  return (
    <div className="w-full">
      <BlockSkeleton variant="stats-card" className="h-[300px]" />
    </div>
  );
}

/**
 * Skeleton loader for trophies
 */
export function TrophiesSkeleton() {
  return (
    <div className="w-full">
      <BlockSkeleton variant="stats-card" className="h-[140px]" />
    </div>
  );
}

/**
 * Skeleton loader for avatar block
 */
export function AvatarSkeleton() {
  return (
    <div className="flex justify-center">
      <BlockSkeleton variant="avatar" />
    </div>
  );
}

/**
 * Skeleton loader for heading block
 */
export function HeadingSkeleton() {
  return (
    <div className="w-full">
      <BlockSkeleton variant="heading" />
    </div>
  );
}

/**
 * Skeleton loader for paragraph block
 */
export function ParagraphSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="w-full space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <BlockSkeleton key={i} variant="text" className={cn(i === lines - 1 && 'w-3/4')} />
      ))}
    </div>
  );
}

/**
 * Skeleton loader for image block
 */
export function ImageSkeleton() {
  return (
    <div className="w-full">
      <BlockSkeleton variant="image" />
    </div>
  );
}

/**
 * Skeleton loader for social badges
 */
export function SocialBadgesSkeleton() {
  return (
    <div className="flex gap-2 flex-wrap">
      {Array.from({ length: 4 }).map((_, i) => (
        <BlockSkeleton key={i} variant="badges" className="w-24 h-8" />
      ))}
    </div>
  );
}

/**
 * Skeleton loader for quote block
 */
export function QuoteSkeleton() {
  return (
    <div className="w-full space-y-2 border-l-4 border-muted-foreground/20 pl-4">
      <BlockSkeleton variant="text" className="h-6 w-5/6" />
      <BlockSkeleton variant="text" className="h-4 w-1/3" />
    </div>
  );
}

/**
 * Skeleton loader for code block
 */
export function CodeBlockSkeleton() {
  return (
    <div className="w-full space-y-2 rounded-lg bg-muted p-4">
      <BlockSkeleton variant="text" />
      <BlockSkeleton variant="text" className="w-5/6" />
      <BlockSkeleton variant="text" className="w-4/6" />
    </div>
  );
}

/**
 * Skeleton loader for skill icons
 */
export function SkillIconsSkeleton() {
  return (
    <div className="flex flex-wrap gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <BlockSkeleton key={i} className="w-10 h-10 rounded-lg" />
      ))}
    </div>
  );
}

/**
 * Skeleton loader for stats row (multiple stats cards)
 */
export function StatsRowSkeleton() {
  return (
    <div className="flex flex-row gap-3 justify-center">
      <div className="w-[49%]">
        <StatsCardSkeleton />
      </div>
      <div className="w-[49%]">
        <StatsCardSkeleton />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for capsule header
 */
export function CapsuleHeaderSkeleton() {
  return (
    <div className="w-full">
      <BlockSkeleton className="h-10 w-full rounded-full" />
    </div>
  );
}

/**
 * Skeleton loader for typing animation
 */
export function TypingAnimationSkeleton() {
  return (
    <div className="w-full">
      <BlockSkeleton className="h-8 w-2/3 mx-auto" />
    </div>
  );
}

/**
 * Skeleton loader for divider
 */
export function DividerSkeleton() {
  return (
    <div className="w-full h-4 flex items-center">
      <div className="w-full h-px bg-muted-foreground/20" />
    </div>
  );
}

/**
 * Skeleton loader for spacer
 */
export function SpacerSkeleton() {
  return <div className="w-full bg-muted/30 h-8" />;
}

/**
 * Skeleton loader for collapsible
 */
export function CollapsibleSkeleton() {
  return (
    <div className="w-full space-y-2">
      <BlockSkeleton className="h-6 w-1/3" />
      <div className="pl-4 space-y-2">
        <BlockSkeleton variant="text" />
        <BlockSkeleton variant="text" className="w-5/6" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for footer banner
 */
export function FooterBannerSkeleton() {
  return (
    <div className="w-full">
      <BlockSkeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}

/**
 * Skeleton loader for support link
 */
export function SupportLinkSkeleton() {
  return (
    <div className="w-full">
      <BlockSkeleton className="h-10 w-40 rounded-lg" />
    </div>
  );
}

/**
 * Skeleton loader for visitor counter
 */
export function VisitorCounterSkeleton() {
  return (
    <div className="w-full flex justify-center">
      <BlockSkeleton className="h-8 w-32" />
    </div>
  );
}

/**
 * Skeleton loader for custom badge
 */
export function CustomBadgeSkeleton() {
  return (
    <div className="w-full">
      <BlockSkeleton className="h-6 w-24 rounded-full" />
    </div>
  );
}

/**
 * Generic skeleton that takes block type as parameter
 */
export function BlockTypeSkeleton({ type }: { type: string }) {
  switch (type) {
    case 'stats-card':
      return <StatsCardSkeleton />;
    case 'top-languages':
      return <TopLanguagesSkeleton />;
    case 'streak-stats':
      return <StreakStatsSkeleton />;
    case 'activity-graph':
      return <ActivityGraphSkeleton />;
    case 'trophies':
      return <TrophiesSkeleton />;
    case 'avatar':
      return <AvatarSkeleton />;
    case 'heading':
      return <HeadingSkeleton />;
    case 'paragraph':
      return <ParagraphSkeleton />;
    case 'image':
      return <ImageSkeleton />;
    case 'gif':
      return <ImageSkeleton />;
    case 'social-badges':
      return <SocialBadgesSkeleton />;
    case 'quote':
      return <QuoteSkeleton />;
    case 'code-block':
      return <CodeBlockSkeleton />;
    case 'skill-icons':
      return <SkillIconsSkeleton />;
    case 'stats-row':
      return <StatsRowSkeleton />;
    case 'capsule-header':
      return <CapsuleHeaderSkeleton />;
    case 'typing-animation':
      return <TypingAnimationSkeleton />;
    case 'divider':
      return <DividerSkeleton />;
    case 'spacer':
      return <SpacerSkeleton />;
    case 'collapsible':
      return <CollapsibleSkeleton />;
    case 'footer-banner':
      return <FooterBannerSkeleton />;
    case 'support-link':
      return <SupportLinkSkeleton />;
    case 'visitor-counter':
      return <VisitorCounterSkeleton />;
    case 'custom-badge':
      return <CustomBadgeSkeleton />;
    case 'greeting':
      return <HeadingSkeleton />;
    default:
      return <BlockSkeleton />;
  }
}

/**
 * Loading overlay skeleton for the entire preview area
 */
export function PreviewLoadingSkeleton() {
  return (
    <div className="p-3 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-3 sm:p-6 shadow-lg space-y-4">
        {/* Simulate various blocks loading */}
        <AvatarSkeleton />
        <HeadingSkeleton />
        <ParagraphSkeleton lines={2} />
        <StatsRowSkeleton />
        <StatsCardSkeleton />
        <div className="flex gap-3">
          <div className="w-[49%]">
            <TopLanguagesSkeleton />
          </div>
          <div className="w-[49%]">
            <StreakStatsSkeleton />
          </div>
        </div>
        <ActivityGraphSkeleton />
      </div>
    </div>
  );
}

/**
 * Skeleton for canvas area when loading
 */
export function CanvasLoadingSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/30"
        >
          <div className="w-8 h-8 rounded bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-muted/70 rounded animate-pulse" />
          </div>
          <div className="w-6 h-6 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for block sidebar when loading
 */
export function BlockSidebarSkeleton() {
  return (
    <div className="w-64 border-r border-border/50 bg-card/30 p-4 space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-3 w-16 bg-muted/70 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded">
            <div className="w-8 h-8 rounded bg-muted animate-pulse" />
            <div className="flex-1">
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 w-full bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
