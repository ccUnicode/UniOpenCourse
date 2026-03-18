import {Post, Get, Patch, Delete, Body, Param} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ClassesService } from './classes.service';
<<<<<<< HEAD
=======
import {CreateClassDto} from './dto/create-class.dto';
import {UpdateClassDto} from './dto/update-class.dto';
>>>>>>> 48e231dc6f2b9d8736bdc3cec2df6d8452ae0831

@Controller('admin/classes')
export class ClassesController {
    constructor (private readonly service: ClassesService) {}
    @Post()
    create(@Body() createClassDto: CreateClassDto) {
    return this.service.create(createClassDto);
    }

    @Get()
    findAll() {
    return this.service.findAll();
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
