import {
  Body,
  Controller,
  Get,
  UseGuards,
  Put,
  Req,
  Res,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { Request, Response } from 'express';
import { UsersService } from '../../services/users/users.service';
import { JwtAuthGuard } from 'src/gaurds/jwt-auth.guard';
import { CommonServices } from 'src/services';
import { ECodeRequest } from 'src/enums';
// import { STATUS_CODE_200, STATUS_CODE_400 } from 'src/constants';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController extends CommonServices {
  constructor(private readonly userService: UsersService) {
    super();
  }
  /**
   * get user profile on base of emial
   * @param req
   */
  @Get('getProfile/:email')
  async list(
    @Req()
    req: Request,
    @Res() res: Response,
  ) {
    try {
      const email = req.params.email;
      const user = await this.userService.findByEmail(email);
      if (!user)
        return this.sendResponse(
          this.messages.UserNotFound,
          [],
          HttpStatus.NOT_FOUND,
          res,
        );
      if (Object.keys(user).length > 0) {
        return this.sendResponse(
          this.messages.Success,
          user,
          HttpStatus.OK,
          res,
        );
      } else {
        return this.sendResponse(
          this.messages.UserNotFound,
          user,
          HttpStatus.BAD_REQUEST,
          res,
        );
      }
    } catch (error) {
      console.error('error occured while fetching user profile', error);
      return this.sendResponse(
        this.messages.Error,
        [],
        HttpStatus.BAD_REQUEST,
        res,
      );
    }
  }

  @Put('update/:userId')
  async updateUser(@Body() body: any, @Req() req: any, @Res() res: Response) {
    const { email, name, img } = body;
    try {
      console.log('user is', req.params.userId);
      if (body.phone) {
        // send codes accordngly
        await this.userService.sendSmsCode({
          userId: req.params.userId,
          phone: body.phone,
          requestType: ECodeRequest.UPDATE_PROFILE,
        });
      }
      await this.userService.userRepository.findOneAndUpdate(
        {
          _id: req.params.userId,
        },
        { email: email, name: name, img: img },
      );

      this.sendResponse(this.messages.Success, [], HttpStatus.OK, res);
    } catch (error) {
      this.sendResponse(this.messages.Error, [], HttpStatus.BAD_REQUEST, res);
    }
  }
  /**
   * Send connection request      // send notification
   * @param req
   * @param res
   */
  @Post('connectionRequest/:requestTo')
  async connectionRequest(@Req() req, @Res() res) {
    try {
      const { requestTo } = req.params;
      const params = {
        requestBy: req.user.id,
        requestTo: requestTo,
      };
      const { error, result } = await this.userService.createConnectionRequest(
        params,
      );
      const user = await this.userService.findUserNotificationsPrefrence(
        params.requestTo,
      ); //notify user about post creation.
      // if (!error) {
      //   //send notification to other guy..
      //   this.createNotificationBo(
      //     ENotifcationType.FRINED_REQUEST,
      //     networkActivities,
      //     params.requestBy,
      //     user,
      //     this.messages.notification(
      //       user.name,
      //       this.messages.sentFriendRequest,
      //     ),
      //   );
      //   this.sendResponse(
      //     this.messages.requestSentSuccessfully,
      //     result,
      //     HttpStatus.OK,
      //     res,
      //   );
      // } else {
      //   this.sendResponse(error, [], HttpStatus.UNPROCESSABLE_ENTITY, res);
      // }
    } catch (error) {
      return this.sendResponse(
        this.messages.Error,
        [],
        HttpStatus.BAD_REQUEST,
        res,
      );
    }
  }

  /**
   * Accept Connection Request
   */
  @Post('acceptConnectionRequest')
  async acceptconnectionrequest(@Req() req, @Body() body, @Res() res) {
    try {
      const errors = this.paramsValidation(body, req.user.id);
      if (errors.length > 0) {
        return this.sendResponse(errors, [], HttpStatus.BAD_REQUEST, res);
      }
      const { connectionId, status } = body;
      // const result = await this.userService.acceptRejectConnectionRequest(
      //   connectionId,
      //   status,
      // );
      // const user = await this.userService.findUserNotificationsPrefrence(
      //   result.requestBy,
      // );
      // this.createNotificationBo(
      //   ENotifcationType.FRINED_REQUEST,
      //   connectionInvitationAccepted,
      //   req.user.id,
      //   user,
      //   this.messages.notification(
      //     user.name,
      //     this.messages.friendRequestAccepted,
      //   ),
      // );
      // this.sendResponse(
      //   this.messages.requestSentSuccessfully,
      //   result,
      //   HttpStatus.OK,
      //   res,
      // );
    } catch (error) {
      console.error(error);
      return this.sendResponse(
        this.messages.Error,
        [],
        HttpStatus.BAD_REQUEST,
        res,
      );
    }
  }

  /**
   * Get all connection requests user recieved
   * @param req
   * @param res
   */
  @Get('getAllConnectionRequests')
  async getAllConnectionRequests(@Req() req, @Res() res) {
    try {
      const userId = req.user.id;
      const result = [
        'await this.userService.getAllConnectionRequests(userId);',
      ];
      this.sendResponse(
        this.messages.requestSentSuccessfully,
        result,
        HttpStatus.OK,
        res,
      );
    } catch (error) {
      console.error(error);
      return this.sendResponse(
        this.messages.Error,
        [],
        HttpStatus.BAD_REQUEST,
        res,
      );
    }
  }

  /**
   * Get all connection request user sent
   * @param body
   * @param requestTo
   */
  @Get('getAllSentConnectionRequests')
  async getAllSentConnectionRequests(@Req() req, @Res() res) {
    try {
      const userId = req.user.id;
      const result = [];
      this.sendResponse(
        this.messages.requestSentSuccessfully,
        result,
        HttpStatus.OK,
        res,
      );
    } catch (error) {
      console.error(error);
      return this.sendResponse(
        this.messages.Error,
        [],
        HttpStatus.BAD_REQUEST,
        res,
      );
    }
  }

  // /**
  //  * Un-friend User from the list
  //  * @param body
  //  * @param requestTo
  //  */
  // @Put('unFriendUser/:userId')
  // async unFriendUser(@Req() req, @Res() res) {
  //   try {
  //     const reqUser = req.user.id;
  //     const { userId } = req.params;
  //     if (isValidObjectId(userId)) {
  //       const result = await this.userService.unFriendUser(reqUser, userId);
  //       this.sendResponse(
  //         this.messages.userUnFriend,
  //         result,
  //         HttpStatus.OK,
  //         res,
  //       );
  //     } else {
  //       return this.sendResponse(
  //         this.messages.idsNotRight,
  //         [],
  //         HttpStatus.BAD_REQUEST,
  //         res,
  //       );
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     return this.sendResponse(
  //       this.messages.Error,
  //       [],
  //       HttpStatus.BAD_REQUEST,
  //       res,
  //     );
  //   }
  // }

  paramsValidation(body, requestTo) {
    const errors = [];

    if (
      isValidObjectId(body.connectionId) &&
      isValidObjectId(body.requestedBy) &&
      isValidObjectId(requestTo)
    ) {
    } else {
      errors.push({ message: this.messages.idsNotRight });
    }

    return errors;
  }
}
