import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('api-keys')
export class ApiKeyEntity {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true
  })
  apiHash: string

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