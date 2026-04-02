'use client';

import { useEffect } from 'react';

import { useBuilderStore } from './store';
import { clearUrlState, getUrlState, hasUrlState } from './url-state';

/**
 * Hook to handle URL state loading on mount
 * Parses URL parameters and loads shared state into the builder
 */
export function useUrlStateLoader() {
  const loadFromUrl = useBuilderStore((s) => s.loadFromUrl);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Check if URL has state parameter
    if (!hasUrlState()) {
      return;
    }

    // Get state from URL
    const state = getUrlState();
    if (state && state.blocks.length > 0) {
      // Load state into store
      loadFromUrl(state.blocks, state.username);
      // Clear URL after loading to keep the URL clean
      clearUrlState();
    }
  }, [loadFromUrl]);
}
