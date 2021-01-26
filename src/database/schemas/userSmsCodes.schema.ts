/* eslint-disable @typescript-eslint/ban-types */
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { USERS } from 'src/constants';
import { ECodeRequest, ECodeRequestStatus } from 'src/enums';
import { IUserDocument } from './user.schema';

export interface IUserSmsCodeDocument extends Document {
  requestType: ECodeRequest;
  user: IUserDocument;
  status: ECodeRequestStatus;
  code: string;
  phone: string;
  expireCode: Function;
  readonly createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

const UserSmsCodeSchema = new mongoose.Schema<IUserSmsCodeDocument>(
  {
    requestType: { type: String, enum: ECodeRequest },
    user: { type: mongoose.Schema.Types.ObjectId, ref: USERS },
    status: {
      type: String,
      enum: ECodeRequestStatus,
      default: ECodeRequestStatus.NOTEXPIRED,
    },
    phone: String,
    code: String,
    deletedAt: Date,
  },
  { timestamps: true },
);

UserSmsCodeSchema.methods.expireCode = function () {
  this.status = ECodeRequestStatus.EXPIRED;
  this.save();
};
UserSmsCodeSchema.methods.toJSON = function () {
  return {
    id: this._id,

    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    deletedAt: this.deletedAt,
  };
};

export { UserSmsCodeSchema };
