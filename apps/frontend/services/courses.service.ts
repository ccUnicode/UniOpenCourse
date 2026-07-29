const baseUrl = process.env.API_URL || 'http://localhost:3001';

export async function getCarouselData() {
  let response = await fetch(`${baseUrl}/courses/carrusel`);
  let courses = await response.json();
  return courses;
}
export async function getCourseData(busqueda: string, page: number = 1) {
  let response = await fetch(`${baseUrl}/courses?q=${busqueda}&page=${page}`);
  let courses = await response.json();
  console.log(courses);
  return courses;
}
