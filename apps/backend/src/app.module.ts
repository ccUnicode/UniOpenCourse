import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ClassesModule } from './classes/classes.module';
import { MaterialsModule } from './materials/materials.module';
@Module({
  imports: [
    AdminModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ClassesModule,
    MaterialsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
