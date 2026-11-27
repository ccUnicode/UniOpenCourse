import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateClassDto } from './create-class.dto';

const validClass = {
  course_id: 1,
  title: 'Clase de prueba',
  description: 'Descripcion de la clase',
};

const toDto = (payload: object) => plainToInstance(CreateClassDto, payload);

describe('CreateClassDto', () => {
  it('acepta youtu.be con varios parámetros', async () => {
    const dto = toDto({
      ...validClass,
      url_youtube: 'https://youtu.be/dQw4w9WgXcQ?si=abc&t=30',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.url_youtube).toBe('https://youtu.be/dQw4w9WgXcQ?si=abc&t=30');
  });

  it('acepta watch cuando v no es el primer parámetro', async () => {
    const dto = toDto({
      ...validClass,
      url_youtube: 'https://www.youtube.com/watch?t=30&v=dQw4w9WgXcQ',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rechaza un Short de YouTube', async () => {
    const dto = toDto({
      ...validClass,
      url_youtube: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'url_youtube')).toBe(true);
  });

  it('rechaza un url_youtube que no es texto y no lo convierte en vacío', async () => {
    const dto = toDto({
      ...validClass,
      url_youtube: 123,
    });
    const errors = await validate(dto);

    expect(dto.url_youtube).toBe(123);
    expect(errors.some((error) => error.property === 'url_youtube')).toBe(true);
  });
});
