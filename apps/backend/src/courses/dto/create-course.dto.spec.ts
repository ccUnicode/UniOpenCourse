import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCourseDto } from './create-course.dto';

const validCourse = {
  name: 'Calculo uno',
  course_code: 'CAL1',
  description: 'Curso de calculo',
};

const toDto = (payload: object) => plainToInstance(CreateCourseDto, payload);

describe('CreateCourseDto', () => {
  it('recorta el hash de una URL de Trikaweb', async () => {
    const dto = toDto({
      ...validCourse,
      url_trikaweb: 'https://trikaweb.ccunicode.org/curso#seccion',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.url_trikaweb).toBe('https://trikaweb.ccunicode.org/curso');
  });

  it('rechaza un url_trikaweb que no es texto y no lo convierte en null', async () => {
    const dto = toDto({
      ...validCourse,
      url_trikaweb: 12,
    });
    const errors = await validate(dto);

    expect(dto.url_trikaweb).toBe(12);
    expect(errors.some((error) => error.property === 'url_trikaweb')).toBe(true);
  });
});
