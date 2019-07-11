import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
        nullable: false,
        unique: true,
      })
    public name: string;

}
