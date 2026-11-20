import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/** Envía el token en cada petición a la API y, si el servidor responde 401, cierra la sesión y lleva al login. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const esApi = req.url.startsWith(environment.apiUrl);
  const token = auth.token();
  const peticion = esApi && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(peticion).pipe(
    catchError((error: unknown) => {
      const esLogin = req.url.endsWith('/auth/login');
      if (error instanceof HttpErrorResponse && error.status === 401 && esApi && !esLogin) {
        auth.expulsar();
      }
      return throwError(() => error);
    }),
  );
};
