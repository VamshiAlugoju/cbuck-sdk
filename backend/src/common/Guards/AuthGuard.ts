import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

export type TokenData = {
  userId: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor() {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const userId = req.query.userId;

    try {
      if (!userId || typeof userId !== 'string') {
        throw new UnauthorizedException('Invalid token payload');
      }
      req.authData = {
        userId: userId,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
