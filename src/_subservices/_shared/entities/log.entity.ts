import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from 'typeorm';
import { Exclude } from "class-transformer";
import { ApiKeyEntity } from './api-keys.entity';
import { BooksEntity } from './books.entity';

@Entity()
export class LogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level: string;

  @Column()
  message: string;

  @Column({ nullable: true })
  trace: string;

  @Column({ nullable: true })
  context: string;

  @Column({
    type: 'timestamp',
    unique: false,
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP'
  })
  time: Date;

  @Exclude()
  @ManyToOne(() => ApiKeyEntity, { cascade : true, onDelete: "SET NULL"})
  @JoinColumn({ name: "apiId"})
  apiKeyLink: ApiKeyEntity;

  @Exclude()
  @ManyToOne(() => BooksEntity, { cascade : true, onDelete: "SET NULL"})
  @JoinColumn({ name: "bookId"})
  bookLink: BooksEntity;
}