/* eslint-disable @typescript-eslint/ban-types */
import { Injectable, NestMiddleware, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../gaurds/jwt-auth.guard';

@Injectable()
export class AuthenticatedMiddleware implements NestMiddleware {
  public async use(req: Request, res: Response, next: Function) {
    next();
  }
}
