import { User } from 'src/admin/users/entities/user.entity';
import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Role {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column('simple-array', { default: '' })
  perms: string[];

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
