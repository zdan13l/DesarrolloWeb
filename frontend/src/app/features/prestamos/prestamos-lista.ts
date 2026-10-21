import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { Columna, DataTable } from '../../shared/data-table/data-table';
import { Prestamo } from './prestamo.model';
import { PrestamoService } from './prestamo.service';

type Pestana = 'activos' | 'vencidos' | 'historial';

const COLUMNAS_BASE: Columna<Prestamo>[] = [
  { clave: 'recursoNombre', etiqueta: 'Recurso' },
  { clave: 'usuarioNombre', etiqueta: 'Prestado a' },
  { clave: 'fechaHoraEntrega', etiqueta: 'Entrega', tipo: 'fecha' },
  { clave: 'fechaHoraLimite', etiqueta: 'Límite', tipo: 'fecha' },
];

/** CU5 y CU6. Préstamos activos, vencidos e historial, con acceso a entregar y devolver. */
@Component({
  selector: 'app-prestamos-lista',
  imports: [RouterLink, DataTable],
  template: `
    <header class="page-header">
      <h1>Préstamos</h1>
      <a class="btn btn--primario" routerLink="/prestamos/entrega">Registrar entrega</a>
    </header>

    <div class="pestanas" role="tablist" aria-label="Vista de préstamos">
      @for (p of pestanas; track p.clave) {
        <button
          type="button"
          role="tab"
          class="btn"
          [class.btn--primario]="pestana() === p.clave"
          [attr.aria-selected]="pestana() === p.clave"
          (click)="pestana.set(p.clave)"
        >
          {{ p.etiqueta }} ({{ conteo()[p.clave] }})
        </button>
      }
    </div>

    <section class="card">
      <app-data-table
        [columnas]="columnas()"
        [filas]="filas()"
        [cargando]="cargando()"
        [acciones]="acciones"
        [mensajeVacio]="mensajeVacio()"
      />
      <ng-template #acciones let-prestamo>
        @if (prestamo.estadoPrestamo === 'ACTIVO') {
          <a class="btn btn--pequeno" [routerLink]="['/prestamos', prestamo.id, 'devolucion']">Registrar devolución</a>
        }
      </ng-template>
    </section>
  `,
  styles: `
    .pestanas {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }
  `,
})
export class PrestamosLista {
  private readonly servicio = inject(PrestamoService);

  protected readonly pestanas: { clave: Pestana; etiqueta: string }[] = [
    { clave: 'activos', etiqueta: 'Activos' },
    { clave: 'vencidos', etiqueta: 'Vencidos' },
    { clave: 'historial', etiqueta: 'Historial' },
  ];

  protected readonly pestana = signal<Pestana>('activos');
  protected readonly cargando = signal(true);

  private readonly datos = toSignal(
    forkJoin({ todos: this.servicio.listar(), vencidos: this.servicio.vencidos() }).pipe(
      // El interceptor ya avisó del error; las tres pestañas quedan vacías.
      catchError(() => of({ todos: [] as Prestamo[], vencidos: [] as Prestamo[] })),
      finalize(() => this.cargando.set(false)),
    ),
    { initialValue: { todos: [] as Prestamo[], vencidos: [] as Prestamo[] } },
  );

  private readonly activos = computed(() => this.datos().todos.filter((p) => p.estadoPrestamo === 'ACTIVO'));
  private readonly historial = computed(() => this.datos().todos.filter((p) => p.estadoPrestamo === 'DEVUELTO'));

  protected readonly conteo = computed<Record<Pestana, number>>(() => ({
    activos: this.activos().length,
    vencidos: this.datos().vencidos.length,
    historial: this.historial().length,
  }));

  protected readonly filas = computed(() => {
    switch (this.pestana()) {
      case 'activos':
        return this.activos();
      case 'vencidos':
        return this.datos().vencidos;
      case 'historial':
        return this.historial();
    }
  });

  protected readonly columnas = computed<Columna<Prestamo>[]>(() =>
    this.pestana() === 'historial'
      ? [
          ...COLUMNAS_BASE,
          { clave: 'fechaHoraDevolucion', etiqueta: 'Devuelto', tipo: 'fecha' },
          { clave: 'devolucionTardia', etiqueta: 'Tardía', tipo: 'booleano' },
          { clave: 'estadoFinal', etiqueta: 'Estado final', tipo: 'estado' },
        ]
      : [...COLUMNAS_BASE, { clave: 'estadoPrestamo', etiqueta: 'Estado', tipo: 'estado' }],
  );

  protected readonly mensajeVacio = computed(() => {
    switch (this.pestana()) {
      case 'activos':
        return 'No hay préstamos activos.';
      case 'vencidos':
        return 'No hay préstamos vencidos.';
      case 'historial':
        return 'Aún no hay devoluciones registradas.';
    }
  });
}
