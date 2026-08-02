import PaginationProps from '@/interfaces/pagination-props.interface';

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex gap-4 mt-4 justify-center items-center">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`${page === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="8"
          height="12"
          fill="none"
          viewBox="0 0 8 12"
        >
          <path fill="#F8F9FF" d="M6 12 0 6l6-6 1.4 1.4L2.8 6l4.6 4.6L6 12Z" />
        </svg>
      </button>
      <div className="flex gap-2">
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;

          return (
            <button
              key={pageNumber}
              className={`w-10 h-10 cursor-pointer rounded border transition ${
                page === pageNumber
                  ? 'bg-accent text-white border-accent'
                  : 'hover:bg-background-secondary border-border text-text-muted'
              }`}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
      <button
        className={`${
          page === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="8"
          height="12"
          fill="none"
          viewBox="0 0 8 12"
        >
          <path fill="#F8F9FF" d="M4.6 6 0 1.4 1.4 0l6 6-6 6L0 10.6 4.6 6Z" />
        </svg>
      </button>
    </div>
  );
}
