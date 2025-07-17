// backend/src/auth/auth.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dto/create-user.dto";

// The @Controller('auth') decorator defines the base path for all routes in this file.
// So, all routes will start with /auth
@Controller("auth")
export class AuthController {
  // NestJS uses dependency injection to provide the AuthService instance.
  constructor(private readonly authService: AuthService) {}

  // The @Post('register') decorator makes this method handle POST requests to /auth/register
  @Post("register")
  // The @Body() decorator tells NestJS to grab the request body
  // and validate it against the CreateUserDto class.
  async register(@Body() createUserDto: CreateUserDto) {
    // The controller's only job is to delegate the work to the service.
    return this.authService.register(createUserDto);
  }

  // You will add the login endpoint here later.
  // @Post('login')
  // @HttpCode(HttpStatus.OK) // Set the success status code to 200
  // async login(@Body() loginDto: LoginDto) {
  //   return this.authService.login(loginDto);
  // }
}

// Remove duplicate AuthService declaration from this file.
// The AuthService should be defined only in 'auth.service.ts'.

// (Removed duplicate AuthService definition. AuthService should be imported from './auth.service')

// (Removed duplicate AuthService definition. AuthService should be imported from './auth.service')
