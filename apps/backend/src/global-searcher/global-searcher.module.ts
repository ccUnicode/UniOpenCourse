import { Module } from '@nestjs/common';
import { GlobalSearcherController } from './global-searcher.controller';
import { GlobalSearcherService } from './global-searcher.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GlobalSearcherController],
  providers: [GlobalSearcherService],
})
export class GlobalSearcherModule {}
