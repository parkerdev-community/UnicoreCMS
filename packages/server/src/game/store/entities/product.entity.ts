import { StorageManager } from "@common";
import { Server } from "src/game/servers/entities/server.entity";
import { AfterRemove, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Categoty } from "./category.entity";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ nullable: true })
  icon: string

  @Column('text')
  description: string

  @ManyToMany(() => Server, (server) => server.products)
  servers: Server[];

  @ManyToMany(() => Categoty, (category) => category.products)
  @JoinTable()
  categories: Categoty[];

  @Column('decimal', {
    precision: 5,
    scale: 2,
  })
  price: number;

  @Column()
  item_id: string

  @Column({ default: 64 })
  stack_size: number

  @AfterRemove()
  removeFile() {
    StorageManager.remove(this.icon);
  }
}