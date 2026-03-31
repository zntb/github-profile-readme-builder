import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Block, BlockType, Template } from './types';

export const MAX_HISTORY_STATES = 20;

interface HistoryState {
  past: Block[][];
  future: Block[][];
}

interface BuilderState {
  blocks: Block[];
  selectedBlockId: string | null;
  isDragging: boolean;
  username: string;
  recentBlockTypes: BlockType[];

  // History state
  history: HistoryState;

  // Auto-save state
  lastSavedBlocks: Block[] | null;
  isSaving: boolean;
  lastSavedAt: Date | null;

  // Actions
  addBlock: (block: Block, index?: number) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, props: Record<string, unknown>) => void;
  updateBlockChildren: (id: string, children: Block[]) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  selectBlock: (id: string | null) => void;
  setBlocks: (blocks: Block[]) => void;
  setIsDragging: (isDragging: boolean) => void;
  duplicateBlock: (id: string) => void;
  clearBlocks: () => void;
  loadTemplate: (template: Template) => void;
  addChildBlock: (parentId: string, block: Block) => void;
  setUsername: (username: string) => void;
  addToRecentBlocks: (type: BlockType) => void;

  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Auto-save actions
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  setIsSaving: (isSaving: boolean) => void;
  updateLastSavedAt: () => void;
}

