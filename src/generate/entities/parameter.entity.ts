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
}