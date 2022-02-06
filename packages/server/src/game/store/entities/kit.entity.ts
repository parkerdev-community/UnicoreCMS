import { StorageManager } from "@common";
import { Server } from "src/game/servers/entities/server.entity";
import { AfterRemove, Column, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Categoty } from "./category.entity";

export class Kit {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  ingame_id: string;

  @Column({ nullable: true })
  icon: string

  @Column({ nullable: true })
  image: string

  @Column('text')
  description: string

  @Column('decimal', {
    precision: 5,
    scale: 2,
  })
  price: number;

  @ManyToMany(() => Server, (server) => server.kits)
  servers: Server[];

  @ManyToMany(() => Categoty, (category) => category.kits)
  @JoinTable()
  categories: Categoty[];

  @AfterRemove()
  removeFile() {
    StorageManager.remove(this.icon);
    StorageManager.remove(this.image);
  }
}