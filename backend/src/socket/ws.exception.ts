import {
  Catch,
  ArgumentsHost,
  WsExceptionFilter,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WebSocketExceptionFilter implements WsExceptionFilter {
  private readonly logger = new Logger(WebSocketExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error(exception);

    const client: Socket = host.switchToWs().getClient();
    const data = host.switchToWs().getData();
    const event = data?.event || 'unknown_event';

    const errResponse = this.handleException(exception);

    const errorResponse = {
      event,
      message: errResponse.message,
    };


    client.emit('ERROR', errorResponse);
  }

  /**
   * Handles various exceptions and provides structured error responses.
   */
  private handleException(exception: unknown) {
    const handlers: Record<
      string,
      () => { message: string }
    > = {
      WsException: () => this.handleWsException(exception as WsException),
      BadRequestException: () =>
        this.handleBadRequestException(exception as BadRequestException),
      UnauthorizedException: () =>
        this.handleUnauthorizedException(exception as UnauthorizedException),
      Error: () => this.handleGeneralError(exception as Error),
    };

    const exceptionType = exception?.constructor?.name || 'UnknownError';
    return handlers[exceptionType]
      ? handlers[exceptionType]()
      : { message: 'Internal WebSocket Error' };
  }

  /** Handle WebSocket-specific exceptions */
  private handleWsException(exception: WsException) {
    return {
      message: exception.message || 'WebSocket error occurred',
    };
  }

  /** Handle NestJS Bad Request Exceptions */
  private handleBadRequestException(exception: BadRequestException) {
    let message = exception.message;

    const response = exception.getResponse();
    if (
      typeof response === 'object' &&
      response !== null &&
      Array.isArray((response as any).message)
    ) {
      message = (response as any).message[0]; // Get first validation message
    }

    return {
      message,
    };
  }

  /** Handle Unauthorized Exceptions */
  private handleUnauthorizedException(exception: UnauthorizedException) {
    return {
      message: exception.message || 'Unauthorized access',
    };
  }

  /** Handle General Errors */
  private handleGeneralError(exception: Error) {
    return {
      message: exception.message || 'An unknown error occurred',
    };
  }
}
