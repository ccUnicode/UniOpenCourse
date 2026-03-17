import { Module } from '@nestjs/common';
import { GlobalSearcherController } from './global-searcher.controller';
import { GlobalSearcherService } from './global-searcher.service';

@Module({
  controllers: [GlobalSearcherController],
  providers: [GlobalSearcherService]
})
export class GlobalSearcherModule {}
