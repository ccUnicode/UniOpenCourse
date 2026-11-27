import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma';
import { PrismaService } from '../prisma.service';
import { StorageService } from './storage.service';

const POLL_INTERVAL_MS = 60_000;
const RETRY_DELAY_MS = 5 * POLL_INTERVAL_MS;
const BATCH_SIZE = 25;

@Injectable()
export class StorageCleanupService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(StorageCleanupService.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  onApplicationBootstrap() {
    this.timer = setInterval(() => void this.processPending(), POLL_INTERVAL_MS).unref();
    void this.processPending();
  }

  onModuleDestroy() {
    clearInterval(this.timer);
  }

  async enqueue(reference: string, db: Prisma.TransactionClient = this.prisma) {
    await db.storageCleanup.upsert({
      where: { reference },
      create: { reference },
      update: { retryAfter: new Date() },
    });
  }

  async discardUpload(reference: string) {
    // Preserve the original request error even if the database is still unavailable.
    try {
      if (!(await this.storage.deleteFile(reference))) await this.enqueue(reference);
    } catch (error) {
      this.logger.error(`No se pudo registrar la limpieza de ${reference}`, error);
    }
  }

  async processPending() {
    if (this.running) return;
    this.running = true;
    try {
      const jobs = await this.prisma.storageCleanup.findMany({
        where: { retryAfter: { lte: new Date() } },
        orderBy: [{ retryAfter: 'asc' }, { reference: 'asc' }],
        take: BATCH_SIZE,
      });
      for (const { reference } of jobs) {
        if (await this.storage.deleteFile(reference)) {
          await this.prisma.storageCleanup.deleteMany({ where: { reference } });
        } else {
          await this.prisma.storageCleanup.updateMany({
            where: { reference },
            data: { retryAfter: new Date(Date.now() + RETRY_DELAY_MS) },
          });
        }
      }
    } catch (error) {
      this.logger.error('No se pudieron procesar las limpiezas pendientes', error);
    } finally {
      this.running = false;
    }
  }
}
