import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

const toDto = (payload: object) => plainToInstance(CreateCategoryDto, payload);

describe('CreateCategoryDto', () => {
  it('validates a correct category payload', async () => {
    const dto = toDto({
      name: 'Programación Avanzada',
      description: 'Cursos avanzados de desarrollo de software',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('fails if name is missing or empty', async () => {
    const dto = toDto({
      name: '',
      description: 'Descripción válida',
    });
    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails if name exceeds 100 characters', async () => {
    const dto = toDto({
      name: 'a'.repeat(101),
      description: 'Descripción válida',
    });
    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails if description is missing or empty', async () => {
    const dto = toDto({
      name: 'Categoría válida',
      description: '',
    });
    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'description')).toBe(true);
  });
});
