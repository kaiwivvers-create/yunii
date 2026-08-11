import { Controller, Post, Put, Body } from '@nestjs/common';
import { AuthService, User } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Put('profile')
  updateProfile(@Body() body: { email: string; name?: string; profilePicture?: string }) {
    return this.authService.updateProfile(body);
  }

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

  @Post('request-password-reset')
  requestPasswordReset(@Body() body: { email: string }) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
