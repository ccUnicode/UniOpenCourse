import { PartialType } from '@nestjs/mapped-types';
import { CreateClassDto } from './create-class.dto';

/** DTO for updating a class */
export class UpdateClassDto extends PartialType(CreateClassDto) {}
