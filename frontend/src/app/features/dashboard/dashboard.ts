import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal } from '@angular/core';
import { Subject, catchError, forkJoin, map, of, startWith, switchMap, tap } from 'rxjs';
import { Columna, DataTable } from '../../shared/data-table/data-table';
import { BarrasConteo } from './barras-conteo';
import { Conteo, EstadoRecurso, EstadoRecursoFila, Resumen } from './indicador.model';
import { IndicadorService } from './indicador.service';

interface DatosTablero {
  estados: EstadoRecursoFila[];
  porRecurso: Conteo[];
  porCategoria: Conteo[];
  resumen: Resumen;
}

type Vista = { tipo: 'cargando' } | { tipo: 'error' } | { tipo: 'listo' };

interface Ficha {
  estado: EstadoRecurso;
  etiqueta: string;
  /** Icono de la marca: el estado nunca se comunica solo con color. */
  icono: string;
  tono: 'bueno' | 'info' | 'aviso' | 'critico';
}

/** Tablero (`/`): estado actual de los recursos y reservas por recurso y por categoría. */
@Component({
  selector: 'app-dashboard',
  imports: [DataTable, BarrasConteo],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly indicadores = inject(IndicadorService);
  private readonly recargar$ = new Subject<void>();

  /** Últimos datos recibidos: se siguen mostrando mientras se actualizan o si una actualización falla. */
  protected readonly datos = signal<DatosTablero | null>(null);

  /** Las cuatro consultas corren en paralelo; recargar cancela la anterior si seguía en vuelo. */
  protected readonly vista = toSignal(
    this.recargar$.pipe(
      startWith(undefined),
      switchMap(() =>
        forkJoin({
          estados: this.indicadores.estadoRecursos(),
          porRecurso: this.indicadores.reservasPorRecurso(),
          porCategoria: this.indicadores.reservasPorCategoria(),
          resumen: this.indicadores.resumen(),
        }).pipe(
          tap((datos) => this.datos.set(datos)),
          map((): Vista => ({ tipo: 'listo' })),
          catchError(() => of<Vista>({ tipo: 'error' })),
          startWith<Vista>({ tipo: 'cargando' }),
        ),
      ),
    ),
    { initialValue: { tipo: 'cargando' } as Vista },
  );

  protected readonly filtro = signal<EstadoRecurso | null>(null);

  protected readonly filasVisibles = computed(() => {
    const filtro = this.filtro();
    const estados = this.datos()?.estados ?? [];
    return filtro ? estados.filter((fila) => fila.estado === filtro) : estados;
  });

  protected readonly fichas: readonly Ficha[] = [
    { estado: 'DISPONIBLE', etiqueta: 'Disponibles', icono: '✓', tono: 'bueno' },
    { estado: 'RESERVADO', etiqueta: 'Reservados ahora', icono: '◷', tono: 'info' },
    { estado: 'PRESTADO', etiqueta: 'Prestados', icono: '⇄', tono: 'aviso' },
    { estado: 'BLOQUEADO', etiqueta: 'Bloqueados', icono: '⊘', tono: 'critico' },
  ];

  protected readonly columnas: Columna<EstadoRecursoFila>[] = [
    { clave: 'nombre', etiqueta: 'Recurso' },
    { clave: 'categoria', etiqueta: 'Categoría' },
    { clave: 'ubicacion', etiqueta: 'Ubicación' },
    { clave: 'estado', etiqueta: 'Estado', tipo: 'estado' },
  ];

  protected recargar(): void {
    this.recargar$.next();
  }

  /** Pulsar la ficha activa de nuevo quita el filtro. */
  protected alternarFiltro(estado: EstadoRecurso): void {
    this.filtro.update((actual) => (actual === estado ? null : estado));
  }

  protected etiquetaFiltro(): string {
    return this.fichas.find((f) => f.estado === this.filtro())?.etiqueta.toLowerCase() ?? '';
  }
}
