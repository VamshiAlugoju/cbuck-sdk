import { Controller, Get } from '@nestjs/common';
import { StaticDocument } from './static.schema';
import { StaticService } from './static.service';
@Controller('static')
export class StaticController {
  constructor(private readonly staticService: StaticService) {}

  @Get('getInfo')
  getInfo() {
    return this.staticService.getInfo();
  }
}
