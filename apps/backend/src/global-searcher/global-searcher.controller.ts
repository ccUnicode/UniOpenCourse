import { Controller, Get, Query } from '@nestjs/common';
import { GlobalSearcherService } from './global-searcher.service';
import { SearchDto } from './dto/global-search.dto';

@Controller('search')
export class GlobalSearcherController {
  constructor(private readonly searcherService: GlobalSearcherService) {}
  @Get('')
  search(@Query() query: SearchDto) {
    return this.searcherService.search(query);
  }
  @Get('suggestions')
  getSuggestions(@Query('q') query: string) {
    return this.searcherService.getSuggestions(query);
  }
}
