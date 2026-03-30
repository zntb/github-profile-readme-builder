import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="hidden md:block fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row">
        <p className="text-center text-sm text-muted-foreground sm:text-left">
          Built with ❤️ for GitHub profiles
        </p>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="https://github.com/zntb/github-profile-maker/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
          >
            Leave feedback
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            href="https://buymeacoffee.com/codetibo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Image
              src="/coffee.png"
              alt="Buy me a coffee"
              width={20}
              height={20}
              className="rounded-sm"
            />
            <span className="text-sm">Buy me a coffee</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
