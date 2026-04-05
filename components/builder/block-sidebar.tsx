'use client';

import {
  Activity,
  AlignLeft,
  Award,
  Badge,
  BarChart2,
  Box,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  Columns2,
  Eye,
  Film,
  Flame,
  Hand,
  Heading,
  Heart,
  Image,
  Layers,
  Layout,
  Minus,
  PanelBottom,
  PieChart,
  Quote,
  Search,
  Share2,
  Space,
  Sparkles,
  Type,
  User,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { generateId, useBuilderStore } from '@/lib/store';
import { BLOCK_CATEGORIES, type Block, type BlockType } from '@/lib/types';
import { cn } from '@/lib/utils';

import { BlockTooltipPreview, getBlockDescription } from './block-tooltip-preview';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layout,
  Minus,
  Space,
  Sparkles,
  User,
  Hand,
  Type,
  Heading,
  AlignLeft,
  ChevronDown,
  Code,
  Image,
  Film,
  Share2,
  Badge,
  Layers,
  BarChart2,
  PieChart,
  Flame,
  Activity,
  Award,
  Eye,
  Quote,
  PanelBottom,
  Box,
  Columns2,
  Heart,
};

function findBlockById(items: Block[], id: string): Block | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children?.length) {
      const nested = findBlockById(item.children, id);
      if (nested) return nested;
    }
  }
  return null;
}

// Flatten all blocks for search
function getAllBlocks() {
  const blocks: {
    type: BlockType;
    label: string;
    icon: string;
    defaultProps: Record<string, unknown>;
    category: string;
  }[] = [];
  BLOCK_CATEGORIES.forEach((category) => {
    category.blocks.forEach((block) => {
      blocks.push({ ...block, category: category.name });
    });
  });
  return blocks;
}

