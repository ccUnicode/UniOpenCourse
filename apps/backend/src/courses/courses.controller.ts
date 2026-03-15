import { Controller, Get, Param, ParseIntPipe, Post, Body, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? Math.max(1, parseInt(page, 10) || 1) : 1;
    const limitNum = limit ? Math.min(50, Math.max(1, parseInt(limit, 10) || 6)) : 6;
    return this.coursesService.findAll(pageNum, limitNum);
  }

  @Get('carrusel')
  findForCarousel() {
    return this.coursesService.findForCarousel();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOneById(id);
  }

  @Get(':id/visits')
  getVisits(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.getVisitsByCourseId(id);
  }

  @Post(':id/visit')
  registerVisit(@Param('id', ParseIntPipe) id: number,
  @Body('userId') userId: number,
  ) {
    return this.coursesService.registerVisit(id, Number(userId));
  }
}
