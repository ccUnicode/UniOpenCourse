import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/interfaces/request.interface';

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

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  getUserDashboard(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.coursesService.getUserDashboard(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOneById(id);
  }

  @Get(':id/visits')
  getVisits(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.getVisitsByCourseId(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/visit')
  registerVisit(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const userId = Number(req.user.sub);
    return this.coursesService.registerVisit(id, userId);
  }

  @Get(':id/evaluations')
  getEvaluations(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.getEvaluationsFromTrikaweb(id);
  }
}
