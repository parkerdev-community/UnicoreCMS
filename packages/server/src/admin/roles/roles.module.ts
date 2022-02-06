import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  providers: [RolesService],
  controllers: [RolesController],
})
export class RolesModule implements OnModuleInit {
  private logger = new Logger(RolesModule.name);

  constructor(private rolesService: RolesService) {}

  onModuleInit() {
    this.rolesService.autocompleate();
    this.logger.log(
      `Loaded ${this.rolesService.permissions.length} permissions for autocompleate`,
    );
  }
}
