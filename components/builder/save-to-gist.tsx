'use client';

import { ExternalLink, GitBranch, Loader2, Lock, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { renderMarkdown } from '@/lib/markdown';
import { useBuilderStore } from '@/lib/store';

interface GistResponse {
  success: boolean;
  gistUrl?: string;
  gistId?: string;
  error?: string;
}

export function SaveToGist() {
  const blocks = useBuilderStore((s) => s.blocks);
  const username = useBuilderStore((s) => s.username);
  const gistDialogOpen = useBuilderStore((s) => s.gistDialogOpen);
  const setGistDialogOpen = useBuilderStore((s) => s.setGistDialogOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Debug: Log state changes
  useEffect(() => {
    console.log('[SaveToGist] gistDialogOpen changed to:', gistDialogOpen);
  }, [gistDialogOpen]);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('github_gist_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    setGistDialogOpen(open);
    if (open) {
      // Load saved token when opening
      const savedToken = localStorage.getItem('github_gist_token');
      if (savedToken) {
        setToken(savedToken);
      }
    }
  };

  const handleSave = async () => {
    if (!token.trim()) {
      toast.error('GitHub token is required');
      return;
    }

    if (blocks.length === 0) {
      toast.error('No content to save');
      return;
    }

    setIsLoading(true);

    try {
      const content = renderMarkdown(blocks, window.location.origin);

      const response = await fetch('/api/gist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          description: `${username || 'README'} - Created with GitHub Profile Maker`,
          isPublic,
          token: token.trim(),
        }),
      });

      const data: GistResponse = await response.json();

      if (data.success && data.gistUrl) {
        // Save token to localStorage for convenience
        localStorage.setItem('github_gist_token', token.trim());

        toast.success('Saved to GitHub Gist!', {
          description: data.gistUrl,
          action: {
            label: 'Open Gist',
            onClick: () => window.open(data.gistUrl, '_blank'),
          },
        });

        setGistDialogOpen(false);
      } else {
        toast.error(data.error || 'Failed to save to Gist');
      }
    } catch {
      toast.error('Failed to save to Gist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Desktop button - manually controlled, not using DialogTrigger */}
      <Button
        size="sm"
        disabled={blocks.length === 0}
        className="hidden sm:flex gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5"
        onClick={() => setGistDialogOpen(true)}
      >
        <GitBranch className="w-4 h-4" />
        Save to Gist
      </Button>

      {/* Dialog is now controlled separately - render when open */}
      <Dialog open={gistDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Save to GitHub Gist
            </DialogTitle>
            <DialogDescription>
              Save your README directly to a GitHub Gist for backup and versioning. You'll need a
              GitHub Personal Access Token with{' '}
              <code className="text-xs bg-muted px-1 rounded">gist</code> scope.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="token">GitHub Personal Access Token</Label>
              <Input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Create a token at{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  github.com/settings/tokens
                </a>{' '}
                with <code className="bg-muted px-1 rounded">gist</code> scope.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="public-gist" className="flex items-center gap-2">
                  {isPublic ? (
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                  {isPublic ? 'Public Gist' : 'Private Gist'}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isPublic ? 'Anyone can view this Gist' : 'Only you can view this Gist'}
                </p>
              </div>
              <Switch id="public-gist" checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGistDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !token.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save to Gist
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile: Render as part of mobile menu */}
      <Button
        size="sm"
        className="sm:hidden w-full justify-start gap-2 h-11 bg-gradient-to-r from-primary to-primary/90 px-3"
        disabled={blocks.length === 0}
        onClick={() => setGistDialogOpen(true)}
      >
        <GitBranch className="w-4 h-4" />
        Save to Gist
      </Button>
    </>
  );
}
