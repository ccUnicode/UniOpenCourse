import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ClaseModule } from './clase/clase.module';
import { MaterialModule } from './material/material.module';
@Module({
  imports: [
    AdminModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ClaseModule,
    MaterialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
