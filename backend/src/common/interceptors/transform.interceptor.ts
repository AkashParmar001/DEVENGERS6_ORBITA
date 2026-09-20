import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    return next.handle().pipe(
      map((data) => {
        if (data === null || data === undefined) {
          return { data: null };
        }

        if (data instanceof Array) {
          return {
            data,
            meta: {
              page: 1,
              limit: data.length,
              total: data.length,
              totalPages: 1,
            },
          };
        }

        if (
          data &&
          typeof data === 'object' &&
          ('data' in data || 'meta' in data || 'error' in data)
        ) {
          return data;
        }

        if (method === 'DELETE') {
          return { data: null };
        }

        return { data };
      }),
    );
  }
}
