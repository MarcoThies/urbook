import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from "class-transformer";
import { BooksEntity } from "./books.entity";
import { ChapterEntity } from "./chapter.entity";
import { UsageEventTypes } from "../dto/get-usage.dto";

@Entity()
export class StatisticsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: UsageEventTypes,
    nullable: false
  })
  eventType: UsageEventTypes

  @Column({
    type: 'timestamp',
    unique: false,
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP'
  })
  time: Date;

  @Exclude()
  @ManyToOne(() => BooksEntity, { cascade : false, onDelete: "SET NULL"})
  @JoinColumn({ name: "bookId"})
  bookLink: BooksEntity;

  @Exclude()
  @ManyToOne(() => ChapterEntity, { cascade : false, onDelete: "SET NULL"})
  @JoinColumn({ name: "chapterId"})
  chapterLink: ChapterEntity;
}