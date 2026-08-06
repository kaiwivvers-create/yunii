import { Injectable } from '@nestjs/common';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  emailVerified?: boolean;
}

// Mock database for demo purposes
const mockUsers: User[] = [
  {
    id: 1,
    email: 'kai@example.com',
    name: 'Kai',
    role: 'admin',
    emailVerified: true,
  },
];

interface VerificationRecord {
  code: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  // In-memory store of email verification codes (10-minute expiry)
  private verificationCodes = new Map<string, VerificationRecord>();

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
      emailVerified: false,
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
      emailVerified: false,
    };

    return {
      access_token: 'mock-jwt-token',
      user,
    };
  }

  /**
   * "Sends" a 6-digit verification code to the given email.
   *
   * Demo mode: no real email provider is configured, so the code is returned in
   * the response (and printed to the server console) so the flow can be
   * completed. Swap this for a real provider (e.g. Resend, Postmark) later.
   */
  async sendVerificationCode(email: string) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.verificationCodes.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

    // eslint-disable-next-line no-console
    console.log(`[demo] Verification email to ${email}: your code is ${code}`);

    return {
      sent: true,
      email,
      // Demo only — remove once a real email provider is wired up
      demoCode: code,
      message: 'Verification code sent',
    };
  }

  async verifyEmailCode(email: string, code: string) {
    const record = this.verificationCodes.get(email);

    if (!record || record.expiresAt < Date.now()) {
      this.verificationCodes.delete(email);
      return { verified: false, reason: 'expired' };
    }

    if (record.code !== code) {
      return { verified: false, reason: 'invalid' };
    }

    this.verificationCodes.delete(email);

    // Mark the known demo user as verified
    const known = mockUsers.find((u) => u.email === email);
    if (known) known.emailVerified = true;

    return { verified: true, email };
  }
}
