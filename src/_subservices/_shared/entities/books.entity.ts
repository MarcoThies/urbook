import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiKeyEntity } from "./api-keys.entity";
import { ParameterEntity } from "./parameter.entity";
import { Exclude } from "class-transformer";
import { CharacterEntity } from "./character.entity";
import { ChapterEntity } from "./chapter.entity";

@Entity('books')
export class BooksEntity {
  @Exclude()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Exclude()
  @ManyToOne(() => ApiKeyEntity, { cascade : true, onDelete: "NO ACTION"})
  @JoinColumn({ name: "apiId"})
  apiKeyLink: ApiKeyEntity

  @Exclude()
  @OneToOne(type => ParameterEntity, params => params.bookLink, { cascade : true, onDelete: "CASCADE"})
  @JoinColumn()
  parameterLink: ParameterEntity

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true
  })
  bookId: string;

  @Exclude()
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