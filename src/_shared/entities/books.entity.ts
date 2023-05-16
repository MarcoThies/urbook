import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiKeyEntity } from "./api-keys.entity";
import { ParameterEntity } from "../../generate/entities/parameter.entity";
import { Exclude } from "class-transformer";

@Entity('books')
export class BooksEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Exclude()
  @OneToOne(() => ApiKeyEntity, { "cascade" : true})
  @JoinColumn({ name: "id"})
  apiKeyLink: number

  @Exclude()
  @OneToOne(() => ParameterEntity, { "cascade" : true})
  @JoinColumn({ name: "id"})
  parameterLink: number

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true
  })
  isbn: string

  @Column({
    type: 'tinyint',
    nullable: false,
    unique: false
  })
  state: number

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