import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Image from 'next/image';
import GlobalSearcher from './global-searcher';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import HeaderMenu from './header-menu';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default async function Header() {
  const cookieStore = await cookies();
  const access_token = cookieStore.get('access_token');
  return (
    <header
      className={`${plusJakartaSans.variable} flex h-18 items-center justify-between bg-header-bg px-9 text-primary`}
    >
      <Link href={access_token ? '/dashboard' : '/'}>
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
          <span className="ml-4 text-2xl font-bold hidden lg:block">
            UniOpenCourseWare
          </span>
        </div>
      </Link>
      <div className="w-7/20 hidden sm:block min-w-75">
        <Suspense fallback={null}>
          <GlobalSearcher />
        </Suspense>
      </div>

      <HeaderMenu access_token={!!access_token} />
    </header>
  );
}
