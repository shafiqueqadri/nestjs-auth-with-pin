import { Connection } from 'mongoose';

import {
  USER_REPOSITORY,
  USERS,
  FORGET_PASSWORD_REPOSITORY,
  USERPROFIE_REPOSITORY,
  NOTIFICATION_PREFERENCE_REPOSITORY,
  CONNECTION_REQUEST_REPOSITORY,
  USERSMSCODE_REPOSITORY,
} from '../constants';
import {
  UserSchema,
  ForgetPasswordSchema,
  UserSmsCodeSchema,
} from '../database/schemas';

export const userProviders = [
  {
    provide: USER_REPOSITORY,
    useFactory: (connection: Connection) => connection.model(USERS, UserSchema),
    inject: ['DATABASE_CONNECTION'],
  },

  {
    provide: USERSMSCODE_REPOSITORY,
    useFactory: (connection: Connection) =>
      connection.model('userCode', UserSmsCodeSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
