import { IsString, IsNumber, IsArray } from "class-validator";
import { Role } from './persistence/entity/role.entity';

export class UpdateUserRequest {
    @IsNumber()
    public id: number;

    @IsString()
    public firstName: string;

    @IsString()
    public lastName: string;

    @IsArray()
    public roles: Role[]
}
