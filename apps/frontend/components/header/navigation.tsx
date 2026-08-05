import Link from 'next/link';
export default function Navigation({ access_token }: { access_token: boolean }) {
  return (
    <ul className="flex flex-column md:flex-row w-full items-center justify-between text-sm font-semibold">
      <li>
        <Link href={access_token ? '/dashboard' : '/'}>Home</Link>
      </li>
      <li>
        <Link href="/cursos">Cursos</Link>
      </li>

      {access_token ? (
        <li>
          <Link href="/logout">Cerrar Sesión</Link>
        </li>
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
  );
}
