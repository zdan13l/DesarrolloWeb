import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface OpcionesConfirmacion {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Pinta el botón de confirmar en rojo (eliminar, cancelar una reserva...). */
  peligro?: boolean;
}

export interface ConfirmacionPendiente {
  opciones: OpcionesConfirmacion;
  resolver: (aceptada: boolean) => void;
}

/** Abre el diálogo de confirmación del layout y emite una sola vez `true` si se acepta o `false` si no. */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly _pendiente = signal<ConfirmacionPendiente | null>(null);
  readonly pendiente = this._pendiente.asReadonly();

  confirmar(opciones: OpcionesConfirmacion): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      this._pendiente.set({
        opciones,
        resolver: (aceptada) => {
          this._pendiente.set(null);
          subscriber.next(aceptada);
          subscriber.complete();
        },
      });
      // Si nadie sigue suscrito, el diálogo no debe quedar abierto.
      return () => this._pendiente.set(null);
    });
  }
}
