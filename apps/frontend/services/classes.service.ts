const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getEmbedUrl(youtubeUrl: string) {
  if (!youtubeUrl) {
    return '';
  }
  try {
    const url = new URL(youtubeUrl);
    // https://youtu.be/VIDEO_ID
    if (url.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    }

    // https://www.youtube.com/watch?v=VIDEO_ID
    if (url.hostname.includes('youtube.com') && url.pathname === '/watch') {
      const videoId = url.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }

    // https://www.youtube.com/embed/VIDEO_ID
    if (url.pathname.startsWith('/embed/')) {
      return url.href;
    }
    return '';
  } catch {
    return '';
  }
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 404) return { error: 'Not Found', statusCode: 404 };
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

export async function getMaterialData(class_id: string) {
  const response = await fetch(`${baseUrl}/classes/${class_id}/materials`);
  return handleResponse(response);
}

export async function getClassData(class_id: string) {
  const response = await fetch(`${baseUrl}/classes/${class_id}`);
  const clase = await handleResponse(response);
  if (clase.error) return clase;

  clase.url_youtube = getEmbedUrl(clase.url_youtube);
  return clase;
}

export async function getClassesByCourse(course_id: string) {
  const response = await fetch(`${baseUrl}/courses/${course_id}/classes`);
  return handleResponse(response);
}

export async function getCourse(course_id: string) {
  const response = await fetch(`${baseUrl}/courses/${course_id}`);
  return handleResponse(response);
}
