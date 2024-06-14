import { Module } from '@nestjs/common';
import { SettingsService } from './providers/settings.service';
import { SettingsController } from './controllers/settings.controller';
import { TwoFactorController } from './controllers/two_factor.controller';
import { TwoFactorService } from './providers/two_factor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/admin/users/entities/user.entity';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken])],
  providers: [SettingsService, TwoFactorService],
  controllers: [SettingsController, TwoFactorController],
  exports: [SettingsService, TwoFactorService],
})
export class SettingsModule {}
