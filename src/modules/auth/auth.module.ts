import { Module } from '@nestjs/common';
import { AuthService } from 'src/services/auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { DatabaseModule } from '../database/database.module';
import { TwilioService } from 'src/services/twilliio/twilio.service';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, TwilioService],
  exports: [AuthService, TwilioService],
})
export class AuthModule {}
