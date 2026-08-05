'use client';
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
      <button
        className="md:hidden text-xl cursor-pointer"
        onClick={() => {
          setOpen(!open);
        }}
      >
        ☰
      </button>
      <MobileMenu open={open} setOpen={setOpen} access_token={access_token} />
    </>
  );
}
