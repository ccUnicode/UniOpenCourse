import { Post, Get, Patch, Delete, Body, Param, Query, Controller, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { PaginationSearchQueryDto } from '../../common/dto/pagination-search-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('admin/classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ClassesController {
  constructor(private readonly service: ClassesService) {}

  /** Creates a new class */
  @Post()
  create(@Body() createClassDto: CreateClassDto) {
    return this.service.create(createClassDto);
  }

  /** Retrieves a paginated list of classes, optionally filtered by search */
  @Get()
  findAll(@Query() query: PaginationSearchQueryDto) {
    const { page, limit, search } = query;
    return this.service.findAll(search, page, limit);
  }

  /** Retrieves a specific class by its ID */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /** Partially updates an existing class */
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateClassDto: UpdateClassDto) {
    return this.service.update(id, updateClassDto);
  }

  /** Deletes a class and its associated materials */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
