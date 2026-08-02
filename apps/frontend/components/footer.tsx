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
      className={`${plusJakartaSans.variable} bg-footer-bg text-footer-text h-20 px-10 bg-background-secondary flex items-center`}
    >
      <div className="flex justify-between items-center gap-2 py-4 w-full">
        <p className="text-2xl font-bold ml-4">UniOpenCourseWare</p>
        <p className="text-sm text-muted">
          <Link href="/admin/login">©</Link> 2026 Unicode. Todos los derechos reservados.
        </p>
        <nav className="w-50">
          <ul className="flex gap-10 text-m font-semibold items-center text-sm w-full">
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
