import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  image: string;

  @CreateDateColumn()
  created: Date;
}
