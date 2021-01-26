import { Inject, Injectable } from '@nestjs/common';
import { en } from '../../locales/en';
import { I18nResolver } from 'i18n-ts';
const i18n = {
  en: en,
  default: en,
};
@Injectable()
export class CommonServices {
  public messages = new I18nResolver(i18n, 'en').translation;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
  /**
   * name
   */
  public sendResponse = (mesage, data, status, res) => {
    return res.status(status).json({
      message: mesage,
      data: data,
    });
  };

  public createNotification = async (notification: any): Promise<any> => {
    console.log('inside', notification);
    return [];
  };
  public createNotificationBo = async (
    type: any,
    pref: any,
    sender: any,
    receivers: any,
    message,
    redirectId = '',
  ) => {
    const recievers = [];
    console.log('recc', receivers);
    try {
      receivers.map((x) => {
        if (x.userNotificationPreferance[pref]) recievers.push(x.id);
      });
    } catch (error) {
      if (receivers.userNotificationPreferance[pref])
        recievers.push(receivers.id);
    }
    return this.createNotification({
      type: type,
      pref: pref,
      sender: sender,
      receivers: recievers,
      message: message,
      redirectId: redirectId,
    });
  };
}
