import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BooksEntity } from "./books.entity";
import { ChapterEntity } from "./chapter.entity";
import { Exclude } from "class-transformer";

@Entity('character')
export class CharacterEntity {
  @Exclude()
  @PrimaryGeneratedColumn('increment')
  characterId: number;

  @ManyToMany(() => ChapterEntity, chapter => chapter.characters, {onDelete: "CASCADE"})
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

  @Exclude()
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