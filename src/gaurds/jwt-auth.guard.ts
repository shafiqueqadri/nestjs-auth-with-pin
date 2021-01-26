import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    console.log("2221");
    // You can throw an exception based on either "info" or "err" arguments
    // console.log(user, info, '##################JWT');
    if (err || !user) {
      console.log('ERROR', err);
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
@Injectable()
export class AdminAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    console.log("1222");
    // You can throw an exception based on either "info" or "err" arguments

    if (err || !user.isAdmin) {
      // console.log('ERROR', err);
      console.log('ERROR', err);
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

@Injectable()
export class CompanyGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    console.log("12");
    if (user.isManager || user.isAdmin || user.isSuperAdmin) return user;
    throw new HttpException('Priviliges not allowed', HttpStatus.FORBIDDEN);
  }
}

@Injectable()
export class ApplicantGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    console.log('1');
    if (user.isApplicant) return user;
    throw new HttpException('Priviliges not allowed', HttpStatus.FORBIDDEN);
  }
}
