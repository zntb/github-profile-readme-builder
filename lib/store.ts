import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Block, Template } from './types';

interface BuilderState {
  blocks: Block[];
  selectedBlockId: string | null;
  isDragging: boolean;
  username: string;

  // Actions
  addBlock: (block: Block, index?: number) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, props: Record<string, unknown>) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  selectBlock: (id: string | null) => void;
  setBlocks: (blocks: Block[]) => void;
  setIsDragging: (isDragging: boolean) => void;
  duplicateBlock: (id: string) => void;
  clearBlocks: () => void;
  loadTemplate: (template: Template) => void;
  addChildBlock: (parentId: string, block: Block) => void;
  setUsername: (username: string) => void;
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

      addBlock: (block, index) => {
        set((state) => {
          const newBlocks = [...state.blocks];
          if (index !== undefined) {
            newBlocks.splice(index, 0, block);
          } else {
            newBlocks.push(block);
          }
          return { blocks: newBlocks, selectedBlockId: block.id };
        });
      },

      removeBlock: (id) => {
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
          };
        });
      },

      updateBlock: (id, props) => {
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
          return { blocks: updateInArray(state.blocks) };
        });
      },

      moveBlock: (fromIndex, toIndex) => {
        set((state) => {
          const newBlocks = [...state.blocks];
          const [removed] = newBlocks.splice(fromIndex, 1);
          newBlocks.splice(toIndex, 0, removed);
          return { blocks: newBlocks };
        });
      },

      selectBlock: (id) => {
        set({ selectedBlockId: id });
      },

      setBlocks: (blocks) => {
        set({ blocks });
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
        set({ blocks: [], selectedBlockId: null });
      },

      loadTemplate: (template) => {
        const assignNewIds = (blocks: Block[]): Block[] => {
          return blocks.map((block) => ({
            ...block,
            id: generateId(),
            children: block.children ? assignNewIds(block.children) : undefined,
          }));
        };
        set({ blocks: assignNewIds(template.blocks), selectedBlockId: null });
      },

      addChildBlock: (parentId, block) => {
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
          return { blocks: addToParent(state.blocks), selectedBlockId: block.id };
        });
      },

      setUsername: (username) => {
        set({ username });
      },
    }),
    {
      name: 'github-readme-builder-storage',
      partialize: (state) => ({ username: state.username }),
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
