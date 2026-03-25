'use client';

import { LayoutTemplate, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuilderStore } from '@/lib/store';
import { templates } from '@/lib/templates';
import { cn } from '@/lib/utils';

export function TemplatesDialog() {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { loadTemplate, blocks } = useBuilderStore();

  const handleLoadTemplate = () => {
    const template = templates.find((t) => t.id === selectedTemplate);
    if (template) {
      loadTemplate(template);
      setOpen(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 transition-all duration-200 hover:bg-primary/10 hover:border-primary/30"
        >
          <LayoutTemplate className="h-4 w-4" />
          <span className="hidden sm:inline">Templates</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[85vh] p-0 overflow-hidden rounded-2xl border-border/50">
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-4 border-b border-border/50">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <DialogTitle className="text-lg font-semibold">Choose a Template</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Start with a pre-built template and customize it to your needs
              {blocks.length > 0 && (
                <span className="text-destructive/80 text-xs mt-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  Warning: Loading a template will replace your current blocks
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="h-[400px] px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {templates.map((template, index) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={cn(
                  'relative rounded-xl border-2 p-4 text-left transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10',
                  selectedTemplate === template.id
                    ? 'border-primary shadow-lg shadow-primary/20 bg-primary/5'
                    : 'border-border/50 hover:border-muted-foreground/30',
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {selectedTemplate === template.id && (
                  <div className="absolute top-3 right-3 rounded-full bg-primary p-1.5 shadow-sm">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}

                <div className="mb-3 h-20 rounded-lg bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 flex items-center justify-center border border-border/30">
                  <LayoutTemplate className="h-8 w-8 text-muted-foreground/40" />
                </div>

                <h3 className="font-semibold text-sm">{template.name}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground/70 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-primary/60" />
                  {template.blocks.length} blocks
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border/50 bg-gradient-to-b from-transparent to-muted/20">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleLoadTemplate}
            disabled={!selectedTemplate}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm hover:shadow-md transition-all duration-200"
          >
            Load Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
