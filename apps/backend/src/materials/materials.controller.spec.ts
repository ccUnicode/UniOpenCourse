import { Test, TestingModule } from '@nestjs/testing';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { StreamableFile } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';

describe('MaterialsController', () => {
  let controller: MaterialsController;
  let service: MaterialsService;

  const mockMaterialsService = {
    getDownloadableFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialsController],
      providers: [
        {
          provide: MaterialsService,
          useValue: mockMaterialsService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MaterialsController>(MaterialsController);
    service = module.get<MaterialsService>(MaterialsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('download', () => {
    it('should set headers and return a StreamableFile', async () => {
      const mockStream = { pipe: jest.fn() } as any;
      const expectedFilename = 'test.pdf';

      mockMaterialsService.getDownloadableFile.mockResolvedValue({
        stream: mockStream,
        filename: expectedFilename,
      });

      const mockRes = {
        set: jest.fn(),
      } as unknown as Response;

      const result = await controller.download(1, mockRes);

      expect(mockMaterialsService.getDownloadableFile).toHaveBeenCalledWith(1);
      expect(mockRes.set).toHaveBeenCalledWith({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${expectedFilename}"`,
      });
      expect(result).toBeInstanceOf(StreamableFile);
    });
  });
});
