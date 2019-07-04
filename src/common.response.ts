import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class Response {

    @IsBoolean()
    public success: boolean;

    @IsString()
    public message: string;

    @IsOptional()
    @IsNumber()
    public id?: number;

    @IsOptional()
    public data?: {};
}
