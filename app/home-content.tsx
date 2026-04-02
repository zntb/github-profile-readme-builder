'use client';

import dynamic from 'next/dynamic';
import { Toaster } from 'sonner';

import { Footer } from '@/components/footer';

import Loading from './loading';

/**
 * Dynamically import the Builder component to enable code splitting.
 * The Builder is the heaviest component in the app — lazy-loading it
 * defers its JavaScript until after the initial page paint, improving
 * Time-to-Interactive (TTI) on first load.
 *
 * The Loading skeleton is shown while the Builder chunk is being fetched.
 */
const Builder = dynamic(
  () => import('@/components/builder').then((m) => ({ default: m.Builder })),
  {
    ssr: false,
    loading: Loading,
  },
);

export function HomeContent() {
  return (
    <>
      <Builder />
      <Footer />
      <Toaster position="bottom-right" theme="dark" />
    </>
  );
}
