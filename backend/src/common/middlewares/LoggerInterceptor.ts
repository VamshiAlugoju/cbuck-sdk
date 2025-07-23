import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, tap, catchError, map } from 'rxjs';
import ApiResponse from '../ApiResponse';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;

    this.logger.log(`🚀 Incoming Request: ${method} ${url}`);

    return next.handle().pipe(
      tap((data) => {
        // this.logger.log(`✅ Response Sent: ${JSON.stringify(data)}`);
      }),
      catchError((err) => {
        throw err;
      }),
      map((data) => {
        return ApiResponse.success(data);
      }),
    );
  }
}
