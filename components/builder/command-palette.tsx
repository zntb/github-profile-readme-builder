'use client';

import {
  Activity,
  AlignLeft,
  Award,
  Badge,
  BarChart2,
  ChevronRight,
  Clock,
  Code,
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
  PieChart,
  Quote,
  Share2,
  Space,
  Sparkles,
  StickyNote,
  Table2,
  Text,
  Trophy,
  Type,
  UserCircle,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuilderStore } from '@/lib/store';
import { templates } from '@/lib/templates';
import { BLOCK_CATEGORIES, type BlockType } from '@/lib/types';

// Block type to icon mapping
const blockIcons: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  divider: Minus,
  spacer: Space,
  'capsule-header': StickyNote,
  avatar: UserCircle,
  greeting: Hand,
  'typing-animation': Type,
  heading: Heading,
  paragraph: AlignLeft,
  collapsible: ChevronRight,
  'code-block': Code,
  image: Image,
  gif: Film,
  'social-badges': Share2,
  'custom-badge': Badge,
  'skill-icons': Layers,
  'stats-row': BarChart2,
  'stats-card': Table2,
  'top-languages': PieChart,
  'streak-stats': Flame,
  'activity-graph': Activity,
  trophies: Trophy,
  'visitor-counter': Clock,
  quote: Quote,
  'footer-banner': Heart,
  'support-link': Zap,
};

// Block categories for organization
const blockCategories = {
  layout: {
    title: 'Layout',
    types: ['divider', 'spacer'] as BlockType[],
    icon: Layout,
  },
  hero: {
    title: 'Hero',
    types: ['capsule-header', 'avatar', 'greeting', 'typing-animation'] as BlockType[],
    icon: Sparkles,
  },
  content: {
    title: 'Content',
    types: ['heading', 'paragraph', 'collapsible', 'code-block'] as BlockType[],
    icon: Text,
  },
  media: {
    title: 'Media',
    types: ['image', 'gif'] as BlockType[],
    icon: Image,
  },
  social: {
    title: 'Social',
    types: ['social-badges', 'custom-badge'] as BlockType[],
    icon: Share2,
  },
  tech: {
    title: 'Tech Stack',
    types: ['skill-icons'] as BlockType[],
    icon: Layers,
  },
  stats: {
    title: 'GitHub Stats',
    types: [
      'stats-row',
      'stats-card',
      'top-languages',
      'streak-stats',
      'activity-graph',
      'trophies',
    ] as BlockType[],
    icon: BarChart2,
  },
  advanced: {
    title: 'Advanced',
    types: ['visitor-counter', 'quote', 'footer-banner', 'support-link'] as BlockType[],
    icon: Award,
  },
};

// Command palette actions
type CommandAction = {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'actions' | 'blocks' | 'templates' | 'settings';
  action?: () => void;
  shortcut?: string;
  keywords?: string[];
};

