import { Injectable } from '@nestjs/common';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

// Mock database for demo purposes
const mockUsers: User[] = [
  {
    id: 1,
    email: 'kai@example.com',
    name: 'Kai',
    role: 'admin',
  },
];

@Injectable()
export class AuthService {
  async login(loginDto: { email: string; password: string }) {
    // Check if it's the admin user
    if (loginDto.email === 'kai@example.com' && loginDto.password === '250510') {
      return {
        access_token: 'admin-jwt-token',
        user: mockUsers[0],
      };
    }
    
    // For other users, return a mock response
    const user: User = {
      id: Date.now(),
      email: loginDto.email,
      name: 'User',
      role: 'user',
    };
    
    return {
      access_token: 'mock-jwt-token',
      user,
    };
  }

  async signup(signupDto: { name: string; email: string; password: string }) {
    // In a real app, you would create a user in the database
    // For now, we'll just return a mock response
    const user: User = {
      id: Date.now(),
      email: signupDto.email,
      name: signupDto.name,
      role: 'user',
    };
    
    return {
      access_token: 'mock-jwt-token',
      user,
    };
  }
}
