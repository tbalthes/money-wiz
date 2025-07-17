// backend/src/auth/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, IsNotEmpty } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
// This DTO is used to validate the data when creating a new user.
