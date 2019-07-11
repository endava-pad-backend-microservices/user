import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
        unique: true,
        nullable: false,
      })
    private name: string;

}