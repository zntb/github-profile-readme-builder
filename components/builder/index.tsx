'use client';

import { Blocks, Code, Eye, PanelLeft, Settings2, User } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBuilderStore } from '@/lib/store';
import { cn } from '@/lib/utils';

import { BlockSidebar } from './block-sidebar';
import { Canvas } from './canvas';
import { ConfigPanel } from './config-panel';
import { BuilderHeader } from './header';
import { OutputPanel } from './output-panel';

export function Builder() {
  const selectedBlockId = useBuilderStore((s) => s.selectedBlockId);
  const username = useBuilderStore((s) => s.username);
  const setUsername = useBuilderStore((s) => s.setUsername);
  const blocks = useBuilderStore((s) => s.blocks);
  const [mobileTab, setMobileTab] = useState<'blocks' | 'canvas' | 'preview'>('canvas');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const mobileNavigationItems: {
    id: 'blocks' | 'canvas' | 'preview';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    {
      id: 'blocks',
      label: 'Blocks',
      icon: Blocks,
      badge: blocks.length > 0 ? String(blocks.length) : undefined,
    },
    {
      id: 'canvas',
      label: 'Canvas',
      icon: PanelLeft,
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: Eye,
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-background gradient-bg pb-16">
      <BuilderHeader />

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-1">
        {/* Left Sidebar - Block Library */}
        <BlockSidebar />

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,transparent_0%,var(--background)_70%)]" />
          </div>
          <Canvas />
        </div>

        {/* Right Panel - Config or Preview */}
        <div className="w-80 xl:w-96 border-l border-border/50 bg-card/50 backdrop-blur-sm flex flex-col h-full">
          {selectedBlockId ? (
            <ConfigPanel />
          ) : (
            <div className="flex flex-col h-full">
              {/* Username Input */}
              <div className="border-b border-border/50 p-3 bg-gradient-to-b from-card/50 to-transparent">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    GitHub Username
                  </Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your GitHub username"
                    className="h-8 text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <Tabs defaultValue="preview" className="flex-1 flex flex-col">
                <div className="border-b border-border/50 p-2 bg-gradient-to-b from-card/50 to-transparent">
                  <TabsList className="w-full bg-muted/50">
                    <TabsTrigger
                      value="preview"
                      className="flex-1 gap-2 transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger
                      value="markdown"
                      className="flex-1 gap-2 transition-all duration-200"
                    >
                      <Code className="w-4 h-4" />
                      Markdown
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                  <OutputPanel mode="preview" />
                </TabsContent>
                <TabsContent value="markdown" className="flex-1 m-0 overflow-hidden">
                  <OutputPanel mode="markdown" />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      {/* Tablet Layout (md-lg) */}
      <div className="hidden md:flex lg:hidden flex-1 relative">
        {/* Left Sidebar - Block Library (collapsible) */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-16 z-20 md:flex hidden lg:hidden hover:bg-primary/10 hover:text-primary transition-colors duration-200"
            >
              <Blocks className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 border-r border-border/50">
            <BlockSidebar />
          </SheetContent>
        </Sheet>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col min-w-0 pl-12 relative">
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,transparent_0%,var(--background)_70%)]" />
          </div>
          <Canvas />
        </div>

        {/* Right Panel - Config or Preview (collapsible) */}
        <Sheet open={configOpen} onOpenChange={setConfigOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-16 z-20 md:flex hidden lg:hidden hover:bg-primary/10 hover:text-primary transition-colors duration-200"
            >
              {selectedBlockId ? <Settings2 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0 border-l border-border/50">
            {selectedBlockId ? (
              <ConfigPanel />
            ) : (
              <div className="flex flex-col h-full">
                {/* Username Input */}
                <div className="border-b border-border/50 p-3 bg-gradient-to-b from-card/50 to-transparent">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      GitHub Username
                    </Label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your GitHub username"
                      className="h-8 text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <Tabs defaultValue="preview" className="flex-1 flex flex-col h-full">
                  <div className="border-b border-border/50 p-2 bg-gradient-to-b from-card/50 to-transparent">
                    <TabsList className="w-full bg-muted/50">
                      <TabsTrigger
                        value="preview"
                        className="flex-1 gap-2 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger
                        value="markdown"
                        className="flex-1 gap-2 transition-all duration-200"
                      >
                        <Code className="w-4 h-4" />
                        Markdown
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                    <OutputPanel mode="preview" />
                  </TabsContent>
                  <TabsContent value="markdown" className="flex-1 m-0 overflow-hidden">
                    <OutputPanel mode="markdown" />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden flex-1 flex-col">
        {/* Mobile Tab Content */}
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,transparent_0%,var(--background)_70%)]" />
          </div>
          {mobileTab === 'blocks' && (
            <div className="h-full flex flex-col">
              <div className="border-b border-border/50 bg-card/60 px-3 py-2">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => setMobileTab('canvas')}
                  >
                    <PanelLeft className="h-3.5 w-3.5" />
                    Canvas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => setMobileTab('preview')}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!selectedBlockId}
                    className={cn(
                      'h-8 gap-1.5 text-xs',
                      !selectedBlockId && 'cursor-not-allowed opacity-50',
                    )}
                    onClick={() => setConfigOpen(true)}
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    Config
                  </Button>
                </div>
              </div>
              <BlockSidebar />
            </div>
          )}
          {mobileTab === 'canvas' && (
            <div className="h-full flex flex-col relative">
              <Canvas />
              {selectedBlockId && (
                <Sheet open={configOpen} onOpenChange={setConfigOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-24 right-4 z-10 shadow-lg hover:shadow-xl transition-shadow duration-200 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-0"
                    >
                      <Settings2 className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="bottom"
                    className="h-[70vh] p-0 rounded-t-2xl border-t border-border/50"
                  >
                    <ConfigPanel />
                  </SheetContent>
                </Sheet>
              )}
            </div>
          )}
          {mobileTab === 'preview' && (
            <div className="flex flex-col h-full">
              {/* Username Input */}
              <div className="border-b border-border/50 p-3 bg-gradient-to-b from-card/50 to-transparent">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    GitHub Username
                  </Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your GitHub username"
                    className="h-8 text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <Tabs defaultValue="preview" className="flex-1 flex flex-col h-full">
                <div className="border-b border-border/50 p-2 bg-gradient-to-b from-card/50 to-transparent">
                  <TabsList className="w-full bg-muted/50">
                    <TabsTrigger
                      value="preview"
                      className="flex-1 gap-2 transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger
                      value="markdown"
                      className="flex-1 gap-2 transition-all duration-200"
                    >
                      <Code className="w-4 h-4" />
                      Markdown
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                  <OutputPanel mode="preview" />
                </TabsContent>
                <TabsContent value="markdown" className="flex-1 m-0 overflow-hidden">
                  <OutputPanel mode="markdown" />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        <Sheet open={configOpen} onOpenChange={setConfigOpen}>
          {/* Advanced Mobile Navigation */}
          <div className="border-t border-border/60 bg-card/85 backdrop-blur-xl px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2">
            <div className="grid grid-cols-4 items-end gap-1">
              {mobileNavigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = mobileTab === item.id;

                return (
                  <Button
                    key={item.id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'relative h-auto min-h-14 flex-col gap-1 rounded-xl py-2 text-muted-foreground transition-all duration-200',
                      isActive &&
                        'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]',
                    )}
                    onClick={() => setMobileTab(item.id)}
                  >
                    <div className="relative">
                      <Icon className="h-4 w-4" />
                      {item.badge && (
                        <span className="absolute -right-3 -top-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium">{item.label}</span>
                  </Button>
                );
              })}

              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!selectedBlockId}
                  className={cn(
                    'h-auto min-h-14 flex-col gap-1 rounded-xl py-2 text-muted-foreground transition-all duration-200',
                    selectedBlockId
                      ? 'hover:bg-primary/10 hover:text-primary'
                      : 'cursor-not-allowed opacity-50',
                  )}
                >
                  <Settings2 className="h-4 w-4" />
                  <span className="text-[11px] font-medium">Config</span>
                </Button>
              </SheetTrigger>
            </div>
          </div>

          <SheetContent
            side="bottom"
            className="h-[72vh] p-0 rounded-t-2xl border-t border-border/50"
          >
            <ConfigPanel />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
