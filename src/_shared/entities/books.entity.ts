import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiKeyEntity } from "./api-keys.entity";
import { Exclude } from "class-transformer";

@Entity('books')
export class BooksEntity {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Exclude()
  @OneToOne(() => ApiKeyEntity, { "cascade" : true})
  @JoinColumn({ name: "apiHash"})
  apiKeyLink: string

  @Column({
    type: 'varchar',
    nullable: true,
    unique: false
  })
  title: string


  @Column({
    type: 'timestamp',
    unique: false,
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date;

}