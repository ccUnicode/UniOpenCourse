import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});
export default function Footer() {
  return (
    <footer
      className={`${plusJakartaSans.variable} bg-footer-bg text-footer-text h-auto md:h-20 px-4 md:px-10 bg-background-secondary flex items-center justify-center`}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-2 py-6 md:py-4 w-full text-center md:text-left">
        <p className="text-2xl font-bold md:ml-4">UniOpenCourseWare</p>
        <p className="text-sm text-muted">
          <Link href="/admin/login">©</Link> 2026 Unicode. Todos los derechos reservados.
        </p>
        <nav className="w-full md:w-50 mt-2 md:mt-0">
          <ul className="flex justify-center md:justify-start gap-10 text-m font-semibold items-center text-sm w-full">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/cursos">Cursos</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
