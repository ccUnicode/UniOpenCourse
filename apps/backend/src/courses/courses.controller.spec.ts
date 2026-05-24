import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

describe('CoursesController', () => {
  let controller: CoursesController;

  const mockCoursesService = {
    findAll: jest.fn(),
    findForCarousel: jest.fn(),
    findOneById: jest.fn(),
    getVisitsByCourseId: jest.fn(),
    getUserDashboard: jest.fn(),
    registerVisit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [{ provide: CoursesService, useValue: mockCoursesService }],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('delegates to service with default pagination', () => {
      mockCoursesService.findAll.mockReturnValue({ data: [], total: 0 });

      controller.findAll();

      expect(mockCoursesService.findAll).toHaveBeenCalledWith(1, 6, undefined);
    });

    it('parses page and limit query params', () => {
      mockCoursesService.findAll.mockReturnValue({ data: [], total: 0 });

      controller.findAll('2', '10', 'math');

      expect(mockCoursesService.findAll).toHaveBeenCalledWith(2, 10, 'math');
    });

    it('clamps invalid page to 1 and limit between 1 and 50', () => {
      mockCoursesService.findAll.mockReturnValue({ data: [], total: 0 });

      controller.findAll('0', '100', undefined);

      expect(mockCoursesService.findAll).toHaveBeenCalledWith(1, 50, undefined);
    });
  });

  describe('findForCarousel', () => {
    it('delegates to service', () => {
      mockCoursesService.findForCarousel.mockReturnValue([]);

      controller.findForCarousel();

      expect(mockCoursesService.findForCarousel).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('delegates to service with course id', () => {
      mockCoursesService.findOneById.mockReturnValue({ course_id: 1 });

      controller.findOne(1);

      expect(mockCoursesService.findOneById).toHaveBeenCalledWith(1);
    });
  });

  describe('getVisits', () => {
    it('delegates to service with course id', () => {
      mockCoursesService.getVisitsByCourseId.mockReturnValue({ total: 0, detalle: [] });

      controller.getVisits(3);

      expect(mockCoursesService.getVisitsByCourseId).toHaveBeenCalledWith(3);
    });
  });

  describe('getUserDashboard', () => {
    it('extracts userId from JWT and delegates to service', () => {
      const dashboard = { userId: 5, totalCourses: 1, courses: [] };
      mockCoursesService.getUserDashboard.mockReturnValue(dashboard);

      const result = controller.getUserDashboard({ user: { sub: '5' } });

      expect(mockCoursesService.getUserDashboard).toHaveBeenCalledWith(5);
      expect(result).toBe(dashboard);
    });
  });

  describe('registerVisit', () => {
    it('extracts userId from JWT and delegates to service', () => {
      const visit = { user_course_id: 1, user_id: 7, course_id: 2 };
      mockCoursesService.registerVisit.mockReturnValue(visit);

      const result = controller.registerVisit(2, { user: { sub: '7' } });

      expect(mockCoursesService.registerVisit).toHaveBeenCalledWith(2, 7);
      expect(result).toBe(visit);
    });
  });
});
