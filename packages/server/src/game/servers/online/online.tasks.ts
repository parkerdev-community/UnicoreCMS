
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ServersService } from '../servers.service';
import { OnlineService } from './online.service';
import { UpdateOnline } from './interfaces/update-online.interface';

@Injectable()
export class OnlineTasks {
  private readonly logger = new Logger(OnlineTasks.name);

  constructor (
    private onlineService: OnlineService,
    private serversService: ServersService
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async updateOnline() {
    const servers = await this.serversService.findAll(['online', 'query'])
    const serversUpdated: UpdateOnline[] = new Array()
    
    for (var server of servers) {
      const serverInstance = await this.onlineService.updateOnline(server)
      serversUpdated.push(serverInstance)
    }

    if (serversUpdated.find(upd => upd.updated)) {
      const onlines = await this.onlineService.updateOnlinesRecords()
      // Online updated
      // Send events...
      this.logger.debug('Online updated')
    }
  }
}