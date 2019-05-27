import { IsString, IsEmail,} from 'class-validator';

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
}

