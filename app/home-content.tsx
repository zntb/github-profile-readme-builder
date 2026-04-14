'use client';

import { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { Footer } from '@/components/footer';

import Loading from './loading';

/**
 * Dynamically import the Builder component to enable code splitting.
 * The Builder is the heaviest component in the app — lazy-loading it
 * defers its JavaScript until after the initial page paint, improving
 * Time-to-Interactive (TTI) on first load.
 *
 * The Loading skeleton is shown while the Builder chunk is being fetched.
 * Note: ssr: false is set because the Builder uses browser APIs (zustand, window)
 */
const Builder = dynamic(
  () => import('@/components/builder').then((m) => ({ default: m.Builder })),
  {
    ssr: false,
    loading: Loading,
  },
);

export const metadata: Metadata = {
  title: 'Free GitHub Profile README Builder | Create Stunning Profiles',
  description:
    'Create beautiful, custom GitHub profile READMEs with our intuitive visual drag-and-drop builder. Choose from 25+ blocks including stats, graphs, banners, and more. Export as Markdown instantly - 100% free!',
  keywords: [
    'GitHub profile maker',
    'GitHub README builder',
    'create GitHub profile',
    'custom GitHub README',
    'GitHub profile generator',
    'markdown profile',
    'GitHub profile template',
    'visual README editor',
  ],
  openGraph: {
    title: 'Free GitHub Profile README Builder | Create Stunning Profiles',
    description:
      'Create beautiful, custom GitHub profile READMEs with our intuitive visual drag-and-drop builder. Choose from 25+ blocks and export as Markdown instantly.',
  },
  twitter: {
    title: 'Free GitHub Profile README Builder | Create Stunning Profiles',
    description:
      'Create beautiful, custom GitHub profile READMEs with our intuitive visual drag-and-drop builder. Choose from 25+ blocks and export as Markdown instantly.',
  },
};

export default function Home() {
  return (
    <>
      {/* SEO Landing Section - Hidden from Builder UI but visible to crawlers */}
      <section className="sr-only" aria-hidden="true">
        <h1>GitHub Profile README Builder</h1>
        <p>
          GitHub Profile Maker is a free, no-signup tool that lets you create stunning GitHub
          profile READMEs using an intuitive visual editor. Design your profile with 25+
          customizable blocks including activity graphs, stats cards, trophy showcases, skill icons,
          animated banners, and more. Simply drag, drop, and configure each block to match your
          style, then export as ready-to-use Markdown with a single click. Perfect for developers
          who want to make a lasting impression on visitors to their GitHub profile. Our builder
          supports dark and light themes, custom colors, gradients, and advanced formatting options.
          Whether you are a beginner or experienced developer, you can create a professional-looking
          profile README in minutes without writing any code. Share your unique profile URL with
          potential employers, collaborators, and the developer community. Join thousands of
          developers who have already transformed their GitHub profiles with our easy-to-use tool.
          Start building your custom profile README today - completely free, no registration
          required, export to GitHub Flavored Markdown instantly.
        </p>
        <h2>Features</h2>
        <ul>
          <li>Visual drag-and-drop editor with real-time preview</li>
          <li>25+ customizable blocks (stats, graphs, banners, icons, quotes)</li>
          <li>Dark and light theme support with custom color options</li>
          <li>Export to Markdown instantly - copy or save to GitHub Gist</li>
          <li>Pre-built templates for quick starts</li>
          <li>Auto-save functionality to prevent data loss</li>
          <li>Profile quality checker to ensure best practices</li>
          <li>100% free, no signup required</li>
        </ul>
        <h2>How to Use</h2>
        <p>
          Enter your GitHub username in the builder, then drag blocks from the sidebar onto your
          canvas. Customize each block using the configuration panel - change colors, sizes,
          content, and more. Preview your README in real-time as you make changes. When you are
          happy with your design, click the export button to download your Markdown file. Finally,
          copy the content and paste it into your GitHub profile README (create a repository with
          your username as the name). It is that simple - no coding knowledge required!
        </p>
        <h2>Why GitHub Profile READMEs Matter</h2>
        <p>
          Your GitHub profile is often the first thing recruiters and collaborators see when
          researching your work. A well-crafted README showcases your personality, highlights your
          achievements, and demonstrates your technical skills. With our builder, you can create a
          standout profile that reflects your unique journey as a developer. Stand out from the
          crowd with a professional GitHub profile today.
        </p>
      </section>
      <Builder />
      <Footer />
    </>
  );
}

export function HomeContent() {
  return (
    <>
      <Builder />
      <Footer />
    </>
  );
}
