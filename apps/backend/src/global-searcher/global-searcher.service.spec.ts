import { Test, TestingModule } from '@nestjs/testing';
import { GlobalSearcherService } from './global-searcher.service';
import { PrismaService } from 'src/prisma.service';

describe('GlobalSearcherService', () => {
  let service: GlobalSearcherService;

  const prismaMock = {
    course: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    class: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalSearcherService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<GlobalSearcherService>(GlobalSearcherService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search()', () => {
    it('should return formatted search results', async () => {
      prismaMock.course.count.mockResolvedValue(5);
      prismaMock.class.count.mockResolvedValue(4);

      prismaMock.course.findMany.mockResolvedValue([
        {
          course_id: 1,
          name: 'Algorithms',
          course_code: 'CS101',
          url_image: 'course.png',
          description: 'description',
          teacher: {
            name: 'John Doe',
            last_name: 'Smith',
          },
        },
      ]);

      prismaMock.class.findMany.mockResolvedValue([
        {
          class_id: 10,
          title: 'Sorting',
          description: 'description',
          course: {
            course_id: 1,
            name: 'Algorithms',
            course_code: 'CS101',
            url_image: 'course.png',
          },
        },
      ]);

      const result = await service.search({
        q: 'algo',
        page: 1,
      });

      expect(result).toEqual({
        data: [
          {
            type: 'course',
            id: 1,
            secondary_id: 1,
            title: 'Algorithms',
            subtitle: 'John Doe Smith',
            image: 'course.png',
            description: 'description',
            meta: 'CS101',
          },
          {
            type: 'class',
            id: 10,
            secondary_id: 1,
            description: 'description',
            title: 'Sorting',
            subtitle: 'Algorithms',
            image: 'course.png',
            meta: 'CS101',
          },
        ],
        page: 1,
        totalPages: 2,
        totalResults: 9,
      });
    });

    it('should return empty data when nothing is found', async () => {
      prismaMock.course.count.mockResolvedValue(0);
      prismaMock.class.count.mockResolvedValue(0);

      prismaMock.course.findMany.mockResolvedValue([]);
      prismaMock.class.findMany.mockResolvedValue([]);

      const result = await service.search({
        q: 'nothing',
        page: 1,
      });

      expect(result).toEqual({
        data: [],
        page: 1,
        totalPages: 0,
        totalResults: 0,
      });
    });

    it('should use page 1 when page is less than 1', async () => {
      prismaMock.course.count.mockResolvedValue(0);
      prismaMock.class.count.mockResolvedValue(0);

      prismaMock.course.findMany.mockResolvedValue([]);
      prismaMock.class.findMany.mockResolvedValue([]);

      await service.search({
        q: 'test',
        page: -5,
      });

      expect(prismaMock.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
        }),
      );

      expect(prismaMock.class.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
        }),
      );
    });

    it('should limit page to the maximum page', async () => {
      prismaMock.course.count.mockResolvedValue(0);
      prismaMock.class.count.mockResolvedValue(0);

      prismaMock.course.findMany.mockResolvedValue([]);
      prismaMock.class.findMany.mockResolvedValue([]);

      await service.search({
        q: 'test',
        page: 5000,
      });

      expect(prismaMock.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: (1000 - 1) * 3,
        }),
      );
    });

    it('should search using case insensitive filter', async () => {
      prismaMock.course.count.mockResolvedValue(0);
      prismaMock.class.count.mockResolvedValue(0);

      prismaMock.course.findMany.mockResolvedValue([]);
      prismaMock.class.findMany.mockResolvedValue([]);

      await service.search({
        q: 'algo',
      });

      expect(prismaMock.course.count).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              name: {
                contains: 'algo',
                mode: 'insensitive',
              },
            },
            {
              course_code: {
                contains: 'algo',
                mode: 'insensitive',
              },
            },
          ],
        },
      });

      expect(prismaMock.class.count).toHaveBeenCalledWith({
        where: {
          title: {
            contains: 'algo',
            mode: 'insensitive',
          },
        },
      });
    });
    it('should calculate total pages correctly when only courses span multiple pages', async () => {
      prismaMock.course.count.mockResolvedValue(5);
      prismaMock.class.count.mockResolvedValue(0);

      prismaMock.course.findMany.mockResolvedValue([]);
      prismaMock.class.findMany.mockResolvedValue([]);

      const result = await service.search({
        q: 'algo',
        page: 1,
      });

      expect(result.totalPages).toBe(2);
    });
  });
});
