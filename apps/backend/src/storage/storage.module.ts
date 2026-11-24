import { Module } from '@nestjs/common';
import { StorageCleanupService } from './storage-cleanup.service';
import { StorageService } from './storage.service';

/** Provides cloud object storage operations via S3-compatible API */
@Module({
  providers: [StorageService, StorageCleanupService],
  exports: [StorageService, StorageCleanupService],
})
export class StorageModule {}
