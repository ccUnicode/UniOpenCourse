import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { UsersService } from './users.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@UsePipes(
  new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Lists registered users for authenticated administrators only. */
  @Get()
  findAll(@Query() query: FindAllUsersDto) {
    return this.usersService.findAll(query);
  }
}
