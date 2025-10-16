import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateKeyDto {
    @IsString()
    ownerId: string;

    @IsOptional()
    @IsNumber()
    limit?: number;

    @IsOptional()
    @IsNumber()
    windowSeconds?: number;

    @IsOptional()
    @IsString({ each: true })
    scopes: string[];
}