import { Toaster } from 'sonner';

import { Builder } from '@/components/builder';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <>
      <Builder />
      <Footer />
      <Toaster position="bottom-right" theme="dark" />
    </>
  );
}