// Generate unique ID
export function generateId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      blocks: [],
      selectedBlockId: null,
      isDragging: false,
      username: '',
      recentBlockTypes: [],

      // History state
      history: {
        past: [],
        future: [],
      },

      // Auto-save state
      lastSavedBlocks: null,
      isSaving: false,
      lastSavedAt: null,

      addBlock: (block, index) => {
        const state = get();
        // Push current state to history before making changes
        const newPast = [...state.history.past, state.blocks].slice(-MAX_HISTORY_STATES);

        set((state) => {
          const newBlocks = [...state.blocks];
          if (index !== undefined) {
            newBlocks.splice(index, 0, block);
          } else {
            newBlocks.push(block);
          }
          return {
            blocks: newBlocks,
            selectedBlockId: block.id,
            history: {
              past: newPast,
              future: [],
            },
          };
        });
      },

      removeBlock: (id) => {
        const state = get();
        const newPast = [...state.history.past, state.blocks].slice(-MAX_HISTORY_STATES);

        set((state) => {
          const removeFromArray = (blocks: Block[]): Block[] => {
            return blocks.filter((block) => {
              if (block.id === id) return false;
              if (block.children) {
                block.children = removeFromArray(block.children);
              }
              return true;
            });
          };
          return {
            blocks: removeFromArray(state.blocks),
            selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
            history: {
              past: newPast,
              future: [],
            },
          };
        });
      },

      updateBlock: (id, props) => {
        const state = get();
        const newPast = [...state.history.past, state.blocks].slice(-MAX_HISTORY_STATES);

        set((state) => {
          const updateInArray = (blocks: Block[]): Block[] => {
            return blocks.map((block) => {
              if (block.id === id) {
                return { ...block, props: { ...block.props, ...props } };
              }
              if (block.children) {
                return { ...block, children: updateInArray(block.children) };
              }
              return block;
            });
          };
          return {
            blocks: updateInArray(state.blocks),
            history: {
              past: newPast,
              future: [],
            },
          };
        });
      },

      updateBlockChildren: (id, children) => {
        const state = get();
        const newPast = [...state.history.past, state.blocks].slice(-MAX_HISTORY_STATES);

        set((state) => {
          const updateInArray = (blocks: Block[]): Block[] => {
            return blocks.map((block) => {
              if (block.id === id) {
                return { ...block, children };
              }
              if (block.children) {
                return { ...block, children: updateInArray(block.children) };
              }
              return block;
            });
          };
          return {
            blocks: updateInArray(state.blocks),
            history: {
              past: newPast,
              future: [],
            },
          };
        });
      },

      moveBlock: (fromIndex, toIndex) => {
        const state = get();
        const newPast = [...state.history.past, state.blocks].slice(-MAX_HISTORY_STATES);

        set((state) => {
          const newBlocks = [...state.blocks];
          const [removed] = newBlocks.splice(fromIndex, 1);
          newBlocks.splice(toIndex, 0, removed);
          return {
            blocks: newBlocks,
            history: {
              past: newPast,
              future: [],
            },
          };
        });
      },

      selectBlock: (id) => {
        set({ selectedBlockId: id });
      },

      setBlocks: (blocks) => {
        const state = get();
        const newPast = [...state.history.past, state.blocks].slice(-MAX_HISTORY_STATES);

        set({
          blocks,
          history: {
            past: newPast,
            future: [],
          },
        });
      },

      setIsDragging: (isDragging) => {
        set({ isDragging });
      },

      duplicateBlock: (id) => {
        const state = get();
        const findBlock = (blocks: Block[]): Block | null => {
          for (const block of blocks) {
            if (block.id === id) return block;
            if (block.children) {
              const found = findBlock(block.children);
              if (found) return found;
            }
          }
          return null;
        };

        const blockToDuplicate = findBlock(state.blocks);
        if (blockToDuplicate) {
          const duplicateWithNewIds = (block: Block): Block => ({
            ...block,
            id: generateId(),
            children: block.children?.map(duplicateWithNewIds),
          });

          const duplicated = duplicateWithNewIds(blockToDuplicate);
          const index = state.blocks.findIndex((b) => b.id === id);
          state.addBlock(duplicated, index + 1);
        }
      },

      clearBlocks: () => {
        const state = get();
        if (state.blocks.length === 0) return;
        const newPast = [...state.history.past, state.blocks].slice(-MAX_HISTORY_STATES);

        set({
          blocks: [],
          selectedBlockId: null,
          history: {
            past: newPast,
            future: [],
          },
        });
      },

      loadTemplate: (template) => {
        const state = get();
        const newPast = [...state.history.past, state.blocks].slice(-MAX_HISTORY_STATES);

        const assignNewIds = (blocks: Block[]): Block[] => {
          return blocks.map((block) => ({
            ...block,
            id: generateId(),
            children: block.children ? assignNewIds(block.children) : undefined,
          }));
        };
        set({
          blocks: assignNewIds(template.blocks),
          selectedBlockId: null,
          history: {
            past: newPast,
            future: [],
          },
        });
      },

      addChildBlock: (parentId, block) => {
        const state = get();
        const newPast = [...state.history.past, state.blocks].slice(-MAX_HISTORY_STATES);

        set((state) => {
          const addToParent = (blocks: Block[]): Block[] => {
            return blocks.map((b) => {
              if (b.id === parentId) {
                return { ...b, children: [...(b.children || []), block] };
              }
              if (b.children) {
                return { ...b, children: addToParent(b.children) };
              }
              return b;
            });
          };
          return {
            blocks: addToParent(state.blocks),
            selectedBlockId: block.id,
            history: {
              past: newPast,
              future: [],
            },
          };
        });
      },

      setUsername: (username) => {
        set({ username });
      },

      addToRecentBlocks: (type) => {
        set((state) => {
          const filtered = state.recentBlockTypes.filter((t) => t !== type);
          const newRecent = [type, ...filtered].slice(0, 8);
          return { recentBlockTypes: newRecent };
        });
      },

      // History methods
      undo: () => {
        const state = get();
        if (state.history.past.length === 0) return;

        const previous = state.history.past[state.history.past.length - 1];
        const newPast = state.history.past.slice(0, -1);

        set({
          blocks: previous,
          history: {
            past: newPast,
            future: [state.blocks, ...state.history.future],
          },
        });
      },

      redo: () => {
        const state = get();
        if (state.history.future.length === 0) return;

        const next = state.history.future[0];
        const newFuture = state.history.future.slice(1);

        set({
          blocks: next,
          history: {
            past: [...state.history.past, state.blocks],
            future: newFuture,
          },
        });
      },

      canUndo: () => get().history.past.length > 0,

      canRedo: () => get().history.future.length > 0,

      // Auto-save methods
      saveToLocalStorage: () => {
        const state = get();
        // Deep clone blocks to avoid reference issues
        const blocksJson = JSON.stringify(state.blocks);
        localStorage.setItem('github-readme-builder-autosave', blocksJson);
        set({
          lastSavedBlocks: JSON.parse(blocksJson),
          isSaving: false,
          lastSavedAt: new Date(),
        });
      },

      loadFromLocalStorage: () => {
        const saved = localStorage.getItem('github-readme-builder-autosave');
        if (saved) {
          try {
            const blocks = JSON.parse(saved) as Block[];
            set({
              blocks,
              lastSavedBlocks: blocks,
              history: { past: [], future: [] },
            });
            return true;
          } catch {
            return false;
          }
        }
        return false;
      },

      setIsSaving: (isSaving) => {
        set({ isSaving });
      },

      updateLastSavedAt: () => {
        set({ lastSavedAt: new Date() });
      },
    }),
    {
      name: 'github-readme-builder-storage',
      partialize: (state) => ({
        username: state.username,
        recentBlockTypes: state.recentBlockTypes,
      }),
    },
  ),
);

// Find a block by ID
export function findBlock(blocks: Block[], id: string): Block | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findBlock(block.children, id);
      if (found) return found;
    }
  }
  return null;
}
