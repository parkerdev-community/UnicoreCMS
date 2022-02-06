import { Controller, Get } from '@nestjs/common';
import { OnlineService } from './online.service';

@Controller('servers/online')
export class OnlineController {
  constructor (
    private onlineService: OnlineService
  ) {}

  @Get()
  findAll() {
    return this.onlineService.findAll()
  }
}
