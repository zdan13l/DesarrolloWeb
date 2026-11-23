import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastService } from '../../shared/toast/toast.service';

/** Tiempo durante el cual un mismo mensaje no se vuelve a mostrar, para no llenar la pantalla de avisos. */
const VENTANA_REPETICION_MS = 3000;

const MENSAJE_INESPERADO = 'Ocurrió un error inesperado. Si el problema continúa, recarga la página.';

/**
 * Manejador global de errores del navegador: recibe lo que ningún componente capturó
 * (excepciones, promesas rechazadas) y avisa al usuario con un toast.
 * Los errores HTTP ya los muestra el `errorInterceptor`, así que aquí se ignoran.
 */
@Injectable()
export class ManejadorErroresGlobal implements ErrorHandler {
  private readonly toast = inject(ToastService);
  private ultimoMensaje = '';
  private ultimaVez = 0;

  handleError(error: unknown): void {
    console.error(error);
    if (error instanceof HttpErrorResponse) return;

    const ahora = Date.now();
    if (MENSAJE_INESPERADO === this.ultimoMensaje && ahora - this.ultimaVez < VENTANA_REPETICION_MS) return;
    this.ultimoMensaje = MENSAJE_INESPERADO;
    this.ultimaVez = ahora;
    this.toast.error(MENSAJE_INESPERADO);
  }
}
