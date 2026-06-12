import { Test, TestingModule } from '@nestjs/testing';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('MaterialsController (Public)', () => {
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
      .useValue({ canActivate: jest.fn(() => true) })
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
      // Setup mock return values
      const mockStream = {} as any; // fake stream object
      mockMaterialsService.getDownloadableFile.mockResolvedValue({
        stream: mockStream,
        filename: 'mi-archivo.pdf',
      });

      // Setup mock express response
      const mockRes = {
        set: jest.fn(),
      } as unknown as Response;

      // Execute
      const result = await controller.download(1, mockRes);

      // Verify Service call
      expect(service.getDownloadableFile).toHaveBeenCalledWith(1);

      // Verify Headers were set
      expect(mockRes.set).toHaveBeenCalledWith({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="mi-archivo.pdf"',
      });

      // Verify Return Type
      expect(result).toBeInstanceOf(StreamableFile);
    });
  });
});
