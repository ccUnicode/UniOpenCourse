import Link from 'next/link';
import { getCarouselData } from '@/services/courses.service';
import Carousel from '@/components/carousel';
import { CourseSection } from '@/components/courses/course-section';

export const dynamic = 'force-dynamic';
export default async function Home() {
  const courses_carousel = await getCarouselData();

  return (
    <>
      <div className="hero flex justify-center xl:justify-between gap-8 md:gap-15 p-8 md:p-16 items-center flex-wrap w-full">
        <div className="hero-content flex flex-col gap-4 md:gap-6 max-w-140">
          <h1 className="text-2xl min-[470px]:text-4xl md:text-5xl font-bold text-primary text-center lg:text-left">
            UniOpenCourseWare
          </h1>
          <h2 className="text-secondary text-md min-[470px]:text-lg md:text-2xl text-center lg:text-left">
            Conocimiento disponible para todos
          </h2>
          <h3 className="text-xs min-[470px]:text-sm md:text-lg text-center lg:text-left">
            Encuentra clases universitarias grabadas y organizadas por curso de manera
            completamente gratuita.
          </h3>
          <div className="flex gap-4 justify-center lg:justify-start flex-wrap">
            <Link href="/login">
              <button className="flex items-center text-xs min-[470px]:text-sm h-10 bg-accent rounded-full px-8 py-3 cursor-pointer">
                Iniciar sesión
              </button>
            </Link>
            <Link href="/registro">
              <button className="cursor-pointer flex items-center text-xs min-[470px]:text-sm h-10 text-button-border border-button-border border rounded-full px-8 py-3">
                Registrarme
              </button>
            </Link>
          </div>
        </div>
        <Carousel data={courses_carousel} />
      </div>
      <CourseSection />
    </>
  );
}
