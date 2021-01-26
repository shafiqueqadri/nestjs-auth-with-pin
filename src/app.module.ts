import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { UserController } from './controllers/user/user.controller';
import { TwilioService } from './services/twilliio/twilio.service';

@Module({
  imports: [
    DatabaseModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.mailtrap.io',
        port: 2525,
        secure: false,
        auth: {
          user: 'cf9355bea8ba94',
          pass: '265a283d6620ea',
        },
      },
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
    }),
    AuthModule,
  ],
  controllers: [AppController, AuthController, UserController],
  providers: [AppService, TwilioService],
})
export class AppModule {}
