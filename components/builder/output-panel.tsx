'use client';

import { Copy, Download, Check, FileCode } from 'lucide-react';
import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { renderMarkdown, downloadMarkdown, copyToClipboard } from '@/lib/markdown';
import { useBuilderStore } from '@/lib/store';

import { LivePreview } from './live-preview';

interface OutputPanelProps {
  mode: 'preview' | 'markdown';
}

export function OutputPanel({ mode }: OutputPanelProps) {
  const [copied, setCopied] = useState(false);
  const { blocks } = useBuilderStore();

  const markdown = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return renderMarkdown(blocks, window.location.origin);
  }, [blocks]);

  const handleCopy = async () => {
    const success = await copyToClipboard(markdown);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadMarkdown(markdown);
  };

  if (mode === 'preview') {
    return (
      <div className="flex h-full flex-col bg-background/50">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-gradient-to-r from-card/50 to-transparent">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Live Preview</span>
          </div>
        </div>
        <LivePreview blocks={blocks} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background/50">
      <div className="flex items-center justify-between gap-2 border-b border-border/50 px-3 py-2 bg-gradient-to-r from-card/50 to-transparent">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileCode className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Markdown Output</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2 transition-all duration-200 hover:bg-primary/10 hover:border-primary/30"
            disabled={blocks.length === 0}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="hidden sm:inline text-green-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm hover:shadow-md transition-all duration-200"
            disabled={blocks.length === 0}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sm:p-4">
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                <FileCode className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">Add blocks to generate Markdown</p>
            </div>
          ) : (
            <pre className="rounded-xl bg-card/50 border border-border/50 p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto whitespace-pre-wrap break-all font-mono leading-relaxed">
              <code className="text-foreground/80">{markdown}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
