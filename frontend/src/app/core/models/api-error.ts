import { HttpErrorResponse } from '@angular/common/http';

/** Un campo que falló la validación del DTO (solo llega en respuestas 400). */
export interface ErrorCampo {
  campo: string;
  mensaje: string;
}

/** Formato único de error del backend (GlobalExceptionHandler). */
export interface ErrorApi {
  timestamp?: string;
  status: number;
  error?: string;
  message: string;
  path?: string;
  errors: ErrorCampo[];
}

const MENSAJE_SIN_CONEXION =
  'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.';

/** Convierte cualquier error de HttpClient al formato de error del backend. */
export function leerErrorApi(err: unknown): ErrorApi {
  if (!(err instanceof HttpErrorResponse)) {
    return { status: 0, message: 'Ocurrió un error inesperado.', errors: [] };
  }
  if (err.status === 0) {
    return { status: 0, message: MENSAJE_SIN_CONEXION, errors: [] };
  }
  const cuerpo = err.error as Partial<ErrorApi> | null;
  const esFormatoApi = typeof cuerpo === 'object' && cuerpo !== null && typeof cuerpo.message === 'string';
  return {
    ...(esFormatoApi ? cuerpo : {}),
    status: err.status,
    message: esFormatoApi && cuerpo.message ? cuerpo.message : `Error ${err.status}: ${err.statusText}`,
    errors: esFormatoApi && Array.isArray(cuerpo.errors) ? cuerpo.errors : [],
  };
}

/** Atajo para mostrar el mensaje de un error en pantalla. */
export function mensajeDeError(err: unknown): string {
  return leerErrorApi(err).message;
}
