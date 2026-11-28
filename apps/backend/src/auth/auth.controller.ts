import {
  Controller,
  Body,
  Post,
  Get,
  UseGuards,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GoogleUserPayload } from './strategies/google.strategy';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }
  @Post('resend-verification')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
    return this.authService.logout();
  }
  @Post('admin/login')
  adminLogin(@Body() dto: LoginDto) {
    return this.authService.adminLogin(dto);
  }

  /**
   * Starts federated authentication with Google OAuth 2.0.
   * Redirects the user's browser to Google's consent screen.
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Handled by GoogleAuthGuard
  }

  /**
   * Google OAuth 2.0 callback handler.
   * Validates or registers the user, sets the session cookie, and redirects to the frontend.
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const googleUser = req.user as GoogleUserPayload;
    const result = await this.authService.validateGoogleUser(googleUser);

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect(
      `${frontendUrl}/auth/google/callback?token=${encodeURIComponent(result.access_token)}`,
    );
  }
}
