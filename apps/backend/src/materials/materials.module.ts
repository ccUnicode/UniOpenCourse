import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AdminMaterialsController } from './admin-materials.controller';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { PrismaModule } from '../prisma/prisma.module';
import { createStorageConfig } from 'src/utils/storage.config';

@Module({
  imports: [
    PrismaModule,
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const storageDir = configService.get<string>('STORAGE_PATH', './storage');

        return {
          storage: createStorageConfig(storageDir),
        };
      },
    }),
  ],
  controllers: [AdminMaterialsController, MaterialsController],
  providers: [MaterialsService],
})
export class MaterialsModule {}
