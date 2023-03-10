import * as util from 'util';
import {Response} from 'express';
import {UnauthorizedError} from 'express-oauth2-jwt-bearer';
import {isCelebrateError} from 'celebrate';
import {StatusCodes} from 'http-status-codes';
import {AlreadyExistsError, ForbiddenError, NotFoundError} from '../errors';

enum ErrorResponseCode {
  alreadyExists = 'alreadyExists',
  forbidden = 'forbidden',
  generalException = 'generalException',
  invalidRequest = 'invalidRequest',
  notFound = 'notFound',
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

    if (error instanceof AlreadyExistsError) {
      return res
        .status(StatusCodes.CONFLICT)
        .json(
          new ErrorResponse(ErrorResponseCode.alreadyExists, error.message)
        );
    }

    if (error instanceof ForbiddenError) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(new ErrorResponse(ErrorResponseCode.forbidden, error.message));
    }

    if (error instanceof NotFoundError) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(new ErrorResponse(ErrorResponseCode.notFound, error.message));
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
