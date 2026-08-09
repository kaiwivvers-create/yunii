import { Controller, Post, Body } from '@nestjs/common';
import { AuthService, User } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: { email: string; password: string }): Promise<{ access_token: string; user: User }> {
    return this.authService.login(loginDto);
  }

  @Post('signup')
  signup(@Body() signupDto: { name: string; email: string; password: string }): Promise<{ access_token: string; user: User }> {
    return this.authService.signup(signupDto);
  }

  @Post('send-verification-code')
  sendVerificationCode(@Body() body: { email: string }) {
    return this.authService.sendVerificationCode(body.email);
  }

  @Post('verify-email-code')
  verifyEmailCode(@Body() body: { email: string; code: string }) {
    return this.authService.verifyEmailCode(body.email, body.code);
  }
}
