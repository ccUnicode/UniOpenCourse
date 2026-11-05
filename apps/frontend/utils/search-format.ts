export function formatType(type: string) {
  switch (type) {
    case 'course':
      return 'Curso';
    case 'class':
      return 'Clase';
    default:
      return type;
  }
}
