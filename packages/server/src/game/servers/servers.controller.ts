import {
  Controller,
  Get,
  NotFoundException,
} from '@nestjs/common';
import { ServersService } from './servers.service';

@Controller('servers')
export class ServersController {
  constructor(private serversService: ServersService) {}

  @Get()
  findAll() {
    return this.serversService.findAll(['online'])
  }

  @Get(':id')
  async findOne(id: string) {
    const server = await this.serversService.find(id, ['online', 'mods'])

    if (!server) {
      throw new NotFoundException()
    }

    return server
  }
}
