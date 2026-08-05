import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Image from 'next/image';
import GlobalSearcher from './global-searcher';
import { Suspense } from 'react';
import { cookies } from 'next/headers';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default async function Header() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token');
  return (
    <header
      className={`${plusJakartaSans.variable} flex h-18 items-center justify-between bg-header-bg px-10 text-primary`}
    >
      <Link href={accessToken ? '/dashboard' : '/'}>
        <div className="flex items-center">
          <figure className="rounded-lg bg-white p-2">
            <Image
              className="mb-[-3px]"
              src="/logo.png"
              height={32}
              width={32}
              alt="Logo de Uni Open Course Ware"
            />
          </figure>
          <span className="ml-4 text-2xl font-bold">UniOpenCourseWare</span>
        </div>
      </Link>

      <Suspense fallback={null}>
        <GlobalSearcher />
      </Suspense>

      <nav className="w-1/4">
        <ul className="flex w-full items-center justify-between text-sm font-semibold">
          <li>
            <Link href={accessToken ? '/dashboard' : '/'}>Home</Link>
          </li>
          <li>
            <Link href="/cursos">Cursos</Link>
          </li>

          {accessToken ? (
            <>
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link href="/perfil">
                  <Image
                    src="/default-avatar.png"
                    alt="Perfil"
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                </Link>
              </li>
            </>
          ) : (
            <li>
              <Link href="/login">
                <button className="h-8 cursor-pointer rounded-full bg-accent px-6">
                  Iniciar Sesión
                </button>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
