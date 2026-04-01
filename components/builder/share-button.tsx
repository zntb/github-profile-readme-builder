'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBuilderStore } from '@/lib/store';

type SocialPlatform = 'twitter' | 'linkedin' | 'facebook' | 'copy';

interface ShareData {
  title: string;
  text: string;
  url: string;
}

// SVG Icons for social platforms
const TwitterIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill={style?.color || 'currentColor'}
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill={style?.color || 'currentColor'}
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const FacebookIcon = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill={style?.color || 'currentColor'}
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const CopyIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/**
 * ShareButton component for one-click sharing to social media platforms.
 * Supports Twitter/X, LinkedIn, Facebook, and clipboard copy.
 * Provides both desktop dropdown and mobile-friendly dialogs.
 */
export function ShareButton() {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const username = useBuilderStore((s) => s.username);
  const blocks = useBuilderStore((s) => s.blocks);

  // Generate share URL - in production this would be the deployed URL
  const getShareUrl = (): string => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://github-profile-maker.vercel.app';
  };

  const getShareText = (): string => {
    if (username) {
      return `Check out my GitHub profile README I made with GitHub Profile Maker!`;
    }
    return `Create an amazing GitHub profile README with GitHub Profile Maker!`;
  };

  const getShareTitle = (): string => {
    if (username) {
      return `${username}'s GitHub Profile`;
    }
    return 'GitHub Profile Maker';
  };

  const handleShare = async (platform: SocialPlatform) => {
    const shareData: ShareData = {
      title: getShareTitle(),
      text: getShareText(),
      url: getShareUrl(),
    };

    switch (platform) {
      case 'twitter':
        await shareToTwitter(shareData);
        break;
      case 'linkedin':
        await shareToLinkedIn(shareData);
        break;
      case 'facebook':
        await shareToFacebook(shareData);
        break;
      case 'copy':
        await copyToClipboard(shareData.url);
        break;
    }
  };

  const shareToTwitter = async (data: ShareData) => {
    const twitterUrl = new URL('https://twitter.com/intent/tweet');
    twitterUrl.searchParams.set('text', data.text);
    twitterUrl.searchParams.set('url', data.url);

    window.open(twitterUrl.toString(), '_blank', 'width=550,height=420');
    toast.success('Opening Twitter...');
  };

  const shareToLinkedIn = async (data: ShareData) => {
    const linkedInUrl = new URL('https://www.linkedin.com/sharing/share-offsite/');
    linkedInUrl.searchParams.set('url', data.url);

    window.open(linkedInUrl.toString(), '_blank', 'width=550,height=420');
    toast.success('Opening LinkedIn...');
  };

  const shareToFacebook = async (data: ShareData) => {
    const facebookUrl = new URL('https://www.facebook.com/sharer/sharer.php');
    facebookUrl.searchParams.set('u', data.url);
    facebookUrl.searchParams.set('quote', data.text);

    window.open(facebookUrl.toString(), '_blank', 'width=550,height=420');
    toast.success('Opening Facebook...');
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  // Handle mobile share action
  const handleMobileShare = async (platform: SocialPlatform) => {
    const shareData: ShareData = {
      title: getShareTitle(),
      text: getShareText(),
      url: getShareUrl(),
    };

    // Check if Web Share API is available (mobile)
    if (navigator.share && platform === 'copy') {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
        return;
      } catch {
        // User cancelled or error, fall back to copy
      }
    }

    await handleShare(platform);
    setShareDialogOpen(false);
  };

  // Don't show share button if no content
  if (blocks.length === 0) {
    return null;
  }

  const shareData: ShareData = {
    title: getShareTitle(),
    text: getShareText(),
    url: getShareUrl(),
  };

  return (
    <>
      {/* Desktop: Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="hidden sm:flex gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <LinkIcon className="w-4 h-4" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Share your profile</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleShare('twitter')} className="cursor-pointer gap-3">
            <TwitterIcon className="w-4 h-4" style={{ color: '#1DA1F2' }} />
            <span>Twitter / X</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleShare('linkedin')}
            className="cursor-pointer gap-3"
          >
            <LinkedInIcon className="w-4 h-4" style={{ color: '#0A66C2' }} />
            <span>LinkedIn</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleShare('facebook')}
            className="cursor-pointer gap-3"
          >
            <FacebookIcon className="w-4 h-4" style={{ color: '#1877F2' }} />
            <span>Facebook</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleShare('copy')} className="cursor-pointer gap-3">
            {copied ? (
              <CheckIcon className="w-4 h-4 text-green-500" />
            ) : (
              <CopyIcon className="w-4 h-4" />
            )}
            <span>{copied ? 'Copied!' : 'Copy link'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mobile: Dialog */}
      <Button
        size="sm"
        className="sm:hidden gap-2 w-full justify-start bg-gradient-to-r from-primary to-primary/90"
        onClick={() => setShareDialogOpen(true)}
      >
        <LinkIcon className="w-4 h-4" />
        Share Profile
      </Button>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share your profile</DialogTitle>
            <DialogDescription>Share your GitHub profile README with the world</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            {/* Share Preview Card */}
            <div className="rounded-xl border border-border/60 bg-card/50 p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
                  <LinkIcon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{shareData.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {shareData.text}
                  </p>
                </div>
              </div>
            </div>

            {/* Share Options */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 flex-col gap-1.5 hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/30"
                onClick={() => handleMobileShare('twitter')}
              >
                <TwitterIcon className="w-5 h-5" style={{ color: '#1DA1F2' }} />
                <span className="text-xs">Twitter</span>
              </Button>
              <Button
                variant="outline"
                className="h-12 flex-col gap-1.5 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/30"
                onClick={() => handleMobileShare('linkedin')}
              >
                <LinkedInIcon className="w-5 h-5" style={{ color: '#0A66C2' }} />
                <span className="text-xs">LinkedIn</span>
              </Button>
              <Button
                variant="outline"
                className="h-12 flex-col gap-1.5 hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30"
                onClick={() => handleMobileShare('facebook')}
              >
                <FacebookIcon className="w-5 h-5" style={{ color: '#1877F2' }} />
                <span className="text-xs">Facebook</span>
              </Button>
              <Button
                variant="outline"
                className="h-12 flex-col gap-1.5"
                onClick={() => handleMobileShare('copy')}
              >
                {copied ? (
                  <CheckIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <CopyIcon className="w-5 h-5" />
                )}
                <span className="text-xs">{copied ? 'Copied!' : 'Copy link'}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
