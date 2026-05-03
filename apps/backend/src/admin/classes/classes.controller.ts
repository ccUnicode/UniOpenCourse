import { Post, Get, Patch, Delete, Body, Param, Query, Controller, ParseIntPipe } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Controller('admin/classes')
export class ClassesController {
  constructor(private readonly service: ClassesService) {}

  /** Creates a new class */
  @Post()
  create(@Body() createClassDto: CreateClassDto) {
    return this.service.create(createClassDto);
  }

  /** Retrieves a paginated list of classes, optionally filtered by search */
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  ) {
    return this.service.findAll(search, page ? page : 1);
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
