import Link from 'next/link';
export default function Navigation({ access_token }: { access_token: boolean }) {
  return (
    <ul className="flex flex-col md:flex-row w-full items-center justify-between text-sm font-semibold">
      <li className="h-15 flex items-center">
        <Link href={access_token ? '/dashboard' : '/'}>Home</Link>
      </li>
      <li className="h-15 flex items-center">
        <Link href="/cursos">Cursos</Link>
      </li>

      {access_token ? (
        <li className="h-15 flex items-center">
          <Link href="/logout">Cerrar Sesión</Link>
        </li>
      ) : (
        <li className="h-15 flex items-center">
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
