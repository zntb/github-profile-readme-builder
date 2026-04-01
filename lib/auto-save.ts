'use client';

import { useCallback, useEffect, useRef } from 'react';

import { saveToActiveProfile, useProfileStore } from '@/lib/profiles';
import { useBuilderStore } from '@/lib/store';

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export function useAutoSave() {
  const blocks = useBuilderStore((s) => s.blocks);
  const username = useBuilderStore((s) => s.username);
  const lastSavedBlocks = useBuilderStore((s) => s.lastSavedBlocks);
  const saveToLocalStorage = useBuilderStore((s) => s.saveToLocalStorage);
  const loadFromLocalStorage = useBuilderStore((s) => s.loadFromLocalStorage);
  const isSaving = useBuilderStore((s) => s.isSaving);
  const setIsSaving = useBuilderStore((s) => s.setIsSaving);

  // Check for active profile
  const getActiveProfile = useProfileStore((s) => s.getActiveProfile);

  const hasUnsavedChanges = useCallback(() => {
    if (!lastSavedBlocks) return blocks.length > 0;
    return JSON.stringify(blocks) !== JSON.stringify(lastSavedBlocks);
  }, [blocks, lastSavedBlocks]);

  // Load from local storage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Auto-save interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasUnsavedChanges()) {
        setIsSaving(true);
        // Save to both local storage and active profile (if exists)
        saveToLocalStorage();
        const activeProfile = getActiveProfile();
        if (activeProfile) {
          saveToActiveProfile(blocks, username);
        }
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [hasUnsavedChanges, saveToLocalStorage, setIsSaving, getActiveProfile, blocks, username]);

  // Save on blocks change (debounced)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (hasUnsavedChanges()) {
        setIsSaving(true);
        saveToLocalStorage();
        // Also save to active profile if exists
        const activeProfile = getActiveProfile();
        if (activeProfile) {
          saveToActiveProfile(blocks, username);
        }
      }
    }, 2000); // 2 second debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [blocks, username, hasUnsavedChanges, saveToLocalStorage, setIsSaving, getActiveProfile]);

  return { isSaving, hasUnsavedChanges: hasUnsavedChanges() };
}
