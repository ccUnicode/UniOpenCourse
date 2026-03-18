import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateFileDto } from './dto/create-file.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { CreateReferenceDto } from './dto/create-reference.dto';

@Controller('admin/materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post('file')
  createFile(@Body() createFileDto: CreateFileDto) {
    return this.materialsService.createFile(createFileDto);
  }

  @Post('link')
  createLink(@Body() createLinkDto: CreateLinkDto) {
    return this.materialsService.createLink(createLinkDto);
  }

  @Post('reference')
  createReference(@Body() createReferenceDto: CreateReferenceDto) {
    return this.materialsService.createReference(createReferenceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialsService.remove(+id);
  }
}