interface CommandPaletteProps {
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ onOpenChange }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  const addBlock = useBuilderStore((s) => s.addBlock);
  const loadTemplate = useBuilderStore((s) => s.loadTemplate);
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const clearBlocks = useBuilderStore((s) => s.clearBlocks);
  const blocks = useBuilderStore((s) => s.blocks);
  const blockDefaultProps = useMemo(() => {
    return BLOCK_CATEGORIES.reduce(
      (acc, category) => {
        category.blocks.forEach((block) => {
          acc[block.type] = block.defaultProps;
        });
        return acc;
      },
      {} as Record<BlockType, Record<string, unknown>>,
    );
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Handle open state changes
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      onOpenChange?.(isOpen);
    },
    [onOpenChange],
  );

  // Generate block insertion commands
  const blockCommands = useMemo<CommandAction[]>(() => {
    const commands: CommandAction[] = [];

    Object.entries(blockCategories).forEach(([, category]) => {
      category.types.forEach((type) => {
        const Icon = blockIcons[type];
        commands.push({
          id: `block-${type}`,
          title: `Add ${type.replace(/-/g, ' ')}`,
          description: category.title,
          icon: Icon,
          category: 'blocks',
          action: () => {
            addBlock({
              id: `block-${Date.now()}`,
              type,
              props: { ...(blockDefaultProps[type] ?? {}) },
            });
            toast.success(`Added ${type.replace(/-/g, ' ')} block`);
            setOpen(false);
          },
          keywords: [type, category.title.toLowerCase(), ...type.split('-')],
        });
      });
    });

    return commands;
  }, [addBlock, blockDefaultProps]);

  // Generate template commands
  const templateCommands = useMemo<CommandAction[]>(() => {
    return templates.map((template) => ({
      id: `template-${template.id}`,
      title: template.name,
      description: template.description,
      icon: Layout,
      category: 'templates' as const,
      action: () => {
        loadTemplate(template);
        toast.success(`Loaded template: ${template.name}`);
        setOpen(false);
      },
      keywords: [template.name.toLowerCase(), template.description.toLowerCase()],
    }));
  }, [loadTemplate]);

  // Action commands
  const actionCommands = useMemo<CommandAction[]>(() => {
    const commands: CommandAction[] = [
      {
        id: 'undo',
        title: 'Undo',
        description: 'Undo last action',
        icon: ChevronRight, // Using as rotate icon
        category: 'actions',
        action: () => {
          undo();
          setOpen(false);
        },
        shortcut: '⌘Z',
        keywords: ['undo', 'redo', 'history'],
      },
      {
        id: 'redo',
        title: 'Redo',
        description: 'Redo last action',
        icon: ChevronRight,
        category: 'actions',
        action: () => {
          redo();
          setOpen(false);
        },
        shortcut: '⌘⇧Z',
        keywords: ['redo', 'undo', 'history'],
      },
      {
        id: 'clear',
        title: 'Clear All Blocks',
        description: 'Remove all blocks from canvas',
        icon: Layers,
        category: 'actions',
        action: () => {
          if (blocks.length > 0) {
            clearBlocks();
            toast.success('Cleared all blocks');
          }
          setOpen(false);
        },
        keywords: ['clear', 'delete', 'remove', 'reset'],
      },
    ];

    return commands;
  }, [undo, redo, clearBlocks, blocks.length]);

  // Settings commands
  const settingsCommands = useMemo<CommandAction[]>(() => {
    return [
      {
        id: 'toggle-theme',
        title: 'Toggle Theme',
        description: 'Switch between light and dark mode',
        icon: Eye,
        category: 'settings',
        action: () => {
          // Theme toggle is handled by ModeToggle component
          setOpen(false);
        },
        keywords: ['theme', 'dark', 'light', 'mode', 'color'],
      },
    ];
  }, []);

  // Combine all commands for filtering
  // Note: cmdk handles filtering internally, no need for separate useMemo

  return (
    <>
      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <div className="border-b px-4 py-3">
          <span className="text-sm font-medium">Command Palette</span>
        </div>
        <CommandInput
          placeholder="Type a command or search..."
          className="border-0 focus-visible:ring-0"
        />
        <CommandList className="max-h-[60vh] sm:max-h-[400px]">
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Actions Group */}
          <CommandGroup heading="Actions">
            {actionCommands.map((action) => (
              <CommandItem key={action.id} onSelect={action.action} className="cursor-pointer">
                <action.icon className="mr-2 h-4 w-4" />
                <span>{action.title}</span>
                {action.description && (
                  <span className="ml-2 text-xs text-muted-foreground">{action.description}</span>
                )}
                {action.shortcut && (
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    {action.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Blocks Group */}
          <CommandGroup heading="Blocks">
            <ScrollArea className="h-[200px] sm:h-auto">
              {Object.entries(blockCategories).map(([categoryKey, category]) => (
                <div key={categoryKey} className="mb-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <category.icon className="h-3 w-3" />
                    {category.title}
                  </div>
                  {category.types.map((type) => {
                    const Icon = blockIcons[type];
                    const command = blockCommands.find((c) => c.id === `block-${type}`);
                    return (
                      <CommandItem
                        key={type}
                        onSelect={command?.action}
                        className="cursor-pointer pl-6"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <span className="capitalize">{type.replace(/-/g, ' ')}</span>
                      </CommandItem>
                    );
                  })}
                </div>
              ))}
            </ScrollArea>
          </CommandGroup>

          <CommandSeparator />

          {/* Templates Group */}
          <CommandGroup heading="Templates">
            <ScrollArea className="h-[150px] sm:h-auto">
              {templateCommands.map((template) => (
                <CommandItem
                  key={template.id}
                  onSelect={template.action}
                  className="cursor-pointer"
                >
                  <template.icon className="mr-2 h-4 w-4" />
                  <span>{template.title}</span>
                  {template.description && (
                    <span className="ml-2 text-xs text-muted-foreground truncate">
                      {template.description}
                    </span>
                  )}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>

          <CommandSeparator />

          {/* Settings Group */}
          <CommandGroup heading="Settings">
            {settingsCommands.map((setting) => (
              <CommandItem key={setting.id} onSelect={setting.action} className="cursor-pointer">
                <setting.icon className="mr-2 h-4 w-4" />
                <span>{setting.title}</span>
                {setting.description && (
                  <span className="ml-2 text-xs text-muted-foreground">{setting.description}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

// Hook to control command palette from outside
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle, setIsOpen };
}