export function BlockSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    BLOCK_CATEGORIES.map((c) => c.name),
  );
  const addBlock = useBuilderStore((s) => s.addBlock);
  const addChildBlock = useBuilderStore((s) => s.addChildBlock);
  const blocks = useBuilderStore((s) => s.blocks);
  const selectedBlockId = useBuilderStore((s) => s.selectedBlockId);
  const username = useBuilderStore((s) => s.username);
  const recentBlockTypes = useBuilderStore((s) => s.recentBlockTypes);
  const addToRecentBlocks = useBuilderStore((s) => s.addToRecentBlocks);

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  };

  // GitHub stats block types that need username
  const GITHUB_STATS_BLOCKS = [
    'stats-card',
    'top-languages',
    'streak-stats',
    'activity-graph',
    'trophies',
    'visitor-counter',
  ];
  const STATS_ROW_CHILD_BLOCKS: BlockType[] = ['stats-card', 'top-languages', 'streak-stats'];
  const selectedBlock = selectedBlockId ? findBlockById(blocks, selectedBlockId) : null;

  const createBlock = (type: BlockType, defaultProps: Record<string, unknown>): Block => {
    const props = { ...defaultProps };
    if (username && GITHUB_STATS_BLOCKS.includes(type)) {
      props.username = username;
    }

    if (STATS_ROW_CHILD_BLOCKS.includes(type)) {
      props.layoutWidth = 'half';
    }

    return {
      id: generateId(),
      type,
      props,
      children: type === 'collapsible' ? [] : undefined,
    };
  };

  const handleAddBlock = (type: BlockType, defaultProps: Record<string, unknown>) => {
    // Add to recent blocks
    addToRecentBlocks(type);

    if (
      selectedBlock?.type === 'stats-row' &&
      STATS_ROW_CHILD_BLOCKS.includes(type) &&
      selectedBlock.children &&
      selectedBlock.children.length < 2
    ) {
      addChildBlock(selectedBlock.id, createBlock(type, defaultProps));
      return;
    }

    const block = createBlock(type, defaultProps);
    const blockUsername = (block.props.username as string) || 'github';
    const defaultChildren: Block[] | undefined =
      type === 'stats-row'
        ? [
            {
              id: generateId(),
              type: 'stats-card',
              props: {
                username: blockUsername,
                theme: 'tokyonight',
                showIcons: true,
                hideBorder: false,
                hideTitle: false,
                hideRank: false,
                borderRadius: 10,
                layoutWidth: 'half',
              },
            },
            {
              id: generateId(),
              type: 'top-languages',
              props: {
                username: blockUsername,
                theme: 'tokyonight',
                layout: 'compact',
                hideBorder: false,
                hideProgress: false,
                langs_count: 8,
                borderRadius: 10,
                layoutWidth: 'half',
              },
            },
          ]
        : undefined;

    addBlock({
      id: block.id,
      type: block.type,
      props: block.props,
      children: type === 'stats-row' ? defaultChildren : undefined,
    });
  };

  const allBlocks = useMemo(() => getAllBlocks(), []);

  // Get recent blocks with their full info
  const recentBlocks = useMemo(() => {
    return recentBlockTypes
      .map((type) => allBlocks.find((b) => b.type === type))
      .filter((b): b is (typeof allBlocks)[0] => b !== undefined);
  }, [recentBlockTypes, allBlocks]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allBlocks.filter(
      (block) =>
        block.label.toLowerCase().includes(query) ||
        block.type.toLowerCase().includes(query) ||
        block.category.toLowerCase().includes(query),
    );
  }, [searchQuery, allBlocks]);

  // Filtered categories (when not searching)
  const filteredCategories = useMemo(
    () =>
      BLOCK_CATEGORIES.map((category) => ({
        ...category,
        blocks: category.blocks.filter(
          (block) =>
            block.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            block.type.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      })).filter((category) => category.blocks.length > 0),
    [searchQuery],
  );

  const handleSearchFocus = () => setIsSearching(true);
  const handleSearchBlur = () => {
    // Delay to allow click on results
    setTimeout(() => setIsSearching(false), 200);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  return (
    <div className="flex h-full w-full lg:w-76 flex-col border-r border-border bg-sidebar/50 backdrop-blur-sm">
      <div className="border-b border-border p-4 bg-gradient-to-b from-card/50 to-transparent">
        <h2 className="mb-3 text-sm font-semibold text-sidebar-foreground flex items-center gap-2">
          <Box className="w-4 h-4 text-primary" />
          Blocks
        </h2>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
          <Input
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            className="pl-9 pr-8 bg-sidebar-accent/50 text-sidebar-foreground placeholder:text-muted-foreground border-sidebar-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {/* Recently Used Section */}
          {recentBlocks.length > 0 && !searchQuery && (
            <div className="mb-4">
              <div className="flex items-center gap-2 px-3 py-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-sidebar-foreground">Recently Used</span>
              </div>
              <div className="grid grid-cols-2 gap-2 px-3">
                {recentBlocks.slice(0, 6).map((block) => {
                  const Icon = iconMap[block.icon] || Layout;
                  return (
                    <TooltipProvider key={block.type} delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start gap-2 px-2 py-1.5 text-xs text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
                            onClick={() => handleAddBlock(block.type, block.defaultProps)}
                          >
                            <Icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="truncate">{block.label}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="w-64 p-3">
                          <div className="flex flex-col gap-2">
                            <BlockTooltipPreview type={block.type as BlockType} />
                            <div>
                              <p className="font-medium text-foreground">{block.label}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {getBlockDescription(block.type as BlockType)}
                              </p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Results - Flat List */}
          {isSearching && searchQuery && searchResults.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 text-sm font-medium text-sidebar-foreground">
                Search Results ({searchResults.length})
              </div>
              <div className="space-y-1 px-2">
                {searchResults.map((block, index) => {
                  const Icon = iconMap[block.icon] || Layout;
                  return (
                    <TooltipProvider key={block.type} delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
                            onClick={() => {
                              handleAddBlock(block.type, block.defaultProps);
                              clearSearch();
                            }}
                            style={{ animationDelay: `${index * 20}ms` }}
                          >
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 flex-shrink-0">
                              <Icon className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="truncate">{block.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {block.category}
                              </span>
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="w-64 p-3">
                          <div className="flex flex-col gap-2">
                            <BlockTooltipPreview type={block.type as BlockType} />
                            <div>
                              <p className="font-medium text-foreground">{block.label}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {getBlockDescription(block.type as BlockType)}
                              </p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Search Results */}
          {isSearching && searchQuery && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No blocks found for "{searchQuery}"</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching by name or category
              </p>
            </div>
          )}

          {/* Category List (when not searching) */}
          {!searchQuery &&
            filteredCategories.map((category, catIndex) => (
              <div
                key={category.name}
                className="animate-in stagger-children"
                style={{ '--animation-delay': `${catIndex * 50}ms` } as React.CSSProperties}
              >
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200 group"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 group-hover:bg-primary transition-colors duration-200" />
                    {category.name}
                    <span className="text-xs text-muted-foreground font-normal">
                      ({category.blocks.length})
                    </span>
                  </span>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform duration-200',
                      expandedCategories.includes(category.name) && 'rotate-90',
                    )}
                  />
                </button>

                {expandedCategories.includes(category.name) && (
                  <div className="mt-1.5 space-y-1 pl-4">
                    {category.blocks.map((block, blockIndex) => {
                      const Icon = iconMap[block.icon] || Layout;
                      return (
                        <TooltipProvider key={block.type} delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200 group relative overflow-hidden"
                                onClick={() => handleAddBlock(block.type, block.defaultProps)}
                                style={{ animationDelay: `${blockIndex * 30}ms` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200 flex-shrink-0">
                                  <Icon className="h-3.5 w-3.5 text-primary group-hover:text-primary-foreground transition-colors duration-200" />
                                </div>
                                <span className="relative">{block.label}</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="w-64 p-3">
                              <div className="flex flex-col gap-2">
                                <BlockTooltipPreview type={block.type as BlockType} />
                                <div>
                                  <p className="font-medium text-foreground">{block.label}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {getBlockDescription(block.type as BlockType)}
                                  </p>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4 bg-gradient-to-t from-card/50 to-transparent">
        {selectedBlock?.type === 'stats-row' ? (
          <p className="text-xs text-muted-foreground text-center">
            Stats Row selected: click Stats Card / Top Languages / Streak Stats to add as child (up
            to 2 cards for side-by-side layout)
          </p>
        ) : (
          <p className="text-xs text-muted-foreground text-center">
            Click a block to add it to your README
          </p>
        )}
      </div>
    </div>
  );
}
