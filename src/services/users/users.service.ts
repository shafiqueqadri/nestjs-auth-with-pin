import { Injectable, Inject } from '@nestjs/common';
import {
  from,
  subject,
  USER_REPOSITORY,
  USERPROFIE_REPOSITORY,
  NOTIFICATION_PREFERENCE_REPOSITORY,
  CONNECTION_REQUEST_REPOSITORY,
  USERSMSCODE_REPOSITORY,
} from '../../constants';
import { IGeneric } from '../../interfaces';
import { Model } from 'mongoose';
import { IUserDocument, IUserSmsCodeDocument } from '../../database/schemas';
import { MailerService } from '@nestjs-modules/mailer';
import { CommonServices } from '../common/common.services';
import { ECodeRequest, ECodeRequestStatus, EUserRequest } from 'src/enums';
import { TwilioService } from '../twilliio/twilio.service';
import { smsDto } from 'src/dto';
@Injectable()
export class UsersService extends CommonServices {
  constructor(
    @Inject(USER_REPOSITORY)
   public readonly userRepository: Model<IUserDocument>,
    @Inject(USERSMSCODE_REPOSITORY)
    readonly userSmsRepository: Model<IUserDocument>,

    private readonly twilioService: TwilioService,
    private readonly mailerService: MailerService,
  ) {
    super();
  }
  public sendEmail(to, text): void {
    this.mailerService
      .sendMail({
        to: to, // list of receivers
        from: from, // sender address
        subject: subject, // Subject line
        text: text, // plaintext body
        html: text, // HTML body content
      })
      .then((success) => {
        console.log(this.messages.Success, success);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  createSmsCode = async (body) => {
    await this.userSmsRepository.findOneAndUpdate(
      {
        user: body.user,
        status: ECodeRequestStatus.NOTEXPIRED,
        requestType: body.requestType,
      },
      {
        status: ECodeRequestStatus.EXPIRED,
      },
    );
    return this.userSmsRepository.create(body);
  };
  sendSmsCode = async (body: smsDto) => {
    const val = Math.floor(1000 + Math.random() * 9000);

    await this.createSmsCode({
      requestType: body.requestType,
      user: body.userId,
      phone: body.phone,
      code: val.toString(),
    });
    await this.twilioService.sendSms(
      `${this.messages.verifySmsCode}${val}`,
      body.phone,
    );
  };
  sendLoginSms = async (user) => {
    const val = Math.floor(1000 + Math.random() * 9000);
    await this.twilioService.sendSms(
      `${this.messages.verifySmsCode}${val}`,
      user.phone,
    );
    user.loginCode(val);
  };
  async findOne(clause: {
    [key: string]: any;
  }): Promise<IUserDocument | undefined> {
    return await this.userRepository.findOne(clause);
  }

  async findById(id: any): Promise<IUserDocument> {
    return await this.userRepository.findById(id);
  }
  async findByEmail(email: any): Promise<IUserDocument> {
    return await this.userRepository.findOne({ email: email });
  }
  async findFriends(id: any): Promise<IUserDocument> {
    return await this.userRepository.findById(id).populate({
      path: 'friendList',
      select: 'name',
      populate: { path: 'userNotificationPreferance' },
    });
  }
  async findUserNotificationsPrefrence(id: any): Promise<IUserDocument> {
    return await this.userRepository
      .findById(id)
      .populate('userNotificationPreferance');
  }
  async findAll(): Promise<IUserDocument[]> {
    return await this.userRepository.find();
  }

  find(filter: IGeneric, projection?: IGeneric | string): any {
    return this.userRepository.find(filter, projection);
  }

  async create(info: any): Promise<any> {
    const user = await this.userRepository.create(info);
    return user;
  }
  async update(clause: IGeneric, user: IGeneric): Promise<any> {
    user.updatedAt = new Date();
    const updated = await this.userRepository.updateOne(clause, user);
    return updated;
  }

  createConnectionRequest = async (params: any): Promise<any> => {
    // const request = await this.checkRequestDublicate(params);
    // if (!request || request.length == 0) {
    //   // await this.connectionRequestRepository.create(params);
    //   return {
    //     error: null,
    //     data: true,
    //   };
    // } else {
    //   return {
    //     error: this.messages.requestNotSuccessful,
    //     data: [],
    //   };
    // }
  };
  // acceptRejectConnectionRequest = async (
  //   connectionId: any,
  //   status: EUserRequest,
  // ): Promise<any> => {
  //   let connectionRequest: any;
  //   if (status == EUserRequest.ACCEPT) {
  //     connectionRequest = await this.connectionRequestRepository.findOneAndUpdate(
  //       { _id: connectionId },
  //       { status: EUserRequest.ACCEPT, isDeleted: true },
  //     );
  //     const [userOne, userTwo] = await Promise.all([
  //       this.userRepository
  //         .findById(connectionRequest.requestBy)
  //         .populate('profile'),
  //       this.userRepository
  //         .findById(connectionRequest.requestTo)
  //         .populate('profile'),
  //     ]);
  //     const [userProfileOne, userProfileTwo] = [userOne, userTwo];
  //     userProfileOne.addToFriendList(connectionRequest.requestTo);
  //     userProfileTwo.addToFriendList(connectionRequest.requestBy);
  //   } else {
  //     connectionRequest = await this.connectionRequestRepository.updateOne(
  //       { _id: connectionId },
  //       { status: EUserRequest.REJECT },
  //     );
  //     // return await request.updateMany=({status: EUserRequest.REJECT}, {isDeleted: true})
  //   }
  //   return connectionRequest;
  // };
  // getAllConnectionRequests = async (userId) => {
  //   const requests = await this.connectionRequestRepository
  //     .find({
  //       requestTo: userId,
  //       status: EUserRequest.NOT_RESPONDING,
  //       isDeleted: false,
  //     })
  //     .populate({ path: 'requestBy', select: 'name' });

  //   return requests;
  // };
  // getAllSentConnectionRequests = async (userId) => {
  //   const requests = await this.connectionRequestRepository
  //     .find({
  //       requestBy: userId,
  //       status: EUserRequest.NOT_RESPONDING,
  //       isDeleted: false,
  //     })
  //     .populate({ path: 'requestTo', select: 'name' });

  //   return requests;
  // };
  // unFriendUser = async (reqUser: any, userId: any): Promise<any> => {
  //   const [user, secondUser] = await Promise.all([
  //     this.userRepository.findById(reqUser),
  //     this.userRepository.findById(userId),
  //   ]);
  //   user.unFriendUser(userId);
  //   secondUser.unFriendUser(reqUser);
  // };
  // blockUser = async (profile: any, userId: any) => {
  //   const userProfile = await this.userProfileRepository.findById(profile.id);
  //   userProfile.blockUser(userId);
  // };
  // unBlockUser = async (profile: any, userId: any) => {
  //   const userProfile = await this.userProfileRepository.findById(profile.id);
  //   userProfile.unBlockUser(userId);
  // };
  // getAllBlockedUsers = async (profile) => {
  //   const blockedUsers = await this.userProfileRepository
  //     .findById(
  //       {
  //         _id: profile.id,
  //       },
  //       'blockedUsers',
  //     )
  //     .populate({ path: 'blockedUsers', select: 'name' });

  //   return blockedUsers;
  // };
}
