import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('parameter')
export class ParameterEntity {
  @PrimaryGeneratedColumn('increment')
  paraId: number;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false
  })
  childName: string

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
    type: 'tinyint',
    nullable: false,
    unique: false
  })
  childAge: number

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
  childGender: string

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
}