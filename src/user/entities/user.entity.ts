import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert, OneToOne, JoinColumn
} from "typeorm";
import * as bcrypt from 'bcrypt';
import { Exclude } from "class-transformer";

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true
  })
  username: string;

  @Exclude()
  @Column({
    type: 'varchar',
    nullable: false
  })
  password: string;

  @Column({
    type: 'varchar',
    nullable: false
  })
  email: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}

