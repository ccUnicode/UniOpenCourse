export function getEmbedUrl(youtubeUrl: string) {
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
