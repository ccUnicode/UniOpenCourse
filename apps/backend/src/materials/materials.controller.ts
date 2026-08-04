import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { MaterialsService } from './materials.service';

@Controller('materials')
@UseGuards(ThrottlerGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, filename } = await this.materialsService.getDownloadableFile(id);

    // Obliga al navegador a descargar el archivo con el nombre original
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(stream);
  }
}
