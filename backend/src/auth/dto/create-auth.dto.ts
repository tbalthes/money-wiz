import { IsEmail, IsString, MinLength, IsNotEmpty } from "class-validator";

export class CreateAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
