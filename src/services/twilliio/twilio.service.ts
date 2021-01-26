/* eslint-disable @typescript-eslint/no-var-requires */
import { Inject, Injectable } from '@nestjs/common';
import { env } from 'process';
import { messageFrom } from 'src/constants';
import { CommonServices } from '../common/common.services';
const TWILIO_ACCOUNT_SID = 'AC878193c1aef186808f3d65e89ce482af';
const TWILIO_AUTH_TOKEN = '4da1bd9a90be21143b82bc01a3886880';
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
@Injectable()
export class TwilioService extends CommonServices {
  constructor() {
    super();
  }

  sendSms = async (text, to) => {
    console.log('tetx', text, 'to', to);
    return;
    const message = new Promise((resolve, reject) => {
      client.messages
        .create({
          body: text,
          from: messageFrom,
          to: to,
        })
        .then((message) => {
          console.log(message.sid);
          resolve(message);
        })
        .catch((e) => {
          console.error('eerrr', e);
          reject(e);
        });
    });
    return message;
  };
}
