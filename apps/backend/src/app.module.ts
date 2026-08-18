import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoursesModule } from './courses/courses.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ClassesModule } from './classes/classes.module';
import { AuthModule } from './auth/auth.module';
import { MaterialsModule } from './materials/materials.module';
import { GlobalSearcherModule } from './global-searcher/global-searcher.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 600_000,
        limit: 5,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'storage'),
      serveRoot: '/storage',
    }),
    PrismaModule,
    CoursesModule,
    ClassesModule,
    MaterialsModule,
    AuthModule,
    GlobalSearcherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
