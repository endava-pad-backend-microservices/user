import { Entity, Column, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Index } from "typeorm";
import { User } from "./user.entity";
import { EntityType } from "./entity.type.entity"

@Entity()
export class HashUser {

  @PrimaryGeneratedColumn()
  private id: number;

  @Column({
      unique: true,
      nullable: false,
    })
  @Index()
  private key: string;

  @OneToOne(type => User)
  @JoinColumn()
  private user: User;

  @Column({
    nullable: true
  })
  private creationDate : Date;

  @Column({
    nullable: true
  })
  private useDate : Date;

  @Column({
    type: "enum",
    enum: EntityType,
    default: EntityType.USER_CREATED,
    nullable: true
  })
  private type : EntityType;
}


