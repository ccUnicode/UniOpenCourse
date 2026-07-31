import Link from 'next/link';
import { getCarouselData } from '@/services/courses.service';
import Carousel from '@/components/carousel';
import { CourseSection } from '@/components/course-section';

export default async function Home() {
  const courses_carousel = await getCarouselData();

  return (
    <>
      <div className="hero flex justify-between p-16 items-center">
        <div className="hero-content flex flex-col gap-6  max-w-148">
          <h1 className="text-5xl font-bold text-primary">UniOpenCourseWare</h1>
          <h2 className="text-secondary text-2xl">Conocimiento disponible para todos</h2>
          <h3 className="text-muted text-lg">
            Encuentra clases universitarias grabadas y organizadas por curso de manera
            completamente gratuita.
          </h3>
          <div className="flex gap-4">
            <Link href="/login">
              <button className="flex items-center text-sm h-10 bg-accent rounded-full px-8 py-3 cursor-pointer">
                Iniciar sesión
              </button>
            </Link>
            <Link href="/registro">
              <button className="cursor-pointer flex items-center text-sm h-10 text-button-border border-button-border border rounded-full px-8 py-3">
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
