import { IsString, IsNumber } from "class-validator";

export class GetAllUserRequest {
    @IsString()
    public username: string;

    @IsString()
    public email: string;

    @IsString()
    public firstName: string;

    @IsString()
    public lastName: string;

    @IsNumber()
    public limit: Number;

    @IsNumber()
    public offset: Number;
}
