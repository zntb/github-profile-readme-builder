import { Toaster } from 'sonner';

import { Builder } from '@/components/builder';

export default function Home() {
  return (
    <>
      <Builder />
      <Toaster position="bottom-right" theme="dark" />
    </>
  );
}
