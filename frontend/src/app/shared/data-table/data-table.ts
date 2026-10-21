import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, input } from '@angular/core';
import { StatusBadge } from '../status-badge/status-badge';

export interface Columna<T> {
  /** Nombre de la propiedad del DTO que se muestra. */
  clave: string;
  etiqueta: string;
  /** texto (por defecto), fecha (ISO-8601), estado (badge de color) o booleano (Sí/No). */
  tipo?: 'texto' | 'fecha' | 'estado' | 'booleano';
  /** Para valores calculados que no son una propiedad directa. */
  valor?: (fila: T) => unknown;
}

/**
 * Tabla genérica. Las acciones por fila (editar, cancelar...) se pasan como plantilla:
 *
 *   <app-data-table [columnas]="columnas" [filas]="reservas()" [acciones]="acc" />
 *   <ng-template #acc let-reserva><button ...>Cancelar</button></ng-template>
 */
@Component({
  selector: 'app-data-table',
  imports: [DatePipe, NgTemplateOutlet, StatusBadge],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTable<T extends object> {
  readonly columnas = input.required<readonly Columna<T>[]>();
  readonly filas = input.required<readonly T[]>();
  readonly cargando = input(false);
  readonly mensajeVacio = input('No hay registros para mostrar.');
  readonly acciones = input<TemplateRef<{ $implicit: T }>>();

  protected valorDe(fila: T, columna: Columna<T>): unknown {
    return columna.valor ? columna.valor(fila) : (fila as Record<string, unknown>)[columna.clave];
  }

  protected comoTexto(valor: unknown): string {
    return valor === null || valor === undefined || valor === '' ? '—' : String(valor);
  }

  protected comoFecha(valor: unknown): string | null {
    return typeof valor === 'string' && valor ? valor : null;
  }

  protected comoBooleano(valor: unknown): string {
    return valor === null || valor === undefined ? '—' : valor ? 'Sí' : 'No';
  }

  protected comoEstado(valor: unknown): string | null {
    return typeof valor === 'string' ? valor : null;
  }
}
