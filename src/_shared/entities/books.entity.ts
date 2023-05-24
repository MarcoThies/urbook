import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiKeyEntity } from "./api-keys.entity";
import { ParameterEntity } from "../../generate/entities/parameter.entity";
import { Exclude } from "class-transformer";
import { CharacterEntity } from "../../generate/entities/character.entity";
import { ChapterEntity } from "../../generate/entities/chapter.entity";

@Entity('books')
export class BooksEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Exclude()
  @ManyToOne(() => ApiKeyEntity, { cascade : true, onDelete: "NO ACTION"})
  @JoinColumn({ name: "apiId"})
  apiKeyLink: ApiKeyEntity

  @Exclude()
  @OneToOne(() => ParameterEntity, { cascade : true, onDelete: "CASCADE"})
  @JoinColumn({ name: "paraId"})
  parameterLink: ParameterEntity

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true
  })
  isbn: string;

  @Column({
    type: 'tinyint',
    nullable: false,
    unique: false
  })
  state: number;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: false
  })
  title: string;

  @OneToMany(
    () => ChapterEntity,
    chapter => chapter.book,
    { cascade:true, eager: true, onDelete: "CASCADE"})
  chapters: ChapterEntity[];

  @Column({
    type: 'timestamp',
    unique: false,
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date;

}