// backend/src/auth/auth.module.ts

import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

@Module({
  // This array is for importing other modules
  imports: [],

  // This array lists all controllers that belong to this module
  controllers: [AuthController],

  // This array lists all services/providers that belong to this module
  providers: [AuthService],
})
export class AuthModule {}
// This module encapsulates the authentication functionality of the application.
