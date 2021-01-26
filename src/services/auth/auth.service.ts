import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { jwtConstants, USERSMSCODE_REPOSITORY } from '../../constants';
import { Model } from 'mongoose';
import {
  IForgetPasswordDocument,
  IUserDocument,
  IUserSmsCodeDocument,
} from '../../database/schemas';
import { IGeneric } from 'src/interfaces';
import { CommonServices } from '../common/common.services';
import { ECodeRequest, ECodeRequestStatus, EUserRequest } from 'src/enums';

@Injectable()
export class AuthService extends CommonServices {
  constructor(
    @Inject(USERSMSCODE_REPOSITORY)
    readonly userSmsRepository: Model<IUserSmsCodeDocument>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  async validateUser(phone: string): Promise<any> {
    const user: any = await this.usersService.userRepository.findOne({
      phone: phone,
    });

    return user;
  }
  async validate(phone: string): Promise<IUserDocument> {
    console.log('Asdasd');
    const user = await this.validateUser(phone);
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
  async login(phone) {
    const user = await this.validate(phone);
    await this.usersService.sendSmsCode({
      userId: user._id,
      phone: phone,
      requestType: ECodeRequest.LOGIN,
    });
    await this.usersService.sendLoginSms(user);
    return user;
  }
  async getUserProfile(email: any) {
    try {
      const user = await this.usersService.findByEmail(email);
      console.log('user is------------------------------------- ', user);
    } catch (error) {
      console.log(this.messages.Error, error);
    }
  }
  // async deleteAllRequest(userId: any) {
  //   return await this.passwordRepository.remove({ userId });
  // }
  async forgetPassword(email: any) {
    const hash = bcrypt.hashSync(
      Math.floor(Math.random() * 1000 + 10300).toString(),
      jwtConstants.salt,
    );

    const messageToSend = this.messages.forgotPasswordEmail(
      email,
      hash,
      process.env.FRONT_END,
    );

    console.log(
      'message is send to email: ',
      email,
      ' message: ',
      messageToSend,
    );
    // this.usersService.sendEmail(email, messageToSend);
    return {
      success: true,
      msg: this.messages.verificationCodeSuccess,
    };
  }

  async checkSmsHash(phone, hash, type) {
    const code = await this.userSmsRepository
      .findOne({
        phone: phone,
        code: hash,
        requestType: type,
        status: ECodeRequestStatus.NOTEXPIRED,
      })
      .populate('user');
    if (code) {
      code.expireCode();
      if (type == ECodeRequest.LOGIN || type == ECodeRequest.REGISTRATION) {
        const user = await this.usersService.findOne({ phone: phone });
        if (type == ECodeRequest.REGISTRATION) {
          user.verifyPhone();
          return {
            data: [],
            status: HttpStatus.OK,
            error: null,
            message: this.messages.Success,
          };
        } else {
          const payload = {
            id: user._id,
            ...user,
          };
          return {
            data: {
              access_token: this.jwtService.sign(payload, { expiresIn: 60 }),
              ...user,
            },
            status: HttpStatus.OK,
            error: null,
            message: this.messages.Success,
          };
        }
      } else if (type == ECodeRequest.UPDATE_PROFILE) {
        const user = await this.usersService.userRepository.findOneAndUpdate(
          { _id: code.user._id },
          {
            phone: phone,
          },
        );
        return {
          data: user,
          status: HttpStatus.OK,
          error: null,
          message: this.messages.Success,
        };
      } else
        return {
          data: [],
          status: HttpStatus.OK,
          error: null,
          message: this.messages.Success,
        };
    } else
      return {
        data: [],
        error: true,
        status: HttpStatus.OK,
        message: this.messages.codeNotMatched,
      };
  }

  async updatePassword(email, password) {
    const pass = bcrypt.hashSync(password, jwtConstants.salt);
    this.usersService.userRepository
      .findOneAndUpdate(
        { email },
        { password: pass, isActive: true, emailVerified: true },
        { useFindAndModify: true },
      )
      .then(() => {
        console.log(this.messages.Success);
      })
      .catch((err) => {
        console.log(this.messages.Error, err);
      });

    // this.passwordRepository.findOneAndDelete({ email }).then((res: any) => {
    //   console.log(this.messages.successfullyDeleted);
    // });

    return {
      status: this.messages.Success,
      msg: this.messages.passwordUpdated,
    };
  }
}
