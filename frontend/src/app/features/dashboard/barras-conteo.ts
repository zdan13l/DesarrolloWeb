import { Component, computed, input, signal } from '@angular/core';
import { Columna, DataTable } from '../../shared/data-table/data-table';
import { Conteo } from './indicador.model';

/**
 * Gráfico de barras horizontales de una sola serie (reservas por recurso o por categoría).
 * Una serie no necesita leyenda: el título dice qué se mide. El valor va en la punta de cada barra
 * y la misma información está disponible como tabla.
 */
@Component({
  selector: 'app-barras-conteo',
  imports: [DataTable],
  templateUrl: './barras-conteo.html',
  styleUrl: './barras-conteo.css',
})
export class BarrasConteo {
  readonly titulo = input.required<string>();
  readonly etiquetaEje = input('Reservas');
  readonly datos = input.required<readonly Conteo[]>();

  protected readonly verTabla = signal(false);

  protected readonly maximo = computed(() => Math.max(0, ...this.datos().map((d) => d.totalReservas)));

  protected readonly columnas: Columna<Conteo>[] = [
    { clave: 'nombre', etiqueta: 'Nombre' },
    { clave: 'totalReservas', etiqueta: 'Reservas' },
  ];

  protected ancho(dato: Conteo): number {
    const max = this.maximo();
    return max === 0 ? 0 : (dato.totalReservas / max) * 100;
  }

  protected descripcion(dato: Conteo): string {
    return `${dato.nombre}: ${dato.totalReservas} ${dato.totalReservas === 1 ? 'reserva' : 'reservas'}`;
  }

  protected alternarVista(): void {
    this.verTabla.update((v) => !v);
  }
}
