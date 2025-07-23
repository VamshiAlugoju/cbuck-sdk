const DEFAULTS = {
  STATUS_CODE: 200,
  SUCCESS_MESSAGE: 'OK',
  ERROR_MESSAGE: 'Unknown Error',
  RESPONSE_CODE: 0,
};

class ApiResponse {
  status: boolean;
  status_code: number;
  message: string;
  response_code: number;
  data: any;
  timestamp: string;

  constructor(
    status: boolean,
    status_code: number,
    message: string,
    data: any,
    response_code: number,
    extraFields?: Record<string, any>,
  ) {
    this.status = status;
    this.status_code = status_code;
    this.message = message;
    this.data = data;
    this.response_code = response_code;
    this.timestamp = new Date().toISOString();

    // Dynamically add extra fields to the response object
    if (extraFields) {
      Object.assign(this, extraFields);
    }
  }

  static success(data: any, extraFields?: Record<string, any>) {
    return new ApiResponse(
      true,
      200,
      DEFAULTS.SUCCESS_MESSAGE,
      data,
      0,
      extraFields,
    );
  }

  static error(
    status_code: number,
    message: string = DEFAULTS.ERROR_MESSAGE,
    response_code: number,
    data: any = null,
    extraFields?: Record<string, any>,
  ) {
    return new ApiResponse(
      false,
      status_code,
      message,
      data,
      response_code,
      extraFields,
    );
  }

  static notFoundError(message?: string) {
    return new ApiResponse(
      false,
      404,
      message || 'Resource not found',
      null,
      -1,
    );
  }

  static invalidInitatorError(message?: string) {
    return new ApiResponse(
      false,
      500,
      message || 'Invalid initiator',
      null,
      -1,
    );
  }
  static unauthorizedError(message?: string) {
    return new ApiResponse(
      false,
      401,
      message || 'Unauthorized',
      null,
      -1,
    );
  }
  static unknownError(message?: string) {
    return new ApiResponse(
      false,
      500,
      message || 'Unknown error',
      null,
      -1,
    );
  }
}

export default ApiResponse;
