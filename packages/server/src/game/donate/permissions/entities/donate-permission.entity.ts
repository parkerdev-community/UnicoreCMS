import { Server } from 'src/game/servers/entities/server.entity';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Period } from '../../entities/period.entity';

@Entity()
export class DonatePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', {
    precision: 5,
    scale: 2,
  })
  price: number;

  @Column({
    nullable: true,
  })
  description: string;

  @Column()
  ingame_id: string;

  @ManyToMany(() => Server)
  servers: Server[];

  @ManyToMany(() => Period, (period) => period.donate_permissions)
  @JoinTable()
  periods: Period[];
}
