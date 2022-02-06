import { Module } from '@nestjs/common';
import { DonateGroupsService } from './groups.service';
import { GroupsController } from './groups.controller';

@Module({
  providers: [DonateGroupsService],
  controllers: [GroupsController],
})
export class DonateGroupsModule {}
