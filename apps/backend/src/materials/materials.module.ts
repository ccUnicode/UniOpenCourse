import { Module } from '@nestjs/common';
import { AdminMaterialsController } from './admin-materials.controller';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminMaterialsController, MaterialsController],
  providers: [MaterialsService],
})
export class MaterialsModule {}
