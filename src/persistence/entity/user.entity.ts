import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany, ManyToOne, JoinTable, ManyToMany } from "typeorm";
import { Role } from "./role.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @ManyToMany(type=>Role, roles=>roles.id)
  @JoinTable()
  public roles: Role[];

  @Column()
  private firstName: string;

  @Column()
  private lastName: string;

  @Column({
    unique: true,
  })
  private email: string;

  @Column()
  private password: string;

  @Column({
    default: false,
  })
  private enabled: boolean;

}
