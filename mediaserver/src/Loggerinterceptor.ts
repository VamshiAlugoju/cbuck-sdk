import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Observable, tap, catchError, map } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    this.logger.log(`🚀 Incoming Request: ${method} ${url}`);
    return next.handle().pipe(
      tap((data) => {
        return this.logger.log(`✅ Response Sent: ${JSON.stringify(data).slice(0, 100)}`);
      }),
      catchError((err) => {
        throw err;
      }),
    );
  }
}
