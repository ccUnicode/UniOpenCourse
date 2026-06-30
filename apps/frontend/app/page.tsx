const baseUrl = process.env.API_URL || 'http://localhost:3001';

async function getCarouselData() {
  let response = await fetch(`${baseUrl}/courses/carrusel`);
  let courses = await response.json();
  return courses;
}
async function getCourseData(busqueda: string) {
  console.log(busqueda);
  let response = await fetch(`${baseUrl}/courses?q=${busqueda}`);
  let courses = await response.json();
  console.log(courses);
  return courses;
}

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
      <div className="hero flex justify-between p-16 h-119 items-center">
        <div className="hero-content flex flex-col gap-6  max-w-148">
          <h1 className="text-5xl font-bold text-primary">UniOpenCourseWare</h1>
          <h2 className="text-secondary text-2xl">Conocimiento disponible para todos</h2>
          <h3 className="text-muted text-lg">
            Encuentra clases universitarias grabadas y organizadas por curso de manera
            completamente gratuita.
          </h3>
          <div className="flex gap-4">
            <button className="flex items-center text-sm h-10 bg-accent rounded-full px-8 py-3">
              Iniciar sesión
            </button>
            <button className="flex items-center text-sm h-10 text-button-border border-button-border border rounded-full px-8 py-3">
              Registrarme
            </button>
          </div>
        </div>
        <div className="flex overflow-x-scroll w-128 flex-nowrap no-scrollbar">
          {courses_carousel.map((course: any) => (
            <div
              className="overflow-hidden min-w-128 w-full rounded-2xl border-border bg-background-secondary"
              key={course.course_id}
            >
              <figure>
                <img
                  src={course.url_image}
                  alt={course.name}
                  className="h-64 object-cover w-full"
                />
              </figure>
              <div className="p-6 w-full flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">{course.name}</h2>
                  <span className="px-4 py-1 bg-accent rounded-full text-xs">
                    {course.course_code}
                  </span>
                </div>
                <p className="line-clamp-2">{course.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <section className="courses">
        <h1>Courses</h1>
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
