import { GitBranch } from 'lucide-react';
import Link from 'next/link';

import { Footer } from '@/components/footer';
import { ModeToggle } from '@/components/mode-toggle';

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <GitBranch className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-foreground text-base tracking-tight">
                README Builder
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Craft your profile</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Builder
          </Link>
          <span className="text-muted-foreground text-sm font-medium text-primary">Gallery</span>
          <ModeToggle />
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      <Footer />
    </>
  );
}
