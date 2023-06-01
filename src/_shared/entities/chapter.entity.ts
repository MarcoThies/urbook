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
import { ApiKeyEntity } from "./api-keys.entity";
import { CharacterEntity } from "./character.entity";
import { BooksEntity } from "./books.entity";

@Entity('chapter')
export class ChapterEntity {
  @Exclude()
  @PrimaryGeneratedColumn('increment')
  chapterId: number;

  @ManyToOne(() => BooksEntity, book => book.chapters, {onDelete: "CASCADE"})
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

  @Exclude()
  @Column({
    type: 'text',
    nullable: true,
    unique: false
  })
  prompt: string

  @Exclude()
  @ManyToMany(
    () => CharacterEntity,
      character => character.chapter,
    { cascade: true, eager: true, onDelete: "CASCADE"}
  )
  @JoinTable({name: 'chapter_character'})
  characters: CharacterEntity[];

  @Exclude()
  @Column({
    type: 'timestamp',
    unique: false,
    default: () => 'CURRENT_TIMESTAMP'
  })
  changed: Date;
}