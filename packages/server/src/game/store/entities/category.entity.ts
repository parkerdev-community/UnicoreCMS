import { StorageManager } from "@common";
import { Kit } from "src/game/donate/groups/entities/kit.entity";
import { AfterRemove, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class Categoty {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column('text')
  description: string

  @Column({ nullable: true })
  icon: string

  @ManyToMany(() => Product, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  products: Product[];

  @ManyToMany(() => Kit, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  kits: Kit[];

  @AfterRemove()
  removeFile() {
    StorageManager.remove(this.icon);
  }
}