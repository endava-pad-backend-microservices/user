import { IsString, IsNumber } from "class-validator";

export class UpdateUserRequest {
    @IsNumber()
    public id: number;

    @IsString()
    public firstName: string;

    @IsString()
    public lastName: string;
}
