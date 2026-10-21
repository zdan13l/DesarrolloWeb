import { Injectable, signal } from '@angular/core';

export type TipoToast = 'exito' | 'error' | 'info';

export interface Toast {
  id: number;
  tipo: TipoToast;
  mensaje: string;
  detalles: string[];
}

/** Mensajes de éxito, error e información en la esquina de la pantalla. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private siguienteId = 1;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  exito(mensaje: string): void {
    this.mostrar('exito', mensaje, [], 4000);
  }

  info(mensaje: string): void {
    this.mostrar('info', mensaje, [], 4000);
  }

  error(mensaje: string, detalles: string[] = []): void {
    this.mostrar('error', mensaje, detalles, 8000);
  }

  cerrar(id: number): void {
    this._toasts.update((lista) => lista.filter((t) => t.id !== id));
  }

  private mostrar(tipo: TipoToast, mensaje: string, detalles: string[], duracionMs: number): void {
    const id = this.siguienteId++;
    this._toasts.update((lista) => [...lista, { id, tipo, mensaje, detalles }]);
    setTimeout(() => this.cerrar(id), duracionMs);
  }
}
