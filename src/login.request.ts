import { IsString } from "class-validator";

export class LoginRequest {
    @IsString()
    public username: string;

    @IsString()
    public password: string;
}
