'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Users, RefreshCw } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { getAdminUsers } from '@/services/users.service';
import { formatAdminDate } from '@/utils/admin-date';
import type { AdminUsersPage } from '@/interfaces/user.interface';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [result, setResult] = useState<AdminUsersPage | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [countFailed, setCountFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  // Keep the platform total independent of the current search and page size.
  useEffect(() => {
    const controller = new AbortController();
    getAdminUsers({ limit: 1, signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setTotalUsers(data.total);
      })
      .catch(() => {
        if (!controller.signal.aborted) setCountFailed(true);
      });
    return () => controller.abort();
  }, [refresh]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAdminUsers({
          search,
          page,
          limit,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        // Recover if the dataset shrank while viewing a later page.
        if (page > Math.max(1, data.totalPages)) {
          setPage(Math.max(1, data.totalPages));
          return;
        }
        setResult(data);
        setLoading(false);
      } catch (failure) {
        if (controller.signal.aborted) return;
        setError(
          failure instanceof Error
            ? failure.message
            : 'No se pudieron cargar los usuarios.',
        );
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, page, limit, refresh]);

  const reload = () => {
    setLoading(true);
    setError('');
    setTotalUsers(null);
    setCountFailed(false);
    setRefresh((value) => value + 1);
  };
  const changePage = (value: number) => {
    setLoading(true);
    setPage(value);
  };
  const totalPages = result?.totalPages ?? 0;
  const startPage = Math.max(1, Math.min(page - 3, totalPages - 6));
  const visiblePages = Array.from(
    { length: Math.min(7, totalPages) },
    (_, index) => startPage + index,
  );
  const pageButton =
    'h-9 min-w-9 rounded-md px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#13A47D]';

  return (
    <div className="flex-1 bg-background-secondary font-sans text-white">
      <div className="flex">
        <AdminSidebar />
        <main className="min-w-0 flex-1 bg-background px-4 py-8 lg:px-10">
          <div className="mx-auto max-w-[1600px]">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Administración de Usuarios
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Consulta los perfiles y la actividad de los usuarios registrados.
            </p>

            <div className="mt-8 flex w-full max-w-sm items-center gap-4 rounded-2xl border border-[#2B332F] bg-[#1A201D] p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#123D30] text-[#13A47D]">
                <Users className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/55">
                  Usuarios registrados
                </p>
                <p
                  className="mt-1 text-2xl font-bold"
                  aria-label="Total de usuarios registrados"
                >
                  {totalUsers ?? '—'}
                </p>
                <p className="mt-1 text-sm text-white/40">
                  {countFailed
                    ? 'Total no disponible'
                    : totalUsers === null
                      ? 'Cargando total...'
                      : 'Total en la plataforma'}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  aria-label="Buscar usuarios"
                  placeholder="Buscar por nombre, usuario o correo..."
                  maxLength={100}
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                    setLoading(true);
                  }}
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#1A201D] pl-10 pr-4 text-sm outline-none placeholder:text-white/30 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                />
              </div>
              <button
                type="button"
                onClick={reload}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[#2B332F] bg-[#1A201D] px-4 text-sm hover:bg-white/5 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Recargar
              </button>
            </div>

            <div
              className="mt-6 overflow-x-auto rounded-2xl border border-[#2B332F] bg-[#1A201D]"
              aria-busy={loading}
            >
              {loading ? (
                <p role="status" className="px-5 py-16 text-center text-sm text-white/50">
                  Cargando usuarios...
                </p>
              ) : error ? (
                <div role="alert" className="px-5 py-12 text-center">
                  <p className="text-sm text-red-300">{error}</p>
                  <button
                    type="button"
                    onClick={reload}
                    className="mt-4 rounded-lg bg-[#157347] px-4 py-2 text-sm font-semibold hover:bg-[#1A8A56] cursor-pointer"
                  >
                    Reintentar
                  </button>
                </div>
              ) : result && result.data.length > 0 ? (
                <table className="w-full min-w-[1000px] table-fixed border-collapse text-left">
                  <caption className="sr-only">Listado de usuarios registrados</caption>
                  <colgroup>
                    <col />
                    <col className="w-[23%]" />
                    <col className="w-28" />
                    <col className="w-32" />
                    <col className="w-44" />
                    <col className="w-32" />
                  </colgroup>
                  <thead className="border-b border-[#2B332F] bg-[#151A17] text-xs uppercase tracking-wide text-white/45">
                    <tr>
                      {[
                        'Usuario y correo',
                        'Nombre completo',
                        'Rol',
                        'Verificación',
                        'Fecha de registro',
                        'Acciones',
                      ].map((label) => (
                        <th key={label} scope="col" className="px-5 py-4 font-medium">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((user) => (
                      <tr
                        key={user.user_id}
                        className="border-b border-[#2B332F] transition-colors last:border-b-0 hover:bg-white/[0.025]"
                      >
                        <td className="px-5 py-4 [overflow-wrap:anywhere]">
                          <p className="text-sm font-semibold">@{user.username}</p>
                          <p className="mt-1 text-xs text-white/50">{user.email}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-white/85 [overflow-wrap:anywhere]">
                          {user.name} {user.last_name}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${user.role.role_name === 'ADMIN' ? 'bg-[#123D30] text-[#65D7AB]' : 'bg-white/5 text-white/75'}`}
                          >
                            {user.role.role_name}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${user.email_verified ? 'bg-[#123D30] text-[#65D7AB]' : 'bg-amber-500/10 text-amber-200'}`}
                          >
                            {user.email_verified ? 'Verificado' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-white/55">
                          {formatAdminDate(user.register_date)}
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/usuarios/${user.user_id}`}
                            prefetch={false}
                            aria-label={`Gestionar usuario ${user.username}`}
                            className="inline-flex rounded-lg border border-[#2B332F] px-3 py-2 text-sm text-[#65D7AB] hover:bg-white/5"
                          >
                            Gestionar
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div
                  role="status"
                  className="flex flex-col items-center px-5 py-16 text-center"
                >
                  <Users className="mb-4 h-12 w-12 text-white/15" aria-hidden="true" />
                  <p className="font-medium">
                    {search.trim()
                      ? 'No se encontraron usuarios'
                      : 'No hay usuarios registrados'}
                  </p>
                  <p className="mt-1 text-sm text-white/50">
                    {search.trim()
                      ? 'Prueba con otro nombre, usuario o correo.'
                      : 'Los usuarios aparecerán aquí cuando se registren.'}
                  </p>
                </div>
              )}
            </div>

            {!loading && !error && result && result.total > 0 && (
              <div className="mt-4 flex flex-col gap-4 text-sm text-white/50 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-4">
                  <p role="status">
                    Mostrando {(page - 1) * limit + 1}–
                    {Math.min(page * limit, result.total)} de {result.total} usuarios
                  </p>
                  <label className="inline-flex items-center gap-2">
                    <select
                      aria-label="Usuarios por página"
                      value={limit}
                      onChange={(event) => {
                        setLimit(Number(event.target.value));
                        setPage(1);
                        setLoading(true);
                      }}
                      className="rounded-md border border-[#2B332F] bg-[#1A201D] px-2 py-1 text-white outline-none focus:border-[#157347] cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                    </select>
                    por página
                  </label>
                </div>
                <nav
                  aria-label="Paginación de usuarios"
                  className="flex flex-wrap items-center gap-1"
                >
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => changePage(page - 1)}
                    className={pageButton}
                  >
                    Anterior
                  </button>
                  {startPage > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Página 1"
                        onClick={() => changePage(1)}
                        className={pageButton}
                      >
                        1
                      </button>
                      {startPage > 2 && <span aria-hidden="true">…</span>}
                    </>
                  )}
                  {visiblePages.map((value) => (
                    <button
                      type="button"
                      key={value}
                      aria-label={`Página ${value}`}
                      aria-current={page === value ? 'page' : undefined}
                      disabled={page === value}
                      onClick={() => changePage(value)}
                      className={`${pageButton} ${page === value ? 'border border-[#1A6B50] bg-[#153D30] text-white disabled:opacity-100' : 'hover:bg-white/5 hover:text-white'}`}
                    >
                      {value}
                    </button>
                  ))}
                  {visiblePages.at(-1)! < totalPages && (
                    <>
                      {visiblePages.at(-1)! < totalPages - 1 && (
                        <span aria-hidden="true">…</span>
                      )}
                      <button
                        type="button"
                        aria-label={`Página ${totalPages}`}
                        onClick={() => changePage(totalPages)}
                        className={pageButton}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => changePage(page + 1)}
                    className={pageButton}
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
