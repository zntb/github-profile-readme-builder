import type { Metadata } from 'next';
import { JetBrains_Mono, Outfit } from 'next/font/google';

import { JsonLd } from '@/components/json-ld';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { NotificationProvider } from '@/lib/notifications';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'optional',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'optional',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://github-profile-maker.vercel.app'),
  title: {
    template: '%s | GitHub Profile Maker',
    default: 'GitHub Profile Maker',
  },
  description:
    'Create beautiful GitHub profile READMEs with a visual drag-and-drop builder. 100% free, no signup required.',
  generator: 'Next.js',
  alternates: {
    canonical: 'https://github-profile-maker.vercel.app',
    types: {
      'text/plain': 'https://github-profile-maker.vercel.app/llms.txt',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://github-profile-maker.vercel.app',
    title: 'GitHub Profile Maker',
    description:
      'Create beautiful GitHub profile READMEs with a visual drag-and-drop builder. 100% free, no signup required.',
    images: [
      {
        url: 'https://github-profile-maker.vercel.app/screenshot.png',
        width: 1200,
        height: 630,
        alt: 'GitHub Profile Maker - Visual Editor',
      },
    ],
    siteName: 'GitHub Profile Maker',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitHub Profile Maker',
    description:
      'Create beautiful GitHub profile READMEs with a visual drag-and-drop builder. 100% free, no signup required.',
    images: ['https://github-profile-maker.vercel.app/screenshot.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'GitHub Profile Maker',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Web',
            url: 'https://github-profile-maker.vercel.app',
            description:
              'Create beautiful GitHub profile READMEs with a visual drag-and-drop builder',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NotificationProvider>
            <main id="main-content" className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col">{children}</div>
            </main>
            <Toaster position="bottom-right" richColors />
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
