import { Entity, PrimaryGeneratedColumn, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class HashUser {
    @PrimaryGeneratedColumn()
    private key: string;

    @OneToOne(type => User)
    @JoinColumn()
    private user: User;
}
