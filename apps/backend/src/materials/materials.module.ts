import { Module } from '@nestjs/common';
import { MaterialService } from './materials.service';
import { MaterialController } from './materials.controller';

@Module({
  controllers: [MaterialController],
  providers: [MaterialService],
})
export class MaterialsModule {}
