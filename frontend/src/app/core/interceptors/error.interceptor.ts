import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { leerErrorApi } from '../models/api-error';
import { ToastService } from '../../shared/toast/toast.service';

/** Si una petición pone este token en true, el error no se muestra como toast y lo muestra el componente. */
export const OMITIR_TOAST_ERROR = new HttpContextToken<boolean>(() => false);

/** Muestra como toast el mensaje de error del backend y relanza el error para que el componente reaccione. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (!req.context.get(OMITIR_TOAST_ERROR)) {
        const error = leerErrorApi(err);
        toast.error(
          error.message,
          error.errors.map((e) => `${e.campo}: ${e.mensaje}`),
        );
      }
      return throwError(() => err);
    }),
  );
};
