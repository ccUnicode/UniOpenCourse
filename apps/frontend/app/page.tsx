const baseUrl = 'http://localhost:3001';

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
      <main className="carousel">
        {courses_carousel.map((course: any) => (
          <div key={course.course_id}>
            <h2>{course.name}</h2>
            <h3>{course.course_code}</h3>
            <p>{course.description}</p>
            <img src={course.url_image} alt={course.name} className="h-50" />
          </div>
        ))}
      </main>
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
