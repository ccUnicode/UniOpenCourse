import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { SearchModule } from './search/search.module';
import { CoursesModule } from './courses/courses.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ClassesModule } from './classes/classes.module';
import { MaterialsModule } from './materials/materials.module';
@Module({
  imports: [
    PrismaModule,
    AdminModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SearchModule,
    CoursesModule,
    PrismaModule,
    ClassesModule,
    MaterialsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
