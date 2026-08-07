'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Suspense } from 'react';
import GlobalSearcher from './global-searcher';
import Navigation from './navigation';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  access_token: boolean;
}

export default function MobileMenu({ open, setOpen, access_token }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          className="fixed right-0 top-0 z-50
            h-screen w-80
            bg-header-bg
            p-6
            data-[state=open]:animate-in
            data-[state=closed]:animate-out"
        >
          <Dialog.Close asChild>
            <button className="mb-8 text-2xl cursor-pointer">x</button>
          </Dialog.Close>
          <div className="mb-4 sm:hidden">
            <Suspense fallback={null}>
              <GlobalSearcher onSearch={() => setOpen(false)} />
            </Suspense>
          </div>
          <Navigation access_token={access_token} onNavigate={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
