import { applyDecorators } from '@nestjs/common';
import { Permission } from '../enums/permissions.enum';

type PermissionArgs = [...Permission[]] | [[...Permission[]], boolean]; // Or condition

export function Auth(...args: PermissionArgs) {
  return applyDecorators();
}
