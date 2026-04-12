// 1. Herramientas de testing y mocks
import { Test, TestingModule } from '@nestjs/testing';
import { MaterialsService } from './materials.service';
import { PrismaService } from '../../prisma.service';

/**
 * Pruebas unitarias del servicio de materiales
 */
describe('MaterialsService', () => {
  let service: MaterialsService;
  let prisma: PrismaService;

  // Simula la base de datos de Prisma para no afectar la real
  const mockPrismaService = {
    material: {
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  // Configura el entorno de prueba e inyecta el mock
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MaterialsService>(MaterialsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // Limpia los registros de los espías después de cada test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Test: Guardado de archivos físicos
   */
  describe('createFile', () => {
    it('should create a material of type "file" with real uploaded file data', async () => {
      const dto = { class_id: 1 };
      
      // Simula el objeto que devuelve Multer
      const mockFile = { 
        originalname: 'documento.pdf', 
        filename: 'documento-123.pdf' 
      } as Express.Multer.File;

      const expectedResult = { 
        material_id: 1, 
        class_id: dto.class_id, 
        material_type: 'file',
        filename: mockFile.originalname,
        file_path: mockFile.filename 
      };

      mockPrismaService.material.create.mockResolvedValue(expectedResult);

      const result = await service.createFile(dto, mockFile);

      // Verifica que el servicio mapee correctamente el 'originalname' y el 'filename' único
      expect(result).toEqual(expectedResult);
      expect(prisma.material.create).toHaveBeenCalledWith({
        data: {
          class_id: dto.class_id,
          material_type: 'file',
          filename: mockFile.originalname,
          url_link: mockFile.filename,
        },
      });
    });
  });

  /**
   * Test: Guardado de enlaces web
   */
  describe('createLink', () => {
    it('should create a material of type "link"', async () => {
      const dto = { class_id: 1, filename: 'Video de YouTube', url_link: 'https://youtube.com' };
      const expectedResult = { material_id: 2, ...dto, material_type: 'link' };
      
      mockPrismaService.material.create.mockResolvedValue(expectedResult);

      const result = await service.createLink(dto);

      expect(result).toEqual(expectedResult);
      expect(prisma.material.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          material_type: 'link',
        },
      });
    });
  });

  /**
   * Test: Guardado de referencias de texto
   */
  describe('createReference', () => {
    it('should create a material of type "reference"', async () => {
      const dto = { class_id: 1, filename: 'Mi Libro', written_reference: 'Capítulo 4, página 20' };
      const expectedResult = { material_id: 3, ...dto, material_type: 'reference' };
      
      mockPrismaService.material.create.mockResolvedValue(expectedResult);

      const result = await service.createReference(dto);

      expect(result).toEqual(expectedResult);
      expect(prisma.material.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          material_type: 'reference',
        },
      });
    });
  });

  /**
   * Test: Eliminación del material
   */
  describe('remove', () => {
    it('should delete a material by its ID', async () => {
      const materialId = 10;
      const expectedResult = { material_id: materialId, filename: 'test.pdf', material_type: 'file' };
      
      mockPrismaService.material.delete.mockResolvedValue(expectedResult);

      const result = await service.remove(materialId);

      expect(result).toEqual(expectedResult);
      expect(prisma.material.delete).toHaveBeenCalledWith({
        where: { material_id: materialId },
      });
    });
  });
});
