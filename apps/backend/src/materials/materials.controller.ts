import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { MaterialsService } from './materials.service';
import * as path from 'path';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, filename } = await this.materialsService.getDownloadableFile(id);
    const extension = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
    };

    // Obliga al navegador a descargar el archivo con el nombre original
    res.set({
      'Content-Type': mimeTypes[extension] || 'application/octet-stream',
    });
    res.attachment(filename);

    return new StreamableFile(stream);
  }
}
