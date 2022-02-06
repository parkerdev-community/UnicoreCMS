import { Module } from '@nestjs/common';
import { ModsService } from './mods.service';
import { ModsController } from './mods.controller';

@Module({
  providers: [ModsService],
  controllers: [ModsController],
})
export class ModsModule {}
