import { inject } from '@angular/core';
import {
  HttpInterceptorFn, HttpRequest, HttpHandlerFn,
  HttpEvent, HttpResponse, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiResponse } from '../../../models/app.models';

export class ApiError extends Error {
  constructor(public statusCode: number, public intOpCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);

  // Solo el token vive en localStorage — todo lo demás viene de la API
  const token = localStorage.getItem('erp_token');

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    map((event: HttpEvent<unknown>) => {
      if (!(event instanceof HttpResponse)) return event;

      const body = event.body as ApiResponse<unknown>;
      if (!body || typeof body.statusCode === 'undefined' || typeof body.intOpCode === 'undefined') {
        return event;
      }

      if (body.intOpCode === 0) {
        return event.clone({ body: body.data });
      }

      if (body.intOpCode === 1) {
        localStorage.removeItem('erp_token');
        router.navigate(['/auth/login']);
        throw new ApiError(body.statusCode, 1, 'Sesión expirada');
      }

      throw new ApiError(body.statusCode, body.intOpCode, `Error del servidor: opCode ${body.intOpCode}`);
    }),

    catchError((error: unknown) => {
      if (error instanceof ApiError) return throwError(() => error);

      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          localStorage.removeItem('erp_token');
          router.navigate(['/auth/login']);
          return throwError(() => new ApiError(401, 1, 'No autorizado'));
        }
        return throwError(() => new ApiError(error.status, 99, error.message));
      }

      return throwError(() => error);
    })
  );
};
