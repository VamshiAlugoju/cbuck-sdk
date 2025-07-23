import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
// import { MongooseError } from 'mongoose';
import ApiResponse from '../ApiResponse';
import { AxiosError, isAxiosError } from 'axios';
import { ValidationError } from 'class-validator';

@Catch()
class HttpExceptionHanlder implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionHanlder.name);

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error(exception);

    // Get the request context
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    // Log request details
    this.logger.error('Exception thrown during request handling:', {
      method: request.method,
      url: request.url,
      ip: request.ip || request.headers['x-forwarded-for'],
      headers: request.headers,
      body: request.body,
      params: request.params,
      query: request.query,
    });

    // Pass the exception to the registered exception handler
    const errResponse = this.handleException(exception);

    // Generalize the error response
    const errorResponse = ApiResponse.error(
      errResponse.status_code,
      errResponse.message,
      errResponse.response_code || -1,
      null,
      {
        path: request.url,
      },
    );

    return response.status(errResponse.status_code).json(errorResponse);
  }

  /**
   * This is the main function to handle exceptions
   * Has all registered exception handlers
   *
   * !If you need to add a new exception handler, register it here
   */
  private handleException(exception: unknown) {
    const handlers: Record<
      string,
      () => { status_code: number; message: string; response_code?: number }
    > = {
      BadRequestException: () =>
        this.handleBadRequestException(exception as BadRequestException),
      HttpException: () => this.handleHttpException(exception as HttpException),

      Error: () => this.handleGeneralError(exception as Error),
      UnauthorizedException: () =>
        this.handleGeneralError(exception as UnauthorizedException),
      AxiosError: () => this.handleAxiosError(exception as AxiosError),
    };

    const exceptionType = exception?.constructor?.name || 'UnknownError';
    return handlers[exceptionType]
      ? handlers[exceptionType]()
      : handlers['Error']();
  }

  /** Handle NestJS HTTP Exceptions */
  private handleHttpException(exception: HttpException) {
    const response: any = exception.getResponse();
    return {
      status_code: exception.getStatus(),
      message: response.message || 'An error occurred',
    };
  }

  /** Handle General JS Errors */
  private handleGeneralError(exception: Error) {
    const isNestJsException = exception instanceof HttpException;
    return {
      status_code: isNestJsException ? exception.getStatus() : 500,
      message: exception.message || 'Internal Server Error',
    };
  }

  private handleBadRequestException(exception: BadRequestException) {
    let message = exception.message;

    // Check if the exception.response is an array of messages
    if (
      typeof exception.getResponse() === 'object' &&
      Array.isArray(exception.getResponse()['message'])
    ) {
      message = exception.getResponse()['message'][0]; // Get the first message
    } else if (
      typeof exception.getResponse() === 'object' &&
      typeof exception.getResponse()['message'] === 'string'
    ) {
      message = exception.getResponse()['message'];
    }

    return {
      status_code: exception.getStatus(),
      response_code: exception.getStatus(),
      message: message,
    };
  }

  private handleAxiosError(exception: AxiosError) {
    let errMsg = exception.message;
    let statusCode = 500; // Default status code

    if (exception.response) {
      statusCode = exception.response.status;

      const data = exception.response.data as Record<string, any> | string;

      if (typeof data === 'string') {
        errMsg = data;
      } else if (typeof data === 'object' && data !== null) {
        if (typeof data.error === 'string') {
          errMsg = data.error;
        } else if (typeof data.message === 'string') {
          errMsg = data.message;
        } else if (Array.isArray(data.message) && data.message.length > 0) {
          errMsg = data.message[0]; // Take the first message in the array
        } else {
          errMsg = JSON.stringify(data); // Convert unknown objects to string
        }
      }
    }

    return {
      status_code: statusCode,
      response_code: statusCode,
      message: errMsg || 'Unknown error occurred',
    };
  }
}

export default HttpExceptionHanlder;
