import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { Columna, DataTable } from '../../shared/data-table/data-table';
import { EstadoMantenimiento, Mantenimiento, estaAbierto } from './mantenimiento.model';
import { MantenimientoService } from './mantenimiento.service';

type Filtro = 'ACTIVOS' | 'TODOS' | EstadoMantenimiento;

@Component({
  selector: 'app-mantenimientos-lista',
  imports: [FormsModule, RouterLink, DataTable],
  templateUrl: './mantenimientos-lista.html',
  styles: `
    .filtros {
      margin-bottom: 16px;
      max-width: 420px;
    }
  `,
})
export class MantenimientosLista {
  private readonly servicio = inject(MantenimientoService);

  protected readonly cargando = signal(true);
  protected readonly filtro = signal<Filtro>('ACTIVOS');

  private readonly todos = toSignal(
    this.servicio.listar().pipe(
      catchError(() => of([] as Mantenimiento[])),
      finalize(() => this.cargando.set(false)),
    ),
    { initialValue: [] as Mantenimiento[] },
  );

  protected readonly filas = computed(() => {
    const filtro = this.filtro();
    const lista = [...this.todos()].sort((a, b) => b.fechaApertura.localeCompare(a.fechaApertura));
    if (filtro === 'TODOS') return lista;
    if (filtro === 'ACTIVOS') return lista.filter((m) => estaAbierto(m.estadoMantenimiento));
    return lista.filter((m) => m.estadoMantenimiento === filtro);
  });

  protected readonly opcionesFiltro: readonly { valor: Filtro; etiqueta: string }[] = [
    { valor: 'ACTIVOS', etiqueta: 'En curso (abiertos y en proceso)' },
    { valor: 'TODOS', etiqueta: 'Todos' },
    { valor: 'ABIERTA', etiqueta: 'Abiertos' },
    { valor: 'EN_PROCESO', etiqueta: 'En proceso' },
    { valor: 'FINALIZADA', etiqueta: 'Finalizados' },
    { valor: 'CANCELADA', etiqueta: 'Cancelados' },
  ];

  protected readonly columnas: Columna<Mantenimiento>[] = [
    { clave: 'recursoNombre', etiqueta: 'Recurso' },
    { clave: 'estadoMantenimiento', etiqueta: 'Estado', tipo: 'estado' },
    { clave: 'fechaApertura', etiqueta: 'Apertura', tipo: 'fecha' },
    { clave: 'fechaCierre', etiqueta: 'Cierre', tipo: 'fecha' },
    { clave: 'diagnostico', etiqueta: 'Diagnóstico' },
  ];
}
