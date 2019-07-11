import { IsString, IsEmail, IsArray } from 'class-validator';
import {Role} from './persistence/entity/role.entity';

export class CreateUserBody {
    @IsString()
    public name: string;

    @IsString()
    public password: string;

    @IsString()
    public firstName: string;

    @IsString()
    public lastName: string;

    @IsString()
    @IsEmail()
    public email: string;

    @IsArray()
    public roles: Role[];
}

