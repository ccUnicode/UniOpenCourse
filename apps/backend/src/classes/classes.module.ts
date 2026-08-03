import { Module } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { AdminClassesController } from './admin-classes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClassesController, AdminClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
