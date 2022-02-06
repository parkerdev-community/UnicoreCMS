import { Exclude } from 'class-transformer';
import { User } from '../entities/user.entity';

export class UserDto implements User {
  uuid: string;

  username: string;

  email: string;

  @Exclude()
  password: string;

  @Exclude()
  superuser: boolean;

  perms: string[];

  created: Date;

  updated: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
