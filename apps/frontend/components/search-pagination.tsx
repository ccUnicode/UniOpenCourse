'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Pagination } from './pagination';

interface SearchPaginationProps {
  page: number;
  totalPages: number;
}

export function SearchPagination({ page, totalPages }: SearchPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set('page', newPage.toString());

    router.push(`/busqueda?${params.toString()}`);
  };

  return (
    <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
  );
}
