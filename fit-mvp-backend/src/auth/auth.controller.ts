import { Body, Controller, Post, UsePipes, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  type RegisterRequest,
  type LoginRequest,
} from '@fitness/api-client';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe<RegisterRequest>(RegisterRequestSchema))
  async register(@Body() registerDto: RegisterRequest) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe<LoginRequest>(LoginRequestSchema))
  async login(@Body() loginDto: LoginRequest) {
    return this.authService.login(loginDto);
  }
}
