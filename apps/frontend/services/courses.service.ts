const baseUrl = process.env.API_URL || 'http://localhost:3001';

export async function getCarouselData() {
  let response = await fetch(`${baseUrl}/courses/carrusel`);
  let courses = await response.json();
  return courses;
}
export async function getCourseData(busqueda: string) {
  console.log(busqueda);
  let response = await fetch(`${baseUrl}/courses?q=${busqueda}`);
  let courses = await response.json();
  console.log(courses);
  return courses;
}
