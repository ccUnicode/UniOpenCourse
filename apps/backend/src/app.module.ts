import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { SearchModule } from './search/search.module';
import { CoursesModule } from './courses/courses.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AdminModule, SearchModule, CoursesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
