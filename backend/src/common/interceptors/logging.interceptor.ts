import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, requestId } = request;
    const userAgent = request.headers['user-agent'] || '-';
    const ip = request.ip || request.socket?.remoteAddress || '-';
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - now;
        const statusCode = response.statusCode;
        this.logger.log(
          JSON.stringify({
            requestId,
            method,
            url,
            statusCode,
            elapsed: `${elapsed}ms`,
            ip,
            userAgent,
          }),
        );
      }),
      catchError((error) => {
        const elapsed = Date.now() - now;
        const statusCode = error?.status || error?.statusCode || 500;
        this.logger.error(
          JSON.stringify({
            requestId,
            method,
            url,
            statusCode,
            elapsed: `${elapsed}ms`,
            ip,
            userAgent,
            error: error?.message,
          }),
        );
        return throwError(() => error);
      }),
    );
  }
}
