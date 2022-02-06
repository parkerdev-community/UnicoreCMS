import { Injectable } from '@nestjs/common';
import { Permission } from './enums/permissions.enum';
import { sortedUniq } from 'lodash';
import { NoOpQueryService } from '@nestjs-query/core';
import { RoleDTO } from './dto/role.dto';

@Injectable()
export class RolesService extends NoOpQueryService<RoleDTO> {
  public permissions: string[];

  constructor() // @InjectQueryService(Role) private rolesService: QueryService<Role>,
  {
    super();
  }

  autocompleate() {
    this.permissions = sortedUniq(
      Object.values(Permission)
        .map((perm) => {
          const perm_map = perm.split('.').map((part, index, perm_split) => {
            return [
              perm_split.map(
                (v, i, o) => perm_split.slice(0, -i).join('.') + '.*',
              ),
              perm_split.join('.'),
            ];
          });
          return perm_map;
        })
        .flat(3),
    ).filter((perm) => perm !== '.*')
  }
}
