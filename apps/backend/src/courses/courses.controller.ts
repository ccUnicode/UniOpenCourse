import { Controller, Get, Param, ParseIntPipe, Post, Body, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginationSearchQueryDto } from '../common/dto/pagination-search-query.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(@Query() query: PaginationSearchQueryDto) {
    return this.coursesService.findAll(query.page, query.limit, query.search);
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
  getVisits(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.coursesService.getVisitsByCourseId(id, query.page, query.limit);
  }

  @Post(':id/visit')
  registerVisit(@Param('id', ParseIntPipe) id: number,
  @Body('userId') userId: number,
  ) {
    return this.coursesService.registerVisit(id, Number(userId));
  }

  @Get('dashboard/:userId')
  getUserDashboard(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.coursesService.getUserDashboard(userId, query.page, query.limit);
  }
}
