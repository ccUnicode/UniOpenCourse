const baseUrl = process.env.API_URL || 'http://localhost:3001';

export async function getCarouselData() {
  const response = await fetch(`${baseUrl}/courses/carrusel`);
  const courses = await response.json();
  return courses;
}
export async function getCourseData(busqueda: string, page: number = 1) {
  const response = await fetch(`${baseUrl}/courses?q=${busqueda}&page=${page}`);
  const courses = await response.json();
  console.log(courses);
  return courses;
}

export async function getAdminCourseData(search: string, token: string) {
  const response = await fetch(`${baseUrl}/admin/courses?q=${search}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (data.error) {
    return { data: [], error: true, message: data.message };
  }
  return data;
}
