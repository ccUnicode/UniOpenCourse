import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { GlobalSearcherService } from './global-searcher.service';
import { SearchDto } from './dto/global-search.dto';

@Controller('search')
export class GlobalSearcherController {
  constructor(private readonly searcherService: GlobalSearcherService) {}
  @Get()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )
  search(@Query() query: SearchDto) {
    return this.searcherService.search(query);
  }
}
