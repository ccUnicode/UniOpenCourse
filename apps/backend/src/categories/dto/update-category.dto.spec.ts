import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateCategoryDto } from './update-category.dto';

const toDto = (payload: object) => plainToInstance(UpdateCategoryDto, payload);

describe('UpdateCategoryDto', () => {
  it('validates a correct update payload with optional fields', async () => {
    const dto = toDto({
      name: 'Nueva Categoría',
      description: 'Nueva descripción',
      course_ids: [1, 2, 3],
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('allows an empty payload (all fields are optional)', async () => {
    const dto = toDto({});
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('fails if name exceeds 100 characters', async () => {
    const dto = toDto({
      name: 'a'.repeat(101),
    });
    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails if course_ids contains non-integer values', async () => {
    const dto = toDto({
      course_ids: ['invalid'],
    });
    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'course_ids')).toBe(true);
  });
});
