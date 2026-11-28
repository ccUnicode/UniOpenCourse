'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, UserRound } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { getAdminUser } from '@/services/users.service';
import { formatAdminDate } from '@/utils/admin-date';
import type { AdminUserDetail } from '@/interfaces/user.interface';

type ProfileState =
  | { kind: 'loading' }
  | { kind: 'not-found' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; user: AdminUserDetail };

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  // A new route gets fresh state, so a previous user's profile is never shown.
  return <UserProfile key={userId} userId={userId} />;
}

function UserProfile({ userId }: { userId: string }) {
  const [state, setState] = useState<ProfileState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getAdminUser(userId, controller.signal)
      .then((user) => {
        if (!controller.signal.aborted)
          setState(user ? { kind: 'ready', user } : { kind: 'not-found' });
      })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            kind: 'error',
            message:
              failure instanceof Error
                ? failure.message
                : 'No se pudo cargar el perfil del usuario.',
          });
        }
      });
    return () => controller.abort();
  }, [userId, attempt]);

  const user = state.kind === 'ready' ? state.user : null;
  const backLink =
    'inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#2B332F] bg-[#1A201D] px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#13A47D]';

  return (
    <div className="flex-1 bg-background-secondary font-sans text-white">
      <div className="flex min-h-[calc(100vh-72px)]">
        <AdminSidebar />
        <main className="min-w-0 flex-1 bg-background px-4 py-8 lg:px-10">
          <div className="mx-auto max-w-[1600px] space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Detalle de usuario
                </h1>
                <p className="mt-1 text-sm text-white/50">
                  Consulta el perfil y los cursos visitados en la plataforma.
                </p>
              </div>
              <Link href="/admin/usuarios" className={`${backLink} shrink-0`}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Volver a usuarios
              </Link>
            </div>

            {state.kind === 'loading' && (
              <div
                role="status"
                className="rounded-2xl border border-[#2B332F] bg-[#1A201D] px-5 py-16 text-center text-sm text-white/50"
              >
                Cargando perfil del usuario...
              </div>
            )}

            {state.kind === 'not-found' && (
              <div
                role="status"
                className="rounded-2xl border border-[#2B332F] bg-[#1A201D] px-5 py-16 text-center"
              >
                <UserRound
                  className="mx-auto mb-4 h-12 w-12 text-white/20"
                  aria-hidden="true"
                />
                <h2 className="text-xl font-semibold">Usuario no encontrado</h2>
                <p className="mt-2 text-sm text-white/50">
                  El usuario solicitado no existe o el identificador no es válido.
                </p>
              </div>
            )}

            {state.kind === 'error' && (
              <div
                role="alert"
                className="rounded-2xl border border-[#2B332F] bg-[#1A201D] px-5 py-12 text-center"
              >
                <h2 className="text-lg font-semibold">No se pudo cargar el usuario</h2>
                <p className="mt-2 text-sm text-red-300">{state.message}</p>
                <button
                  type="button"
                  onClick={() => {
                    setState({ kind: 'loading' });
                    setAttempt((value) => value + 1);
                  }}
                  className="mt-4 cursor-pointer rounded-lg bg-[#157347] px-4 py-2 text-sm font-semibold hover:bg-[#1A8A56]"
                >
                  Reintentar
                </button>
              </div>
            )}

            {user && (
              <>
                <section
                  aria-labelledby="user-profile-heading"
                  className="rounded-2xl border border-[#2B332F] bg-[#1A201D] p-5 md:p-8"
                >
                  <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#123D30] text-[#65D7AB]">
                      <UserRound className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2
                        id="user-profile-heading"
                        className="text-xl font-bold [overflow-wrap:anywhere] md:text-2xl"
                      >
                        {user.name} {user.last_name}
                      </h2>
                      <p className="mt-1 text-sm text-white/55 [overflow-wrap:anywhere]">
                        @{user.username}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${user.role.role_name === 'ADMIN' ? 'bg-[#123D30] text-[#65D7AB]' : 'bg-white/5 text-white/75'}`}
                      >
                        {user.role.role_name}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${user.email_verified ? 'bg-[#123D30] text-[#65D7AB]' : 'bg-amber-500/10 text-amber-200'}`}
                      >
                        {user.email_verified ? 'Verificado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>

                  <dl className="mt-8 grid min-w-0 gap-6 border-t border-[#2B332F] pt-6 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="min-w-0">
                      <dt className="text-xs uppercase tracking-wide text-white/45">
                        Correo electrónico
                      </dt>
                      <dd className="mt-2 text-sm [overflow-wrap:anywhere]">
                        {user.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-white/45">
                        Fecha de registro
                      </dt>
                      <dd className="mt-2 text-sm">
                        {formatAdminDate(user.register_date)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-white/45">
                        Verificación de correo
                      </dt>
                      <dd className="mt-2 text-sm">
                        {user.email_verified
                          ? 'Correo verificado'
                          : 'Pendiente de verificación'}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section
                  aria-labelledby="user-visits-heading"
                  className="min-w-0 rounded-2xl border border-[#2B332F] bg-[#1A201D] p-5 md:p-8"
                >
                  <h2
                    id="user-visits-heading"
                    className="flex items-center gap-2 text-xl font-bold"
                  >
                    <BookOpen
                      className="h-5 w-5 shrink-0 text-[#65D7AB]"
                      aria-hidden="true"
                    />
                    Cursos visitados recientemente
                  </h2>
                  <p className="mt-1 text-sm text-white/50">
                    Historial ordenado por la última visita.
                  </p>

                  {user.visited_courses.length === 0 ? (
                    <div
                      role="status"
                      className="mt-6 rounded-xl border border-[#2B332F] px-4 py-12 text-center text-sm text-white/50"
                    >
                      Este usuario aún no ha visitado ningún curso.
                    </div>
                  ) : (
                    <div className="mt-6 overflow-x-auto rounded-xl border border-[#2B332F]">
                      <table className="w-full min-w-[800px] table-fixed border-collapse text-left">
                        <caption className="sr-only">
                          Cursos visitados por {user.name} {user.last_name}
                        </caption>
                        <colgroup>
                          <col />
                          <col className="w-44" />
                          <col className="w-44" />
                          <col className="w-32" />
                        </colgroup>
                        <thead className="border-b border-[#2B332F] bg-[#151A17] text-xs uppercase tracking-wide text-white/45">
                          <tr>
                            {[
                              'Curso y docente',
                              'Primera visita',
                              'Última visita',
                              'Acciones',
                            ].map((label) => (
                              <th
                                key={label}
                                scope="col"
                                className="px-5 py-4 font-medium"
                              >
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {user.visited_courses.map((visit) => (
                            <tr
                              key={visit.course_id}
                              className="border-b border-[#2B332F] last:border-b-0 hover:bg-white/[0.025]"
                            >
                              <td className="px-5 py-4 [overflow-wrap:anywhere]">
                                <p className="text-sm font-semibold">
                                  {visit.course.name}
                                </p>
                                <p className="mt-1 text-xs text-white/55">
                                  {visit.course.course_code}
                                </p>
                                <p className="mt-1 text-xs text-white/45">
                                  {visit.course.teacher.name}{' '}
                                  {visit.course.teacher.last_name}
                                </p>
                              </td>
                              <td className="px-5 py-4 text-sm text-white/55">
                                {formatAdminDate(visit.start_date)}
                              </td>
                              <td className="px-5 py-4 text-sm text-white/55">
                                {formatAdminDate(visit.last_visit_date)}
                              </td>
                              <td className="px-5 py-4">
                                <Link
                                  href={`/cursos/${visit.course_id}`}
                                  prefetch={false}
                                  className="inline-flex rounded-lg border border-[#2B332F] px-3 py-2 text-sm text-[#65D7AB] hover:bg-white/5"
                                >
                                  Ver curso
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
