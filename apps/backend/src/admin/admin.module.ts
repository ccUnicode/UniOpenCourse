import { Module } from '@nestjs/common';
import { CoursesController } from './courses/courses.controller';
import { CoursesService } from './courses/courses.service';
import { ClassesController } from './classes/classes.controller';
import { ClassesService } from './classes/classes.service';
import { MaterialsController } from './materials/materials.controller';
import { MaterialsService } from './materials/materials.service';

@Module({
  controllers: [CoursesController, ClassesController, MaterialsController],
  providers: [CoursesService, ClassesService, MaterialsService],
})
export class AdminModule {}
