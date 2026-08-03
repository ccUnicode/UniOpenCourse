const baseUrl = process.env.API_URL || 'http://localhost:3001';

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
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _err = error;
    return '';
  }
}

export async function getMaterialData(class_id: string) {
  const response = await fetch(`${baseUrl}/classes/${class_id}/materials`);
  const materials = await response.json();
  console.log(materials);
  if (materials.error) {
    return { error: materials.error, message: materials.message };
  }

  return materials;
}

export async function getClassData(class_id: string) {
  const response = await fetch(`${baseUrl}/classes/${class_id}`);
  const clase = await response.json();
  if (clase.error) {
    return { error: clase.error, message: clase.message };
  }

  clase.url_youtube = getEmbedUrl(clase.url_youtube);
  return clase;
}
