import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity, RoleEntity, SettingsEntity } from '../database/entities';
import { rolePerms } from '../database/seed';

// Real transactional email via Resend when RESEND_API_KEY is set.
// Falls back to demo mode (code/link printed to the server console).
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_EMAIL_FROM = 'UniVerse <onboarding@resend.dev>';

async function sendEmail(to: string, subject: string, html: string, from = DEFAULT_EMAIL_FROM) {
  if (!RESEND_API_KEY) {
    // Demo mode — no API key configured.
    console.log('[demo email] To: ' + to);
    console.log('[demo email] Subject: ' + subject);
    return { demo: true };
  }
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) console.error('Resend error:', error);
    return { sent: !error };
  } catch (err) {
    console.error('Resend send failed:', err);
    return { demo: true };
  }
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  emailVerified?: boolean;
  profilePicture?: string;
  permissions?: string[];
}

interface VerificationRecord {
  code: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  // In-memory stores (10-minute expiry)
  private verificationCodes = new Map<string, VerificationRecord>();
  private resetTokens = new Map<string, { email: string; expiresAt: number }>();

  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @InjectRepository(RoleEntity) private readonly roles: Repository<RoleEntity>,
    @InjectRepository(SettingsEntity) private readonly settings: Repository<SettingsEntity>,
  ) {}

  /** The configured app name (settings row), defaulting to 'UniVerse'. */
  private async appName(): Promise<string> {
    const rows = await this.settings.find({ order: { id: 'ASC' } });
    return (rows[0]?.appName || 'UniVerse').trim() || 'UniVerse';
  }

  private emailFrom(appName: string): string {
    return process.env.EMAIL_FROM || `${appName} <onboarding@resend.dev>`;
  }

  async login(loginDto: { email: string; password: string }) {
    const email = loginDto.email.trim().toLowerCase();
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('LOWER(u.email) = :email', { email })
      .getOne();

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const ok = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      access_token: this.makeToken(user),
      user: await this.safeUser(user),
    };
  }

  async signup(signupDto: { name: string; email: string; password: string }) {
    const email = signupDto.email.trim().toLowerCase();
    const exists = await this.users.findOne({ where: { email } });
    if (exists) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(signupDto.password, 10);
    const user = await this.users.save({
      name: signupDto.name || 'User',
      email,
      passwordHash,
      role: 'user',
      emailVerified: false,
      profilePicture: '',
    });

    return {
      access_token: this.makeToken(user),
      user: await this.safeUser(user),
    };
  }

  /**
   * Sends a 6-digit verification code by email. Demo mode (no RESEND_API_KEY):
   * the code is returned in the response and printed to the server console so
   * the flow can still be completed.
   */
  async sendVerificationCode(email: string) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.verificationCodes.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

    // eslint-disable-next-line no-console
    console.log(`[demo] Verification email to ${email}: your code is ${code}`);

    const name = await this.appName();
    const result = await sendEmail(
      email,
      `Your ${name} verification code`,
      `<p>Your ${name} verification code is:</p><h2 style="color:#9370DB">${code}</h2><p>It expires in 10 minutes.</p>`,
      this.emailFrom(name),
    );

    return {
      sent: true,
      email,
      // Only expose the code in demo mode
      demoCode: result.demo ? code : undefined,
      message: result.demo ? 'Demo mode: code shown in server console' : 'Verification code sent',
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

    // Persist verified status on the real user row
    await this.users.update({ email }, { emailVerified: true });

    return { verified: true, email };
  }

  /**
   * Starts a password reset: creates a one-time token and emails a reset link.
   * Always returns success (even for unknown emails) to avoid leaking which
   * accounts exist. Demo mode prints the link to the console.
   */
  async requestPasswordReset(email: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.users.findOne({ where: { email: normalized } });

    // Always return the same shape, regardless of whether the account exists.
    if (!user) {
      return { sent: true, message: 'If that account exists, a reset link has been sent.' };
    }

    const token = crypto.randomUUID();
    this.resetTokens.set(token, { email: normalized, expiresAt: Date.now() + 10 * 60 * 1000 });
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    // eslint-disable-next-line no-console
    console.log(`[demo] Password reset for ${normalized}: ${resetUrl}`);

    const name = await this.appName();
    const result = await sendEmail(
      normalized,
      `Reset your ${name} password`,
      `<p>We received a request to reset your password.</p><p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#9370DB;color:#fff;border-radius:8px;text-decoration:none">Reset password</a></p><p>This link expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`,
      this.emailFrom(name),
    );

    return {
      sent: true,
      message: 'If that account exists, a reset link has been sent.',
      demoUrl: result.demo ? resetUrl : undefined,
    };
  }

  /**
   * Persists profile edits (custom name / profile picture) to the user row so
   * they survive logout/login and appear on any device. Returns the refreshed
   * safe user object.
   */
  async updateProfile(body: { email: string; name?: string; profilePicture?: string }) {
    const email = (body.email || '').trim().toLowerCase();
    if (!email) throw new BadRequestException('email is required');
    const user = await this.users.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (name) user.name = name;
    }
    if (body.profilePicture !== undefined) {
      // Guard against absurdly large data-URL uploads
      user.profilePicture = String(body.profilePicture).slice(0, 2_000_000);
    }

    const saved = await this.users.save(user);
    return { user: await this.safeUser(saved) };
  }

  /** Resets a password with a valid one-time token. */
  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    const record = this.resetTokens.get(token);
    if (!record || record.expiresAt < Date.now()) {
      this.resetTokens.delete(token);
      throw new BadRequestException('This reset link is invalid or has expired');
    }
    this.resetTokens.delete(token);

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updated = await this.users.update({ email: record.email }, { passwordHash });
    if (!updated.affected) {
      throw new BadRequestException('This reset link is invalid or has expired');
    }
    return { ok: true, message: 'Password updated. You can now sign in.' };
  }

  private makeToken(user: UserEntity): string {
    return Buffer.from(
      JSON.stringify({ sub: user.id, email: user.email, role: user.role }),
    ).toString('base64');
  }

  private async safeUser(user: UserEntity): Promise<User> {
    const role = await this.roles.findOne({ where: { name: user.role } });
    const permissions =
      Array.isArray(user.permissions) && user.permissions.length
        ? user.permissions
        : rolePerms(user.role, role ? [role] : []);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: (user.role as User['role']) || 'user',
      emailVerified: user.emailVerified,
      profilePicture: user.profilePicture || '',
      permissions,
    };
  }
}
