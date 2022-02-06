import { Module } from '@nestjs/common';
import { ServersService } from './servers.service';
import { ModsModule } from './mods/mods.module';
import { OnlineModule } from './online/online.module';
import { ServersController } from './servers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from './entities/server.entity';

@Module({
  providers: [ServersService],
  imports: [ModsModule, OnlineModule, TypeOrmModule.forFeature([Server])],
  exports: [ServersService],
  controllers: [ServersController],
})
export class ServersModule {}
