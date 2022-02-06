import { Module } from '@nestjs/common';
import { MigrationsModule } from './migrations/migrations.module';
import { RolesModule } from './roles/roles.module';
import { NewsModule } from './news/news.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LogModule } from './logs/logs.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    MigrationsModule,
    RolesModule,
    NewsModule,
    DashboardModule,
    LogModule,
    ConfigModule,
  ],
})
export class AdminModule {}
