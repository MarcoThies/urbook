import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Exclude } from "class-transformer";
import { LogEntity } from "./log.entity";

@Entity('api-keys')
export class ApiKeyEntity {
  @PrimaryGeneratedColumn('increment')
  apiId: number;

  @Exclude()
  @Column({
    type: 'varchar',
    nullable: false,
    unique: true
  })
  apiHash: string;

  @Column({
    type: 'boolean',
    nullable: false,
    unique: false,
    default: false
  })
  admin: boolean;

  @Column({
    type: 'timestamp',
    unique: false,
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date;

  @Column({ 
    type: 'timestamp',
    nullable: true,
    unique: false,
  })
  lastUse: Date;
}