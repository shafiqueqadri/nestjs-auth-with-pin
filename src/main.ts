import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, UnprocessableEntityException } from '@nestjs/common';

import { env } from 'process';
import { config as dotEnvConfig } from 'dotenv';
import { ValidationError } from 'class-validator';

dotEnvConfig();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: Array<ValidationError>) => {
        const _errors = errors.reduce((v: any, newVal: ValidationError) => {
          v[newVal.property] = Object.values(newVal.constraints);
          return v;
        }, {});
        return new UnprocessableEntityException(_errors);
      },
    }),
  );
  app.enableCors();

  await app.listen(env.PORT || 5000);
}
bootstrap();
