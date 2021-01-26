import { Module } from '@nestjs/common';
import { UsersService } from 'src/services';
import { TwilioService } from 'src/services/twilliio/twilio.service';
import { mongooseProviders, userProviders } from '../../providers';

@Module({
  providers: [
    ...mongooseProviders,
    ...userProviders,
    UsersService,
    TwilioService,
  ],
  exports: [
    ...mongooseProviders,
    ...userProviders,
    UsersService,
    TwilioService,
  ],
})
export class DatabaseModule {}
