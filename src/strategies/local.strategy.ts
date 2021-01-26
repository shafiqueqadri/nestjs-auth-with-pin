import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'phone', passwordField: null });
  }

  async validate(phone: string): Promise<any> {
    console.log('Asdasd');
    const user = await this.authService.validateUser(phone);
    console.log('suser is', user);
    if (!user) {
      throw new HttpException('Incorrect phone number', HttpStatus.NOT_FOUND);
    }

    if (user && user.isBlocked == true) {
      throw new HttpException(
        'Your Account has been blocked by Admin',
        HttpStatus.FORBIDDEN,
      );
    }

    if (user && !user.emailVerified) {
      throw new HttpException(
        'Your Email is not verified',
        HttpStatus.FORBIDDEN,
      );
    }

    if (user && !user.phoneVerified) {
      throw new HttpException(
        'Your phone is not verified',
        HttpStatus.FORBIDDEN,
      );
    }

    return user;
  }
}
