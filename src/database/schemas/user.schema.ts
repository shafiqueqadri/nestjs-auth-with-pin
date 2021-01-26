/* eslint-disable @typescript-eslint/ban-types */
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { USERS } from 'src/constants';
import { ERole } from 'src/enums';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  isBlocked: boolean;
  img: string;
  role: ERole;
  phone: string;
  phoneCode: string;
  phoneCodeCreatedAt: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  emailVerificationHash: string;
  friendList?: [];
  loggedInCode: string;
  isLoggedIn: boolean;
  isActive: boolean;
  addPhoneHash: Function;
  loginCode: Function;
  verifyPhone: Function;
  readonly createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

const UserSchema = new mongoose.Schema<IUserDocument>(
  {
    name: { type: String, index: true },
    email: { type: String, index: true },
    isBlocked: { type: Boolean, default: false },
    phoneCodeCreatedAt: String,
    img: String,
    phoneCode: { type: String, default: null },
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: true },
    loggedInCode: String,
    isLoggedIn: { type: Boolean, default: false },
    friendList: [{ type: mongoose.Schema.Types.ObjectId, ref: USERS }],
    phone: { type: String, default: null },
    emailVerificationHash: { type: String, default: null },
    isActive: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true },
);

UserSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,

    role: this.role,
    img: this.img,
    phone: this.phone,
    phoneVerified: this.phoneVerified,
    emailVerified: this.emailVerified,

    friendList: this.friendList,

    isActive: this.isActive,

    emailVerificationHash: this.emailVerificationHash,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    deletedAt: this.deletedAt,
  };
};

UserSchema.methods.addPhoneHash = function (code) {
  this.phoneCode = code;
  const date = new Date();
  this.phoneCodeCreatedAt = date.getTime().toString();
  this.save();
};
UserSchema.methods.loginCode = function (code) {
  this.loggedInCode = code;
  const date = new Date();
  this.phoneCodeCreatedAt = date.getTime().toString();
  this.save();
};
UserSchema.methods.verifyPhone = function () {
  this.phoneVerified = true;
  this.save();
};

export { UserSchema };

export interface IForgetPasswordDocument extends Document {
  email: string;
  hash: string;
  // readonly createdAt: Date;
}

export const ForgetPasswordSchema = new mongoose.Schema(
  {
    email: String,
    hash: String,
  },
  { timestamps: true },
);
