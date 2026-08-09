import { SearchResult } from '@/interfaces/search.interface';
import { formatType } from '@/services/search.service';
import Image from 'next/image';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function SearchResultCard({ resultado }: { resultado: SearchResult }) {
  return (
    <Link
      href={
        resultado.type === 'course'
          ? `/cursos/${resultado.secondary_id}`
          : `/cursos/${resultado.secondary_id}/clases/${resultado.id}`
      }
    >
      <div className="gap-4 flex flex-wrap justify-between items-center border rounded-xl border-border hover:border-button-border/50 duration-300 transition transition-colors px-4 py-5">
        <figure className="sm:min-w-75 w-60 h-40 sm:h-auto sm:w-1/4 sm:aspect-video relative mx-auto">
          <Image
            src={`${API_URL}/storage/${resultado.image}`}
            alt={resultado.title}
            fill
            unoptimized={process.env.NODE_ENV === 'development'}
            className="object-cover rounded-xl"
          />
        </figure>
        <div className="flex flex-col gap-2 md:gap-3 lg:min-w-100 lg:w-[72%] mx-auto ">
          <span className="px-1 md:px-3 py-1 md:py-2 w-17 font-bold bg-accent rounded-full text-xs text-center text-white uppercase">
            {formatType(resultado.type)}
          </span>
          <h1 className="text-xl md:text-2xl font-semibold">{resultado.title}</h1>
          <div className="flex gap-4">
            <div className="flex gap-2 items-center">
              {resultado.type === 'course' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 21 20"
                >
                  <path
                    fill="#C8D1CD"
                    d="M18.5 15a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H7.96c.35.61.54 1.3.54 2h10v11h-9v2m4-10v2h-6v13h-2v-6h-2v6h-2v-8H0V7a2 2 0 0 1 2-2h11.5Zm-7-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="28"
                  fill="none"
                  viewBox="0 0 18 22"
                >
                  <path
                    stroke="#C8D1CD"
                    strokeWidth="1.5"
                    d="M16.648 14.75h-12c-.93 0-1.395 0-1.777.102A3 3 0 0 0 .75 16.974"
                  />
                  <path
                    stroke="#C8D1CD"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                    d="M4.75 5.75h8m-8 3.5h5m-3 11.5c-2.828 0-4.243 0-5.121-.879C.75 18.993.75 17.578.75 14.75v-8c0-2.828 0-4.243.879-5.121C2.507.75 3.922.75 6.75.75h4c2.828 0 4.243 0 5.121.879.879.878.879 2.293.879 5.121m-6 14c2.828 0 4.243 0 5.121-.879.879-.878.879-2.293.879-5.121v-4"
                  />
                </svg>
              )}
              <span className="text-sm sm:text-base">{resultado.subtitle}</span>
            </div>
            -
            <span className="text-sm sm:text-base text-button-border/70">
              {resultado.meta}
            </span>
          </div>
          {resultado.description && (
            <p className="text-xs sm:text-sm text-muted line-clamp-5">
              {resultado.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
