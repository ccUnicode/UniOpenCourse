import Link from 'next/link';
import { getCarouselData, getCourseData } from '@/services/courses.service';
import Carousel from '@/components/carousel';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ busqueda: string }>;
}) {
  const { busqueda = '' } = await searchParams;
  const courses_carousel = await getCarouselData();
  const courses = await getCourseData(busqueda);

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
      <section className="courses px-16">
        <h2 className=" mb-2 text-md font-bold text-muted uppercase font-semibold">
          Descubre contenido universitario gratuito
        </h2>
        <h1 className="text-2xl font-bold text-primary uppercase">
          Empieza ahora buscando tu curso
        </h1>
        <input type="text" placeholder="Search courses..." />
        {courses.data.map((course: any) => (
          <div key={course.course_id}>
            <h2>{course.name}</h2>
            <h3>{course.course_code}</h3>
            <p>{course.description}</p>
            <img src={course.url_image} alt={course.name} className="h-50" />
          </div>
        ))}
      </section>
    </>
  );
}
