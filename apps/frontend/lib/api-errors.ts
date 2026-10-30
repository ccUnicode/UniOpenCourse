/** Nest ValidationPipe returns `message` as a string or an array of strings. */
export async function readApiErrorMessages(
  response: Response,
  fallback: string,
): Promise<string[]> {
  try {
    const body = (await response.json()) as { message?: unknown };
    const message = body?.message;
    if (Array.isArray(message) && message.length > 0) {
      return message.filter((item): item is string => typeof item === 'string');
    }
    if (typeof message === 'string' && message.trim()) {
      return [message];
    }
  } catch {
    // Response body was not JSON.
  }
  return [fallback];
}

export async function throwApiError(response: Response, fallback: string): Promise<never> {
  const messages = await readApiErrorMessages(response, fallback);
  throw new Error(messages.join(' '));
}

export function sanitizeTrikawebUrl(url: string): string {
  return url.trim().split('#')[0];
}

export function mapCourseFieldErrors(message: string): Record<string, string> {
  const errors: Record<string, string> = {};
  const lower = message.toLowerCase();

  if (lower.includes('nombre del curso')) errors.name = message;
  if (lower.includes('código del curso') || lower.includes('codigo del curso')) {
    errors.course_code = message;
  }
  if (lower.includes('descripción del curso') || lower.includes('descripcion del curso')) {
    errors.description = message;
  }
  if (lower.includes('apellido del docente')) errors.teacher_last_name = message;
  else if (lower.includes('nombre del docente')) errors.teacher_name = message;
  if (lower.includes('url') || lower.includes('trikaweb')) errors.url_trikaweb = message;

  if (Object.keys(errors).length === 0) {
    errors.general = message;
  }
  return errors;
}

export const CLASS_LIMITS = {
  title: 150,
  description: 500,
  url_youtube: 150,
};

const YOUTUBE_WATCH_OR_SHARE_LINK =
  /^https:\/\/(?:(?:www|m)\.)?youtube\.com\/watch\?v=[\w-]{11}(?:&[\w.\-=%]*)*$|^https:\/\/youtu\.be\/[\w-]{11}(?:\?[\w.\-=%]*)?$/;

export function isValidYoutubeWatchUrl(url: string): boolean {
  return YOUTUBE_WATCH_OR_SHARE_LINK.test(url.trim());
}

export function mapClassFieldErrors(message: string): Record<string, string> {
  const errors: Record<string, string> = {};
  const lower = message.toLowerCase();

  if (lower.includes('título') || lower.includes('titulo')) errors.title = message;
  if (lower.includes('descripción de la clase') || lower.includes('descripcion de la clase')) {
    errors.description = message;
  }
  if (lower.includes('youtube')) errors.url_youtube = message;
  if (lower.includes('id del curso')) errors.course_id = message;

  if (Object.keys(errors).length === 0) {
    errors.general = message;
  }
  return errors;
}

export const MATERIAL_LIMITS = {
  filename: 150,
  url_link: 500,
  written_reference: 1000,
  fileSizeBytes: 5 * 1024 * 1024,
};

const ALLOWED_MATERIAL_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

export function isAllowedMaterialFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const hasAllowedExtension =
    name.endsWith('.pdf') ||
    name.endsWith('.png') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg');
  return hasAllowedExtension || ALLOWED_MATERIAL_FILE_TYPES.includes(file.type);
}

export function isHttpsUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

export function mapMaterialFieldErrors(message: string): Record<string, string> {
  const errors: Record<string, string> = {};
  const lower = message.toLowerCase();

  if (lower.includes('nombre del material')) {
    errors.title = message;
    errors.name = message;
  }
  if (lower.includes('enlace') || lower.includes('https')) errors.url = message;
  if (lower.includes('referencia')) {
    errors.content = message;
    errors.reference = message;
  }
  if (lower.includes('id de la clase')) errors.class_id = message;
  if (
    lower.includes('pdf') ||
    lower.includes('archivo') ||
    lower.includes('png') ||
    lower.includes('jpeg')
  ) {
    errors.file = message;
  }

  if (Object.keys(errors).length === 0) {
    errors.general = message;
    errors.name = message;
    errors.title = message;
  }
  return errors;
}
