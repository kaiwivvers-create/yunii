import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login(loginDto: { email: string; password: string }) {
    // In a real app, you would validate credentials against a database
    // For now, we'll just return a mock response
    return {
      access_token: 'mock-jwt-token',
      user: {
        id: 1,
        email: loginDto.email,
        name: 'User',
      },
    };
  }

  async signup(signupDto: { name: string; email: string; password: string }) {
    // In a real app, you would create a user in the database
    // For now, we'll just return a mock response
    return {
      access_token: 'mock-jwt-token',
      user: {
        id: 1,
        email: signupDto.email,
        name: signupDto.name,
      },
    };
  }
}
