import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AdminMaterialsController } from './admin-materials.controller';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [AdminMaterialsController, MaterialsController],
  providers: [MaterialsService],
})
export class MaterialsModule {}
