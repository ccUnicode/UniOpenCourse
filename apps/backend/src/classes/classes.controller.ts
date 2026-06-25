import { ClassesService } from './classes.service';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'; 

@Controller()
export class ClassesController {
  constructor( private readonly classesService: ClassesService) {}

  /** Retrieves all classes for a specific course */
  @Get('courses/:id/classes')
  findAllByCourse(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findAllByCourse(id);
  }

  /** Retrieves a specific class by its ID */
  @Get('classes/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findOne(id);
  }

  /** Retrieves all materials linked to a specific class */
  @Get('classes/:id/materials')
  getMaterialsByClass(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.getMaterialsByClass(id);
  }
}
