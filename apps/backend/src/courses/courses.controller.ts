import { Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
  ) {
    const pageNum = page ? Math.max(1, parseInt(page, 10) || 1) : 1;
    const limitNum = limit ? Math.min(50, Math.max(1, parseInt(limit, 10) || 6)) : 6;
    return this.coursesService.findAll(pageNum, limitNum, q);
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

  // FIX IDOR: el userId ya no viene del cliente. Se extrae del token JWT validado.
  @UseGuards(JwtAuthGuard)
  @Post(':id/visit')
  registerVisit(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const userId = Number(req.user.sub);
    return this.coursesService.registerVisit(id, userId);
  }

  // FIX IDOR: eliminado @Param('userId'). El ID ahora proviene exclusivamente del token JWT.
  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  getUserDashboard(@Request() req) {
    const userId = Number(req.user.sub);
    return this.coursesService.getUserDashboard(userId);
  }
}

