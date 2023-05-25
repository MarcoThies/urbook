import {
  ExceptionFilter,
  HttpException,
  HttpStatus,
  ArgumentsHost,
  Catch,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    const errorResponse = {
      code: status,
      timestamp: new Date().toLocaleDateString(),
      path: request.url,
      method: request.method,
      message: message
    };

    Logger.error(
      `${request.method} ${request.url}`,
      exception.stack,
      'HttpExceptionFilter',
    );

    response.status(status).json(errorResponse);
  }
}
