import { Module } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';

@Module({
  imports: [],
  controllers: [ClassesController],
  providers: [ClassesService],
})

export class ClassesModule {}