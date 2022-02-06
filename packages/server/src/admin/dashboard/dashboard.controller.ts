import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('admin/dashboard')
export class DashboardController {
  constructor (
    private dahboardService: DashboardService
  ) {}

  @Get('stat')
  stat() {
    return this.dahboardService.stats()
  }
}
