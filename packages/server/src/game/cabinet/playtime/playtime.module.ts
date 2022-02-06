import { Module } from '@nestjs/common';
import { PlaytimeService } from './playtime.service';
import { PlaytimeController } from './playtime.controller';

@Module({
  providers: [PlaytimeService],
  controllers: [PlaytimeController],
})
export class PlaytimeModule {}
