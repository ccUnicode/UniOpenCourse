import { ClassesService } from './classes.service';
import { Controller, Get, Param } from '@nestjs/common'; 
@Controller()
export class ClassesController {
  constructor( private readonly classesService: ClassesService) {}

  @Get('courses/:id/classes')
  findAllByCourse(@Param('id') id: string) {
    return this.classesService.findAllByCourse(+id);
  }

  @Get('classes/:id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(+id);
  }

  @Get('classes/:id/materials')
  getMaterialsByClass(@Param('id') id: string) {
    return this.classesService.getMaterialsByClass(+id);
  }
}
