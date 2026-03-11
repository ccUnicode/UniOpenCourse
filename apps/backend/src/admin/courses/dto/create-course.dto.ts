export class CreateCourseDto {
  nombre: string;
  codigo_curso: string;
  descripcion: string;
  url_imagen?: string;
  id_docente?: number;
  nombre_docente?: string;
  apellido_docente?: string;
}
