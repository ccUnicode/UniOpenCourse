import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ClaseService } from './clase.service';
import { ClaseController } from './clase.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ClaseController],
  providers: [ClaseService],
})
export class ClaseModule {}
