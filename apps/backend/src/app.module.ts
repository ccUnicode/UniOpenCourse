import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { CoursesModule } from './courses/courses.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GlobalSearcherModule } from './global-searcher/global-searcher.module';
import { ClassesModule } from './classes/classes.module';
import { MaterialsModule } from './materials/materials.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    PrismaModule,
    AdminModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CoursesModule,
    PrismaModule,
    GlobalSearcherModule,
    ClassesModule,
    MaterialsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
