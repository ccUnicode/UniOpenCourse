import Link from 'next/link';
export default function Navigation({
  access_token,
  onNavigate,
}: {
  access_token: boolean;
  onNavigate?: () => void;
}) {
  return (
    <ul className="flex flex-col md:flex-row w-full items-center justify-between text-sm font-semibold">
      <li className="h-15 flex items-center">
        <Link
          onClick={() => {
            onNavigate?.();
          }}
          href={access_token ? '/dashboard' : '/'}
        >
          Home
        </Link>
      </li>
      <li className="h-15 flex items-center">
        <Link
          onClick={() => {
            onNavigate?.();
          }}
          href="/cursos"
        >
          Cursos
        </Link>
      </li>

      {access_token ? (
        <li className="h-15 flex items-center">
          <Link
            onClick={() => {
              onNavigate?.();
            }}
            href="/logout"
          >
            Cerrar Sesión
          </Link>
        </li>
      ) : (
        <li className="h-15 flex items-center">
          <Link
            onClick={() => {
              onNavigate?.();
            }}
            href="/login"
          >
            <button className="h-8 cursor-pointer rounded-full bg-accent px-6">
              Iniciar Sesión
            </button>
          </Link>
        </li>
      )}
    </ul>
  );
}
