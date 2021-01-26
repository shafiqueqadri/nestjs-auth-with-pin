import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {}
