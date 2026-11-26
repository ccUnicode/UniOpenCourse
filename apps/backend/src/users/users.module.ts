import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminUsersController } from './admin-users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminUsersController],
  providers: [UsersService],
})
export class UsersModule {}
