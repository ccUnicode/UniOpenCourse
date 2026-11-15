import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';

/** Provides cloud object storage operations via S3-compatible API */
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
