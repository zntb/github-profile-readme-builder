'use client';

import { toast } from 'sonner';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Block, Profile } from './types';

const STORAGE_KEY = 'github-readme-builder-profiles';

interface ProfileState {
  profiles: Profile[];
  activeProfileId: string | null;

  // Actions
  createProfile: (name: string, blocks: Block[], username: string) => string;
  updateProfile: (id: string, updates: Partial<Omit<Profile, 'id' | 'createdAt'>>) => void;
  deleteProfile: (id: string) => void;
  duplicateProfile: (id: string) => string | null;
  loadProfile: (id: string) => Profile | null;
  setActiveProfile: (id: string | null) => void;
  getProfile: (id: string) => Profile | undefined;
  getProfileByIndex: (index: number) => Profile | undefined;
  getActiveProfile: () => Profile | null;
  renameProfile: (id: string, newName: string) => void;
}

function generateProfileId(): string {
  return `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,

      createProfile: (name, blocks, username) => {
        const id = generateProfileId();
        const now = new Date().toISOString();

        const newProfile: Profile = {
          id,
          name,
          blocks: JSON.parse(JSON.stringify(blocks)),
          username,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          profiles: [...state.profiles, newProfile],
          activeProfileId: id,
        }));

        toast.success(`Profile "${name}" created`);
        return id;
      },

      updateProfile: (id, updates) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p,
          ),
        }));
      },

      deleteProfile: (id) => {
        const state = get();
        const profileToDelete = state.profiles.find((p) => p.id === id);

        set((state) => {
          const newProfiles = state.profiles.filter((p) => p.id !== id);
          let newActiveId = state.activeProfileId;

          // If deleting active profile, switch to most recent or null
          if (state.activeProfileId === id) {
            newActiveId = newProfiles.length > 0 ? newProfiles[newProfiles.length - 1].id : null;
          }

          return {
            profiles: newProfiles,
            activeProfileId: newActiveId,
          };
        });

        if (profileToDelete) {
          toast.success(`Profile "${profileToDelete.name}" deleted`);
        }
      },

      duplicateProfile: (id) => {
        const state = get();
        const profile = state.profiles.find((p) => p.id === id);

        if (!profile) return null;

        const newId = generateProfileId();
        const now = new Date().toISOString();
        const newName = `${profile.name} (Copy)`;

        const newProfile: Profile = {
          id: newId,
          name: newName,
          blocks: JSON.parse(JSON.stringify(profile.blocks)),
          username: profile.username,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          profiles: [...state.profiles, newProfile],
          activeProfileId: newId,
        }));

        toast.success(`Profile duplicated as "${newName}"`);
        return newId;
      },

      loadProfile: (id) => {
        const profile = get().profiles.find((p) => p.id === id);
        if (profile) {
          set({ activeProfileId: id });
        }
        return profile || null;
      },

      setActiveProfile: (id) => {
        set({ activeProfileId: id });
      },

      getProfile: (id) => {
        return get().profiles.find((p) => p.id === id);
      },

      getProfileByIndex: (index) => {
        return get().profiles[index];
      },

      getActiveProfile: () => {
        const state = get();
        if (!state.activeProfileId) return null;
        return state.profiles.find((p) => p.id === state.activeProfileId) || null;
      },

      renameProfile: (id, newName) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, name: newName, updatedAt: new Date().toISOString() } : p,
          ),
        }));
        toast.success(`Profile renamed to "${newName}"`);
      },
    }),
    {
      name: STORAGE_KEY,
    },
  ),
);

// Helper function to save current state to active profile
export function saveToActiveProfile(blocks: Block[], username: string) {
  const store = useProfileStore.getState();
  const activeProfile = store.getActiveProfile();

  if (activeProfile) {
    store.updateProfile(activeProfile.id, { blocks, username });
    return true;
  }

  // No active profile - save to localStorage as fallback for auto-save
  localStorage.setItem('github-readme-builder-autosave', JSON.stringify({ blocks, username }));
  return false;
}

// Helper to check if there are any saved profiles
export function hasProfiles(): boolean {
  return useProfileStore.getState().profiles.length > 0;
}
