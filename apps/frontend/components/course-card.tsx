import { Course } from '@/interfaces/course.interface';
import Image from 'next/image';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/cursos/${course.course_id}`} key={course.course_id}>
      <div className="group relative overflow-hidden max-w-110 w-full rounded-2xl border border-white/5 hover:border-white/20 bg-background-secondary transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1">
        <div className="z-10 flex items-center gap-0 transition-all duration-300 ease-in-out overflow-hidden group-hover:gap-1 font-bold absolute top-4 left-4 bg-header-bg rounded-full px-3 py-1 text-xs">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 7 8"
            className="mt-0.5 w-0 group-hover:w-2 h-2 transition-all duration-300 ease-in-out overflow-hidden"
          >
            <path
              fill="#fff"
              d="M0 .494C0 .41.02.328.058.254a.448.448 0 0 1 .63-.192L6.262 3.36a.51.51 0 0 1 0 .863L.688 7.521a.433.433 0 0 1-.225.062C.207 7.583 0 7.363 0 7.09V.494Z"
            />
          </svg>
          <p>Ir al curso</p>
        </div>
        <figure className="w-full relative aspect-video">
          <Image
            src={`${API_URL}/storage/${course.url_image}`}
            alt={course.name}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            fill
            unoptimized={process.env.NODE_ENV === 'development'}
          />
        </figure>
        <div className="p-5 md:p-6 w-full flex flex-col gap-6 rounded-b-2xl">
          <div className="flex gap-2 flex-col">
            <h2 className="text-xl font-bold">{course.name}</h2>
            <p className="line-clamp-3 text-sm text-muted">{course.description}</p>
          </div>
          <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
            <span className="text-xs font-medium text-muted/90 uppercase tracking-wider">
              {course.course_code}
            </span>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-muted/90">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="15"
                fill="none"
                viewBox="0 0 21 20"
              >
                <path
                  fill="#95a29d"
                  d="M18.5 15a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H7.96c.35.61.54 1.3.54 2h10v11h-9v2m4-10v2h-6v13h-2v-6h-2v6h-2v-8H0V7a2 2 0 0 1 2-2h11.5Zm-7-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
                />
              </svg>
              <p>
                {course.teacher.name} {course.teacher.last_name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
