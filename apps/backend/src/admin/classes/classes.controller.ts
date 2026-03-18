import { Post, Get, Patch, Delete, Body, Param, Query, Controller } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Controller('admin/classes')
export class ClassesController {
  constructor(private readonly service: ClassesService) {}

  @Post()
  create(@Body() createClassDto: CreateClassDto) {
    return this.service.create(createClassDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
  ) {
    return this.service.findAll(search, page ? +page : 1);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.service.update(+id, updateClassDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
