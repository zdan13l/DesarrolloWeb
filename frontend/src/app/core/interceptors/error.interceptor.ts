import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { leerErrorApi } from '../models/api-error';
import { ToastService } from '../../shared/toast/toast.service';

/**
 * Por defecto toda respuesta de error se muestra como toast. Una petición que quiera mostrar
 * el error en su propia pantalla (p. ej. el 409 de conflicto en el formulario de reservas)
 * lo desactiva así:
 *
 *   this.http.post(url, body, { context: new HttpContext().set(OMITIR_TOAST_ERROR, true) })
 */
export const OMITIR_TOAST_ERROR = new HttpContextToken<boolean>(() => false);

/**
 * Captura los errores HTTP, lee el formato único del backend ({ message, errors[] }) y los muestra
 * como mensaje claro. El error original se relanza para que el componente pueda reaccionar.
 *
 * Tercera entrega: este también es el lugar para agregar el encabezado Authorization.
 */
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
