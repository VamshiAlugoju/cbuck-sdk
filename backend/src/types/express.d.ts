// src/types/express.d.ts
import * as express from 'express';
import { Socket } from 'socket.io';
import { TokenData } from 'src/common/Guards/AuthGuard';

declare global {
  namespace Express {
    interface Request {
      authData: TokenData;
    }
  }
}

declare module 'socket.io' {
  interface Socket {
    deviceId: string;
    userId: string;
    fcmToken: string | null;
    lastSynced: string | null;
  }
}
