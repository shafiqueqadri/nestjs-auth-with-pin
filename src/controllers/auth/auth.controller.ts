/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable prettier/prettier */
import {
  Controller,
  UseGuards,
  Post,
  Request,
  Body,
  Res,
  Req,
  Get,
  HttpStatus,
  Param,
  Query,
  Logger,
  Put,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDto, resendDto, resetPasswordDto } from 'src/dto';
import { AuthService, UsersService, CommonServices } from 'src/services';
import { jwtConstants, emailRegex, nameRegex } from 'src/constants';
import * as bcrypt from 'bcrypt';
import { LocalAuthGuard } from 'src/gaurds/local-auth.guards';
import { IUserDocument } from 'src/database/schemas';
import { domain } from 'process';
import { TwilioService } from 'src/services/twilliio/twilio.service';
import { ECodeRequest, ECodeRequestStatus } from 'src/enums';

@Controller('auth')
export class AuthController extends CommonServices {
  globalResponse: Response;
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {
    super();
  }
  /**
   * this controller is used for user login
   * @param req
   * @param body
   * @param res
   */
  // @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() body: any, @Res() res: Response) {
    console.log('user is', req.user, 'body, ', body);

    const user = await this.authService.login(body.phone);
    return this.sendResponse(
      this.messages.codeHasBeenSent,
      user,
      HttpStatus.OK,
      res,
    );
  }

  /**
   *  user sign up controller
   * @param req
   * @param data
   * @param res
   */
  @Post('signup')
  async signup(
    @Req() req: Request,
    @Body() data: CreateUserDto,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const [body, errors] = await this.checkSignUpValidation(data);
      if (errors.length > 0) {
        return res.status(401).json(errors);
      }
      console.log('------', jwtConstants);

      const createUser = await this.userService.create({
        ...body,
        phoneVerified: false,
      });
      await this.userService.sendSmsCode({
        userId: createUser._id,
        phone: body.phone,
        requestType: ECodeRequest.REGISTRATION,
      });
      return this.sendResponse(
        this.messages.userCreatedSuccessfulyy,
        [],
        HttpStatus.OK,
        res,
      );
    } catch (error) {
      console.error(this.messages.Error, error);
      return this.sendResponse(
        this.messages.Error,
        [],
        HttpStatus.BAD_REQUEST,
        res,
      );
    }
  }

  /**
   *  verify sms code
   * @param body
   * @param res
   */
  @Post('verifyCode')
  async verifyHash(@Body() body: any, @Res() res: Response) {
    console.log("Asdasd")
    const { phone, code, type } = body;
    try {
      const verify = this.checkType(type);
      if (!verify)
        return this.sendResponse(
          this.messages.Error,
          [],
          HttpStatus.BAD_REQUEST,
          res,
        );

      const verifiedUpdate = await this.authService.checkSmsHash(
        phone,
        code,
        type,
      );
      this.sendResponse(
        verifiedUpdate?.message,
        verifiedUpdate?.data,
        verifiedUpdate?.status,
        res,
      );
    } catch (error) {
      console.error('eee', error);
      this.sendResponse(this.messages.Error, [], HttpStatus.BAD_REQUEST, res);
    }
  }
  /**
   * this api is used to verify email in case of fresh sign up
   * @param body
   * @param query
   * @param res
   */

  @Get('verifyEmail')
  async verifyEmail(
    @Body() body: any,
    @Query() query: any,
    @Res() res: Response,
  ) {
    const { hash } = query;
    try {
      console.log('asdasdsa');
      await this.userService.userRepository.findOneAndUpdate(
        { emailVerificationHash: hash },
        { emailVerified: true, emailVerificationHash: null },
        { useFindAndModify: true },
      );
      this.sendResponse(this.messages.Success, [], HttpStatus.OK, res);
    } catch (error) {
      this.sendResponse(this.messages.Error, [], HttpStatus.BAD_REQUEST, res);
    }
  }

  /**
   *  this api is used for resetting password
   * @param body
   * @param res
   */
  // @Post('loginCode')
  // async loginHash(@Body() body: any, @Res() res: Response) {
  //   const { phone, code } = body;

  //   try {
  //     const verifiedUpdate = await this.authService.checkSmsHash(phone, code, );
  //     this.sendResponse(
  //       verifiedUpdate.message,
  //       {
  //         access_token: this.jwtService.sign(payload, { expiresIn: 60 }),
  //         user: user,
  //       },
  //       verifiedUpdate.status,
  //       res,
  //     );
  //   } catch (error) {
  //     this.sendResponse(this.messages.Error, [], HttpStatus.BAD_REQUEST, res);
  //   }
  // }
  @Post('resendOTP')
  async resendOTP(@Body() body: resendDto, @Res() res: Response) {
    const { phone, type } = body;
    const userList = await this.userService.find({ phone: phone });
    console.log('user', userList);
    if (userList.length == 0)
      return this.sendResponse(
        this.messages.UserNotFound,
        [],
        HttpStatus.NOT_FOUND,
        res,
      );

    const user = userList[0];

    try {
      const verify = this.checkType(type);
      if (!verify)
        return this.sendResponse(
          this.messages.Error,
          [],
          HttpStatus.BAD_REQUEST,
          res,
        );
      await this.userService.sendSmsCode({
        userId: user._id,
        phone: body.phone,
        requestType: type,
      });
      return this.sendResponse(
        this.messages.codeHasBeenSent,
        [],
        HttpStatus.OK,
        res,
      );
    } catch (error) {
      console.error('error occured', error);
      return this.sendResponse(
        this.messages.Error,
        [],
        HttpStatus.BAD_REQUEST,
        res,
      );
    }
  }

  // helping function
  checkSignUpValidation = async (body) => {
    const errors = [];
    //email
    const checkUser = await this.userService.findOne({
      email: body.email,
    });
    if (checkUser && checkUser.email) {
      errors.push({ email: `${checkUser.email} already registered` });
    } else {
      const re = emailRegex;
      if (!re.test(String(body.email).toLowerCase())) {
        errors.push({ email: this.messages.invalidEmailFormat });
      }
    }
    //name
    const letters = nameRegex;
    if (!body.fullName.match(letters)) {
      errors.push({ name: this.messages.lettersError });
    }

    return [body, errors];
  };
  checkType = (type) => {
    switch (type) {
      case ECodeRequest.LOGIN:
      case ECodeRequest.REGISTRATION:
      case ECodeRequest.UPDATE_PROFILE:
        return true;

      default:
        return false;
    }
  };
}
