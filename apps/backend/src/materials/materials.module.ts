import { Module } from '@nestjs/common';
import { AdminMaterialsController } from './admin-materials.controller';
import { MaterialsService } from './materials.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminMaterialsController],
  providers: [MaterialsService],
})
export class MaterialsModule {}
