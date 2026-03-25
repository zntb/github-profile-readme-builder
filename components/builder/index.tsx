'use client';

import { Eye, Code, PanelLeft, Settings2, Blocks, User } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBuilderStore } from '@/lib/store';

import { BlockSidebar } from './block-sidebar';
import { Canvas } from './canvas';
import { ConfigPanel } from './config-panel';
import { BuilderHeader } from './header';
import { OutputPanel } from './output-panel';

export function Builder() {
  const { selectedBlockId, username, setUsername } = useBuilderStore();
  const [mobileTab, setMobileTab] = useState<'blocks' | 'canvas' | 'preview'>('canvas');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background gradient-bg">
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
            <div className="h-full">
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
                      className="absolute bottom-20 right-4 z-10 shadow-lg hover:shadow-xl transition-shadow duration-200 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-0"
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

        {/* Mobile Bottom Navigation - Improved styling */}
        <div className="border-t border-border/50 bg-card/80 backdrop-blur-md p-2 safe-area-inset-bottom">
          <div className="flex items-center justify-around">
            <Button
              variant={mobileTab === 'blocks' ? 'secondary' : 'ghost'}
              size="sm"
              className={`flex-1 flex-col h-auto py-3 gap-1.5 transition-all duration-200 ${mobileTab === 'blocks' ? 'bg-primary/10 text-primary' : ''}`}
              onClick={() => setMobileTab('blocks')}
            >
              <Blocks className={`w-5 h-5 ${mobileTab === 'blocks' ? 'text-primary' : ''}`} />
              <span className="text-xs font-medium">Blocks</span>
            </Button>
            <Button
              variant={mobileTab === 'canvas' ? 'secondary' : 'ghost'}
              size="sm"
              className={`flex-1 flex-col h-auto py-3 gap-1.5 transition-all duration-200 ${mobileTab === 'canvas' ? 'bg-primary/10 text-primary' : ''}`}
              onClick={() => setMobileTab('canvas')}
            >
              <PanelLeft className={`w-5 h-5 ${mobileTab === 'canvas' ? 'text-primary' : ''}`} />
              <span className="text-xs font-medium">Canvas</span>
            </Button>
            <Button
              variant={mobileTab === 'preview' ? 'secondary' : 'ghost'}
              size="sm"
              className={`flex-1 flex-col h-auto py-3 gap-1.5 transition-all duration-200 ${mobileTab === 'preview' ? 'bg-primary/10 text-primary' : ''}`}
              onClick={() => setMobileTab('preview')}
            >
              <Eye className={`w-5 h-5 ${mobileTab === 'preview' ? 'text-primary' : ''}`} />
              <span className="text-xs font-medium">Preview</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
