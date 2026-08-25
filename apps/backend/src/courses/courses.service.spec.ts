import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { PrismaService } from '../prisma.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CoursesService', () => {
  let service: CoursesService;

  const mockPrisma = {
    course: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
    lastCourseVisit: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
  };
  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns paginated courses without search filter', async () => {
      mockPrisma.course.findMany.mockResolvedValue([{ course_id: 1, name: 'Course A' }]);
      mockPrisma.course.count.mockResolvedValue(1);

      const result = await service.findAll(1, 6);

      expect(mockPrisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 6, where: undefined }),
      );
      expect(result).toEqual({
        data: [{ course_id: 1, name: 'Course A' }],
        total: 1,
        page: 1,
        limit: 6,
        totalPages: 1,
      });
    });

    it('applies search filter when q is provided', async () => {
      mockPrisma.course.findMany.mockResolvedValue([]);
      mockPrisma.course.count.mockResolvedValue(0);

      const searchWhere = {
        OR: [
          { name: { contains: 'algebra', mode: 'insensitive' } },
          { course_code: { contains: 'algebra', mode: 'insensitive' } },
        ],
      };

      await service.findAll(2, 10, '  algebra  ');

      expect(mockPrisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
          where: searchWhere,
        }),
      );
      expect(mockPrisma.course.count).toHaveBeenCalledWith({ where: searchWhere });
    });

    it.each(['', '   '])('does not apply search filter when q is %j', async (q) => {
      mockPrisma.course.findMany.mockResolvedValue([]);
      mockPrisma.course.count.mockResolvedValue(0);

      await service.findAll(1, 6, q);

      expect(mockPrisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 6, where: undefined }),
      );
      expect(mockPrisma.course.count).toHaveBeenCalledWith({ where: undefined });
    });
  });

  describe('findForCarousel', () => {
    it('returns popular courses ordered by visits', async () => {
      const courses = [{ course_id: 1 }, { course_id: 2 }];
      mockPrisma.course.findMany.mockResolvedValue(courses);

      const result = await service.findForCarousel();

      expect(mockPrisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          orderBy: { visiting_users: { _count: 'desc' } },
        }),
      );
      expect(result).toBe(courses);
    });
  });

  describe('findOneById', () => {
    it('returns course when it exists', async () => {
      const course = { course_id: 1, name: 'Course A', classes: [], teacher: null };
      mockPrisma.course.findUnique.mockResolvedValue(course);

      await expect(service.findOneById(1)).resolves.toBe(course);
    });

    it('throws NotFoundException when course does not exist', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);

      const promise = service.findOneById(99);
      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('Curso no encontrado');
    });
  });

  describe('registerVisit', () => {
    it('upserts visit when course exists', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ course_id: 2 });
      const visit = { user_course_id: 10, user_id: 5, course_id: 2 };
      mockPrisma.lastCourseVisit.upsert.mockResolvedValue(visit);

      await expect(service.registerVisit(2, 5)).resolves.toBe(visit);
      expect(mockPrisma.lastCourseVisit.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id_course_id: { user_id: 5, course_id: 2 } },
        }),
      );
    });

    it('throws NotFoundException when course does not exist', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);

      await expect(service.registerVisit(2, 5)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getVisitsByCourseId', () => {
    it('returns visit history for an existing course', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ course_id: 1, name: 'Course A' });
      mockPrisma.lastCourseVisit.findMany.mockResolvedValue([
        { user_course_id: 1, user_id: 2, user: { username: 'john' } },
      ]);

      const result = await service.getVisitsByCourseId(1);

      expect(result).toEqual({
        curso: { id_curso: 1, nombre: 'Course A' },
        total: 1,
        detalle: [{ user_course_id: 1, user_id: 2, user: { username: 'john' } }],
      });
    });

    it('throws NotFoundException when course does not exist', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);

      await expect(service.getVisitsByCourseId(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserDashboard', () => {
    it('maps visited courses for the user', async () => {
      mockPrisma.lastCourseVisit.findMany.mockResolvedValue([
        {
          start_date: new Date('2026-01-01'),
          last_visit_date: new Date('2026-05-01'),
          course: {
            course_id: 3,
            name: 'Course C',
            course_code: 'CC101',
            url_image: 'img.png',
            description: 'Desc',
            teacher: {
              name: 'Juan',
              last_name: 'Perez',
            },
          },
        },
      ]);

      const result = await service.getUserDashboard(5);

      expect(mockPrisma.lastCourseVisit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { user_id: 5 } }),
      );
      expect(result.userId).toBe(5);
      expect(result.totalCourses).toBe(1);
      expect(result.courses[0]).toMatchObject({
        course_id: 3,
        name: 'Course C',
        course_code: 'CC101',
      });
    });
  });

  describe('getEvaluationsFromTrikaweb', () => {
    it('returns empty array if course not found or url missing', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);
      const result = await service.getEvaluationsFromTrikaweb(1);
      expect(result).toEqual([]);
    });

    it('returns empty array if url is invalid (SSRF prevention)', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({
        url_trikaweb: 'http://localhost:5432',
      });
      const result = await service.getEvaluationsFromTrikaweb(1);
      expect(result).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('fetches and parses evaluations correctly', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({
        url_trikaweb: 'https://trikaweb.ccunicode.org/test',
      });
      const html =
        '<section id="section-EVAL1"></section><section id="section-EVAL2"></section>';
      mockedAxios.get.mockResolvedValue({ data: html });

      const result = await service.getEvaluationsFromTrikaweb(1);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://trikaweb.ccunicode.org/test',
        {
          timeout: 5000,
          maxContentLength: 2000000,
          maxRedirects: 0,
        },
      );
      expect(result).toEqual([
        {
          id: 'EVAL1',
          label: 'EVAL1',
          link: 'https://trikaweb.ccunicode.org/test#section-EVAL1',
        },
        {
          id: 'EVAL2',
          label: 'EVAL2',
          link: 'https://trikaweb.ccunicode.org/test#section-EVAL2',
        },
      ]);
    });
  });
});
