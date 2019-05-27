import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  private id: number;

  @Column()
  private name: string;

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

}