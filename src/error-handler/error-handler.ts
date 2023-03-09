import * as util from 'util';
import {Response} from 'express';
import {UnauthorizedError} from 'express-oauth2-jwt-bearer';
import {isCelebrateError} from 'celebrate';
import {StatusCodes} from 'http-status-codes';

enum ErrorResponseCode {
  generalException = 'generalException',
  invalidRequest = 'invalidRequest',
  unauthorized = 'unauthorized',
}

class ErrorResponse {
  readonly error;

  constructor(code: ErrorResponseCode, message: string, innerError?: unknown) {
    this.error = {
      code,
      message,
      innerError,
    };
  }
}

class ErrorHandler {
  public async handleError(error: Error, res: Response) {
    console.error(
      util.inspect(error, {showHidden: false, depth: null, colors: true})
    );

    if (isCelebrateError(error)) {
      const errors = Array.from(error.details, ([, value]) => value.message);
      const errorMessage = errors.join('\n');
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          new ErrorResponse(ErrorResponseCode.invalidRequest, errorMessage)
        );
    }

    if (error instanceof UnauthorizedError) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(
          new ErrorResponse(ErrorResponseCode.unauthorized, 'unauthorized')
        );
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        new ErrorResponse(
          ErrorResponseCode.generalException,
          'internal server error'
        )
      );
  }
}

const errorHandler = new ErrorHandler();

export {errorHandler};
