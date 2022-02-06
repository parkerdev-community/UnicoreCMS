import { StorageManager } from '@common';
import {
  AfterRemove,
  Column,
  Entity,
  ManyToMany,
  PrimaryColumn,
} from 'typeorm';
import { DonateGroup } from './donate-group.entity';

@Entity()
export class Kit {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  description?: string;

  @Column()
  image: string;

  @ManyToMany(() => DonateGroup, (group) => group.kits, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  groups: DonateGroup[];

  @AfterRemove()
  removeFile() {
    StorageManager.remove(this.image);
  }
}
