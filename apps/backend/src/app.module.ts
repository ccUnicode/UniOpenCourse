import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GlobalSearcherModule } from './global-searcher/global-searcher.module';

@Module({
  imports: [
    AdminModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    GlobalSearcherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
