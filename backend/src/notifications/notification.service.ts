import { Injectable, Logger } from '@nestjs/common';
// import * as firebaseAdmin from 'firebase-admin';
import { env } from 'src/common/env';
import { NotificationType } from './notificationTypes';

// firebaseAdmin.initializeApp({
//   credential: firebaseAdmin.credential.cert({
//     projectId: env.firebase.project_id,
//     clientEmail: env.firebase.client_email,
//     privateKey: env.firebase.private_key,
//   }),
// });

export type FcmData = {
  _type: NotificationType;
} & { [key: string]: string };

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  async sendDataOnlyMessage(token: string, data: { [key: string]: string }) {
    // const message: firebaseAdmin.messaging.Message = {
    //   token,
    //   data,
    //   android: {
    //     priority: 'high',
    //   },
    //   apns: {
    //     headers: {
    //       'apns-priority': '10',
    //     },
    //   },
    // };

    if (!token) {
      this.logger.error('No token provided');
      return;
    }
    return '';
    // return firebaseAdmin.messaging().send(message);
  }

  async sendNotificationMessage(
    token: string,
    notification: { title: string; body: string },
    data?: { [key: string]: string },
  ) {
    // const message: firebaseAdmin.messaging.Message = {
    //   token,
    //   notification,
    //   data,
    //   android: {
    //     priority: 'high',
    //     notification: {
    //       sound: 'default',
    //     },
    //   },
    //   apns: {
    //     headers: {
    //       'apns-priority': '10',
    //     },
    //     payload: {
    //       aps: {
    //         sound: 'default',
    //       },
    //     },
    //   },
    // };

    // return firebaseAdmin.messaging().send(message);
    return '';
  }

  async constructAndSendDataOnlyMessage(
    token: string,
    notificationType: NotificationType,
    data: { [key: string]: any },
  ) {
    const fcmData = this.constructFcmData(data);
    data = { type: notificationType, ...data };
    return this.sendDataOnlyMessage(token, fcmData);
  }

  constructFcmData(data: Record<string, any>): { [key: string]: string } {
    return {
      body: JSON.stringify(data),
    };
  }
}
