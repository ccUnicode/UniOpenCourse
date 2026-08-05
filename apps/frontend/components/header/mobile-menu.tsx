'use client';

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
    <div className={`fixed inset-0 z-50 transition ${open ? 'visible' : 'invisible'}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`absolute right-0 h-full w-80 bg-header-bg p-6 transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button onClick={() => setOpen(false)} className="mb-8 text-2xl">
          ✕
        </button>

        <div className="mb-8">
          <Suspense fallback={null}>
            <GlobalSearcher />
          </Suspense>
        </div>
        <nav>
          <Navigation access_token={access_token} />
        </nav>
      </aside>
    </div>
  );
}
