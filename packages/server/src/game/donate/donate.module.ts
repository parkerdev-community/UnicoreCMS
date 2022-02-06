import { Module } from '@nestjs/common';
import { DonatePermissionsModule } from './permissions/permissions.module';
import { DonateGroupsModule } from './groups/groups.module';

@Module({
  imports: [DonatePermissionsModule, DonateGroupsModule],
})
export class DonateModule {}
