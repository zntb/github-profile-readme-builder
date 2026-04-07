'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Tracks the last time GitHub data was synced.
 * Useful for showing users when their profile data was last refreshed.
 */
export function useLastSynced() {
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);
  const staleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update last synced time
  const updateLastSynced = () => {
    const now = new Date();
    setLastSynced(now);
    setIsStale(false);

    // Set stale after 5 minutes
    if (staleTimeoutRef.current) {
      clearTimeout(staleTimeoutRef.current);
    }
    staleTimeoutRef.current = setTimeout(
      () => {
        setIsStale(true);
      },
      5 * 60 * 1000,
    );
  };

  // Clear the timer on unmount
  useEffect(() => {
    return () => {
      if (staleTimeoutRef.current) {
        clearTimeout(staleTimeoutRef.current);
      }
    };
  }, []);

  return {
    lastSynced,
    isStale,
    updateLastSynced,
    formattedTime: lastSynced
      ? lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null,
    relativeTime: lastSynced ? getRelativeTime(lastSynced) : null,
  };
}

/**
 * Format a date as relative time (e.g., "2 minutes ago")
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

/**
 * Component to display last synced timestamp.
 * Shows "Last updated" with relative time and stale indicator.
 */
export function LastSyncedDisplay({
  lastSynced,
  isStale,
  relativeTime,
}: {
  lastSynced: Date | null;
  isStale: boolean;
  relativeTime: string | null;
}) {
  if (!lastSynced || !relativeTime) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>Last synced: {relativeTime}</span>
      {isStale && (
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          Stale
        </span>
      )}
    </div>
  );
}
