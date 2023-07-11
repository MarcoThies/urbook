import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BooksEntity } from "./books.entity";
import { Exclude } from "class-transformer";

@Entity('parameter')
export class ParameterEntity {
  @PrimaryGeneratedColumn('increment')
  paraId: number;

  @OneToOne(type => BooksEntity, book => book.parameterLink, { eager: true })
  bookLink: BooksEntity;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false
  })
  charName: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false
  })
  charGender: string;

  @Column({
    type: 'int',
    nullable: false,
    unique: false
  })
  charAge: number;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: false
  })
  optTopic: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: false
  })
  optSidekick: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: false
  })
  optPlace: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: false
  })
  optColor: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: false
  })
  optMoral: string;

  @Column({
    type: 'tinyint',
    nullable: false,
    unique: false
  })
  optChapterCount: number;
}

  /* OLD

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false
  })
  childFavColor: string

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false
  })
  childFavAnimal: string


  @Column({
    type: 'varchar',
    nullable: false,
    unique: false
  })
  childCountry: string

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false
  })
  childLanguage: string


  @Column({
    type: 'varchar',
    nullable: false,
    unique: false
  })
  topicMoralType: string

  @Column({
    type: 'tinyint',
    nullable: false,
    unique: false
  })
  topicChapterCount: number

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false
  })
  topicImageStyle: string

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false
  })
  topicSpecialTopic: string
} */