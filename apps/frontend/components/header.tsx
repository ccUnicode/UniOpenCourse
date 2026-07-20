import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';

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
            <img
              className="h-8 mb-[-3px]"
              src="/logo.png"
              alt="Logo de Uni Open Course Ware"
            />
          </figure>
          <span className="text-2xl font-bold ml-4">UniOpenCourseWare</span>
        </div>
      </Link>
      <div className="searchContainer h-10 bg-black/10 border-border border rounded-full flex items-center px-4 w-7/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 18 18"
        >
          <path
            fill="#6F7973"
            d="m16.6 18-6.3-6.3A6.096 6.096 0 0 1 6.5 13c-1.817 0-3.354-.63-4.612-1.887C.629 9.854 0 8.317 0 6.5c0-1.817.63-3.354 1.887-4.612C3.146.629 4.683 0 6.5 0c1.817 0 3.354.63 4.613 1.887C12.37 3.146 13 4.683 13 6.5a6.096 6.096 0 0 1-1.3 3.8l6.3 6.3-1.4 1.4ZM6.5 11c1.25 0 2.313-.438 3.188-1.313C10.562 8.813 11 7.75 11 6.5c0-1.25-.438-2.313-1.313-3.188C8.813 2.438 7.75 2 6.5 2c-1.25 0-2.313.438-3.188 1.313C2.438 4.186 2 5.25 2 6.5c0 1.25.438 2.313 1.313 3.188C4.186 10.562 5.25 11 6.5 11Z"
          />
        </svg>
        <input
          type="text"
          placeholder="¿Qué quieres aprender hoy?"
          className="text-white bg-transparent border-none outline-none w-full px-4 placeholder:text-placeholder"
        />
      </div>
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
