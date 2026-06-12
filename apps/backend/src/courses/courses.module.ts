import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { AdminCoursesController } from './admin-courses.controller';
import { CoursesService } from './courses.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CoursesController, AdminCoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
