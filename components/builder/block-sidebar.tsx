'use client';

import {
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
  Search,
  ChevronRight,
  Box,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuilderStore, generateId } from '@/lib/store';
import { BLOCK_CATEGORIES, type BlockType } from '@/lib/types';
import { cn } from '@/lib/utils';

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
};

export function BlockSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    BLOCK_CATEGORIES.map((c) => c.name),
  );
  const { addBlock, username } = useBuilderStore();

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

  const handleAddBlock = (type: BlockType, defaultProps: Record<string, unknown>) => {
    // If username is set and this is a GitHub stats block, use the username
    const props = { ...defaultProps };
    if (username && GITHUB_STATS_BLOCKS.includes(type)) {
      props.username = username;
    }
    addBlock({
      id: generateId(),
      type,
      props,
      children: type === 'container' || type === 'collapsible' ? [] : undefined,
    });
  };

  const filteredCategories = BLOCK_CATEGORIES.map((category) => ({
    ...category,
    blocks: category.blocks.filter(
      (block) =>
        block.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.type.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  })).filter((category) => category.blocks.length > 0);

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
            className="pl-9 bg-sidebar-accent/50 text-sidebar-foreground placeholder:text-muted-foreground border-sidebar-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredCategories.map((category, catIndex) => (
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
                      <Button
                        key={block.type}
                        variant="ghost"
                        className="w-full justify-start gap-3 px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200 group relative overflow-hidden"
                        onClick={() => handleAddBlock(block.type, block.defaultProps)}
                        style={{ animationDelay: `${blockIndex * 30}ms` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                          <Icon className="h-3.5 w-3.5 text-primary group-hover:text-primary-foreground transition-colors duration-200" />
                        </div>
                        <span className="relative">{block.label}</span>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4 bg-gradient-to-t from-card/50 to-transparent">
        <p className="text-xs text-muted-foreground text-center">
          Click a block to add it to your README
        </p>
      </div>
    </div>
  );
}
