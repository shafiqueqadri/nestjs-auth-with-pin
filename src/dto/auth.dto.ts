import { match } from 'assert';
import {
  ArrayMinSize,
  Equals,
  isArray,
  IsArray,
  isString,
  IsString,
  MATCHES,
  Matches,
  MinLength,
} from 'class-validator';
import { I18nResolver } from 'i18n-ts';
import { checkPassword } from 'src/constants';
import { i18n, CurrentLanguage } from 'src/constants/i18';
import { ECodeRequest } from 'src/enums';

const messages = new I18nResolver(i18n, CurrentLanguage).translation;
export class CreateUserDto {
  @IsString({ message: messages.nameRequired })
  fullName: string;

  @IsString({ message: messages.emailRequired })
  email: string;

  @IsString({ message: messages.emailRequired })
  phone: string;
}
export class resendDto {
  @IsString({ message: messages.phoneIsRequired })
  phone: string;

  @IsString({ message: messages.typeIsRequired })
  type: string;
}
export class DomainDto {
  @IsString({ message: messages.nameRequired })
  name: string;

  @IsArray({ message: messages.subDomainMustBeArray })
  subDomain: [];

  @IsArray({ message: messages.industryUsageMustBeArray })
  industryUsage: [];
}
export class smsDto {
  requestType: any;
  userId: any;
  status?: any;
  code?: any;
  phone: any;
}
export class resetPasswordDto {
  @IsString({ message: messages.emailRequired })
  email: string;

  @IsString({ message: messages.passwordIsRequired })
  @Matches(checkPassword, {
    message: messages.passwordStrengthError,
  })
  @MinLength(8, {
    message: messages.PasswordMinLength,
  })
  password: string;

  @IsString({ message: messages.ConfirmPasswordRequired })
  @MinLength(8, {
    message: messages.ConfirmPasswordMinError,
  })
  confirm_password: string;
}
