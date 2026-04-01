'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="h-screen flex flex-col bg-background gradient-bg">
      {/* Header Skeleton */}
      <div className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-sm px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar/Blocks Skeleton */}
        <div className="hidden lg:flex w-64 border-r border-border/50 bg-card/30 p-4 flex-col gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded">
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>

        {/* Canvas Skeleton */}
        <div className="flex-1 p-4 sm:p-8">
          <div className="mx-auto max-w-4xl space-y-4">
            <Skeleton className="h-6 w-32 mb-6" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/30"
              >
                <Skeleton className="w-8 h-8 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="w-6 h-6 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel (Preview/Config) Skeleton */}
        <div className="w-80 xl:w-96 border-l border-border/50 bg-card/50 backdrop-blur-sm flex flex-col">
          {/* Username Input */}
          <div className="border-b border-border/50 p-3">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-8 w-full" />
          </div>

          {/* Profile Quality */}
          <div className="p-3 border-b border-border/50">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-2 w-full" />
          </div>

          {/* Tabs */}
          <div className="border-b border-border/50 p-2">
            <Skeleton className="h-8 w-full rounded" />
          </div>

          {/* Preview Content */}
          <div className="flex-1 p-3 sm:p-6">
            <div className="space-y-4">
              <Skeleton className="h-24 w-24 rounded-full mx-auto" />
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-3">
                <Skeleton className="h-[195px] w-[49%]" />
                <Skeleton className="h-[195px] w-[49%]" />
              </div>
              <Skeleton className="h-[300px] w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Skeleton - hidden on desktop, shown on mobile */}
      <div className="md:hidden h-16 border-t border-border/50 bg-card/50 flex items-center justify-around">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}
