import { Injectable } from '@nestjs/common';

@Injectable()
export class CoursesService {
  create(data) {
    return 'Creacion del curso';
  }

  findAll() {
    return 'Devolviendo todos los cursos';
  }

  update(id: string, data) {
    return 'Actualizando el curso con id ' + id;
  }

  remove(id: string) {
    return 'Eliminando el curso con id ' + id;
  }
}
