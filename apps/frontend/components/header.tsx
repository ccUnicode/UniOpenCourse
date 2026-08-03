import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Image from 'next/image';
import GlobalSearcher from './global-searcher';
import { Suspense } from 'react';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function Header() {
  return (
    <header
      className={`${plusJakartaSans.variable} flex h-18 items-center justify-between bg-header-bg px-10 text-primary`}
    >
      <Link href="/">
        <div className="flex items-center">
          <figure className="bg-white p-2 rounded-lg">
            <Image
              className="mb-[-3px]"
              src="/logo.png"
              height={32}
              width={32}
              alt="Logo de Uni Open Course Ware"
            />
          </figure>
          <span className="text-2xl font-bold ml-4">UniOpenCourseWare</span>
        </div>
      </Link>
      <Suspense fallback={null}>
        <GlobalSearcher />
      </Suspense>
      <nav className="w-1/4">
        <ul className="flex justify-between text-m font-semibold items-center text-sm w-full">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/cursos">Cursos</Link>
          </li>
          <li className="access-button">
            <Link href="/login">
              <button className="h-8 rounded-full bg-accent px-6 cursor-pointer">
                Iniciar Sesión
              </button>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
