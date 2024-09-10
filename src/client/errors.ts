export class LaplaceError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'LaplaceError';
    }
  }
  
  export const ErrYouDoNotHaveAccessToEndpoint = new LaplaceError('you do not have access to this endpoint');
  export const ErrLimitExceeded = new LaplaceError('limit exceeded');
  export const ErrEndpointIsNotActive = new LaplaceError('endpoint is not active');
  export const ErrInvalidToken = new LaplaceError('invalid token');
  export const ErrInvalidID = new LaplaceError('invalid object id');
  
  export class LaplaceHTTPError extends Error {
    httpStatus: number;
    message: string;
    internalError?: Error;
  
    constructor(httpStatus: number, message: string, internalError?: Error) {
      super(`${httpStatus}: ${message}${internalError ? ` (${internalError.message})` : ''}`);
      this.name = 'LaplaceHTTPError';
      this.httpStatus = httpStatus;
      this.message = message;
      this.internalError = internalError;
    }
  
    withInternalError(err: Error): LaplaceHTTPError {
      this.internalError = err;
      return this;
    }
  
    cause(): Error {
      return this.internalError || this;
    }
  }
  
  export function WrapError(err: Error): Error {
    if (err instanceof LaplaceHTTPError) {
      getLaplaceError(err);
      return err;
    }
    return err;
  }
  
  function getLaplaceError(httpErr: LaplaceHTTPError): void {
    switch (httpErr.httpStatus) {
      case 403:
        switch (httpErr.message) {
          case '{"message":"you don\'t have access to this endpoint"}\n':
            httpErr.withInternalError(ErrYouDoNotHaveAccessToEndpoint);
            break;
          case '{"message":"endpoint is not active"}\n':
            httpErr.withInternalError(ErrEndpointIsNotActive);
            break;
        }
        if (httpErr.message.includes('limit exceeded')) {
          httpErr.withInternalError(ErrLimitExceeded);
        }
        break;
      case 400:
        if (httpErr.message === '{"message":"invalid id"}\n') {
          httpErr.withInternalError(ErrInvalidID);
        }
        break;
      case 401:
        if (httpErr.message === '{"message":"this token is not valid"}\n') {
          httpErr.withInternalError(ErrInvalidToken);
        }
        break;
    }
  }
  
  export function HttpError(httpStatus: number, message: string, ...args: any[]): LaplaceHTTPError {
    return new LaplaceHTTPError(httpStatus, message.replace(/%s/g, () => args.shift()));
  }