import { Module } from '@nestjs/common';
import { DonatePermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';

@Module({
  providers: [DonatePermissionsService],
  controllers: [PermissionsController],
})
export class DonatePermissionsModule {}
