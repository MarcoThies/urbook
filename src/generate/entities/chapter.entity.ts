import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Exclude } from "class-transformer";
import { ApiKeyEntity } from "../../_shared/entities/api-keys.entity";
import { CharacterEntity } from "./character.entity";
import { BooksEntity } from "../../_shared/entities/books.entity";

@Entity('chapter')
export class ChapterEntity {
  @PrimaryGeneratedColumn('increment')
  chapterId: number;

  @ManyToOne(() => BooksEntity, book => book.chapters)
  @JoinColumn({ name: 'bookId' })  // Join with book ID
  book: BooksEntity;

  @Column({
    type: 'text',
    nullable: true,
    unique: false
  })
  paragraph: string

  @Column({
    type: 'varchar',
    nullable: true,
    unique: false
  })
  imageUrl: string

  @ManyToMany(() => CharacterEntity, character => character.chapter, { cascade: true })
  @JoinTable({name: 'chapter_character'})
  characters: CharacterEntity[];

  @Column({
    type: 'timestamp',
    unique: false,
    default: () => 'CURRENT_TIMESTAMP'
  })
  changed: Date;
}