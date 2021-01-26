import * as mongoose from 'mongoose';
import { env } from 'process';

export const mongooseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(
        'mongodb://localhost:27017/locateMe-development?retryWrites=true&w=majority',
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
      ),
  },
];
