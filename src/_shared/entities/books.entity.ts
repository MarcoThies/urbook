import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiKeyEntity } from "./api-keys.entity";
import { ParameterEntity } from "../../generate/entities/parameter.entity";
import { Exclude } from "class-transformer";

@Entity('books')
export class BooksEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Exclude()
  @ManyToOne(() => ApiKeyEntity, { "cascade" : true})
  @JoinColumn({ name: "apiId"})
  apiKeyLink: ApiKeyEntity

  @Exclude()
  @OneToOne(() => ParameterEntity, { "cascade" : true})
  @JoinColumn({ name: "paraId"})
  parameterLink: ParameterEntity

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