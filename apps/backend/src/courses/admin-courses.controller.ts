import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UploadedFile,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminCoursesController {
  constructor(private readonly service: CoursesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg'];

        if (!allowed.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Tipo de imagen no permitido. Solo se aceptan PNGs y JPEGs.',
            ),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  create(@Body() dto: CreateCourseDto, @UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('La imagen del curso es obligatoria.');
    }

    return this.service.create(dto, file);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
  ) {
    const pageNum = page ? Math.max(1, parseInt(page, 10) || 1) : 1;
    const limitNum = limit ? Math.min(50, Math.max(1, parseInt(limit, 10) || 6)) : 6;
    return this.service.findAll(pageNum, limitNum, q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg'];

        if (!allowed.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Tipo de imagen no permitido. Solo se aceptan PNGs y JPEGs.',
            ),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() dto: CreateCourseDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.update(id, dto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
