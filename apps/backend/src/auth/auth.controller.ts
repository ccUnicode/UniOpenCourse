import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  login() {
    return this.authService.login();
  }
  @Post('register')
  register() {
    return this.authService.register();
  }
  @Post('logout')
  logout() {
    return this.authService.logout();
  }
  @Post('admin/login')
  adminLogin() {
    return this.authService.adminLogin();
  }
}
