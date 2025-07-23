// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
//   Inject,
// } from '@nestjs/common';
// import { Request } from 'express';
// import { IJwtService } from 'src/auth/jwt.service';
// import { IAuthRepository } from 'src/auth/interface/auth.repository.interface';
// import { authResponse } from 'src/auth/utils/authResponse';

// @Injectable()
// export class InterimAccessTokenGuard implements CanActivate {
//   constructor(
//     @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
//     @Inject('IJwtService') private readonly jwtService: IJwtService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest<Request>();
//     try {
//       const accessToken =
//         request.headers['authorization']?.split(' ')[1] || request.body.token;

//       if (!accessToken) {
//         throw new UnauthorizedException(authResponse.NO_ACCESS_TOKEN.msg);
//       }

//       const payload = this.jwtService.verifyToken(accessToken);

//       if (!payload.deviceId || !payload.loginAttemptRecordId) {
//         throw new UnauthorizedException(authResponse.INVALID_TOKEN.msg);
//       }

//       const loginAttemptRecord = await this.authRepository.getLoginAttemptById(
//         payload.loginAttemptRecordId,
//       );

//       if (!loginAttemptRecord) {
//         throw new UnauthorizedException(
//           authResponse.LOGIN_RECORD_NOT_FOUND.msg,
//         );
//       }

//       request.body = request.body || {};
//       request.body.loginAttemptRecord = loginAttemptRecord.toObject();
//       return true;
//     } catch (error) {
//       throw new UnauthorizedException(error.message);
//     }
//   }
// }
