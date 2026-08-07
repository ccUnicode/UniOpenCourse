'use client';
import * as Dialog from '@radix-ui/react-dialog';
import Navigation from './navigation';
import { useState } from 'react';
import MobileMenu from './mobile-menu';
export default function HeaderMenu({ access_token }: { access_token: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className="w-1/4 min-w-65 hidden md:block">
        <Navigation access_token={access_token} />
      </nav>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button className="md:hidden text-xl cursor-pointer">☰</button>
        </Dialog.Trigger>
        <MobileMenu access_token={access_token} setOpen={setOpen} />
      </Dialog.Root>
    </>
  );
}
