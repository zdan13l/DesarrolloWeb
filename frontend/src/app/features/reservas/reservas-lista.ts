import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, filter, finalize, of, switchMap, tap } from 'rxjs';
import { ConfirmService } from '../../shared/confirm-dialog/confirm.service';
import { Columna, DataTable } from '../../shared/data-table/data-table';
import { ToastService } from '../../shared/toast/toast.service';
import { Reserva } from './reserva.model';
import { ReservaService } from './reserva.service';

/** CU2–CU4. Lista de reservas con la opción de cancelar las confirmadas. */
@Component({
  selector: 'app-reservas-lista',
  imports: [RouterLink, DataTable],
  template: `
    <header class="page-header">
      <h1>Reservas</h1>
      <a class="btn btn--primario" routerLink="/reservas/nueva">Nueva reserva</a>
    </header>

    <section class="card">
      <app-data-table
        [columnas]="columnas"
        [filas]="reservas()"
        [cargando]="cargando()"
        [acciones]="acciones"
        mensajeVacio="Aún no hay reservas registradas."
      />
      <ng-template #acciones let-reserva>
        @if (reserva.estadoReserva === 'CONFIRMADA') {
          <a class="btn btn--pequeno" [routerLink]="['/reservas', reserva.id, 'editar']">Editar</a>
          <button
            type="button"
            class="btn btn--pequeno btn--peligro"
            [disabled]="cancelando() === reserva.id"
            (click)="cancelar(reserva)"
          >
            Cancelar
          </button>
        }
      </ng-template>
    </section>
  `,
})
export class ReservasLista {
  private readonly servicio = inject(ReservaService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  private readonly recarga = new BehaviorSubject<void>(undefined);

  protected readonly cargando = signal(true);
  protected readonly cancelando = signal<number | null>(null);

  protected readonly reservas = toSignal(
    this.recarga.pipe(
      tap(() => this.cargando.set(true)),
      switchMap(() =>
        this.servicio.listar().pipe(
          catchError(() => of<Reserva[]>([])),
          finalize(() => this.cargando.set(false)),
        ),
      ),
    ),
    { initialValue: [] as Reserva[] },
  );

  protected readonly columnas: Columna<Reserva>[] = [
    { clave: 'recursoNombre', etiqueta: 'Recurso' },
    { clave: 'usuarioNombre', etiqueta: 'Reservado por' },
    { clave: 'fechaHoraInicio', etiqueta: 'Inicio', tipo: 'fecha' },
    { clave: 'fechaHoraFin', etiqueta: 'Fin', tipo: 'fecha' },
    { clave: 'estadoReserva', etiqueta: 'Estado', tipo: 'estado' },
  ];

  protected cancelar(reserva: Reserva): void {
    this.confirm
      .confirmar({
        titulo: 'Cancelar reserva',
        mensaje: `¿Cancelar la reserva de "${reserva.recursoNombre}"? Esta acción no se puede deshacer.`,
        textoConfirmar: 'Cancelar reserva',
        textoCancelar: 'Volver',
        peligro: true,
      })
      .pipe(
        filter(Boolean),
        tap(() => this.cancelando.set(reserva.id)),
        switchMap(() => this.servicio.cancelar(reserva.id).pipe(finalize(() => this.cancelando.set(null)))),
      )
      .subscribe({
        next: () => {
          this.toast.exito('Reserva cancelada');
          this.recarga.next();
        },
        // El motivo (p. ej. "ya ha iniciado") llega como toast desde el interceptor; se refresca por si cambió el estado.
        error: () => this.recarga.next(),
      });
  }
}
