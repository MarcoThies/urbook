import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BooksEntity } from "../../_shared/entities/books.entity";
import { ChapterEntity } from "./chapter.entity";

@Entity('character')
export class CharacterEntity {
  @PrimaryGeneratedColumn('increment')
  characterId: number;

  @ManyToMany(() => ChapterEntity, chapter => chapter.characters)
  chapter: ChapterEntity[];

  @Column({
    type: 'varchar',
    nullable: true,
    unique: false
  })
  name: string

  @Column({
    type: 'text',
    nullable: true,
    unique: false
  })
  description: string

  @Column({
    type: 'text',
    nullable: true,
    unique: false
  })
  prompt: string

  @Column({
    type: 'varchar',
    nullable: true,
    unique: false
  })
  avatarUrl: string
}