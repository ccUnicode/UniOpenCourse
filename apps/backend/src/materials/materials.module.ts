import { Module } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';

@Module({
  imports: [],
  controllers: [MaterialsController],
  providers: [MaterialsService],
})
export class MaterialsModule {}
