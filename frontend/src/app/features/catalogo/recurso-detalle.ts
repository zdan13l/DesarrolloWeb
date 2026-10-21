import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import { StatusBadge } from '../../shared/status-badge/status-badge';
import { FranjaOcupada, Recurso } from './recurso.model';
import { RecursoService } from './recurso.service';

/** Fecha local de hoy como YYYY-MM-DD (valor de un `<input type="date">`). */
function hoy(): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

/** CU1. Detalle del recurso con las franjas ocupadas del día elegido. */
@Component({
  selector: 'app-recurso-detalle',
  imports: [DatePipe, RouterLink, StatusBadge],
  template: `
    <header class="page-header">
      <h1>Detalle del recurso</h1>
      <a class="btn" routerLink="/catalogo">Volver al catálogo</a>
    </header>

    @let r = recurso();
    @if (r === undefined) {
      <p class="texto-suave">Cargando…</p>
    } @else if (r === null) {
      <p class="alerta alerta--error">No se pudo cargar el recurso.</p>
    } @else {
      <section class="card">
        <h2>{{ r.nombre }} <app-status-badge [estado]="r.estadoOperativo" /></h2>
        <p>{{ r.descripcion }}</p>
        <dl class="datos">
          <dt>Tipo</dt>
          <dd>{{ r.tipoRecurso === 'ESPACIO' ? 'Espacio' : 'Equipo' }}</dd>
          <dt>Modalidad</dt>
          <dd>{{ r.modalidadRecurso.toLowerCase() }}</dd>
          <dt>Categoría</dt>
          <dd>{{ r.categoriaNombre }}</dd>
          <dt>Ubicación</dt>
          <dd>{{ r.ubicacionNombre }}</dd>
          <dt>Características</dt>
          <dd>{{ r.caracteristicas }}</dd>
        </dl>
        @if (r.estadoOperativo === 'BLOQUEADO') {
          <p class="alerta alerta--aviso">El recurso está bloqueado: no admite reservas ni préstamos.</p>
        } @else if (r.estadoOperativo === 'PRESTADO') {
          <p class="alerta alerta--aviso">El recurso figura como prestado en este momento.</p>
        }
        <div class="form-actions">
          <a class="btn" [routerLink]="['/recursos', r.id, 'editar']">Editar</a>
          <a class="btn btn--primario" routerLink="/reservas/nueva" [queryParams]="{ recursoId: r.id }">Reservar</a>
        </div>
      </section>

      <section class="card">
        <h2>Disponibilidad</h2>
        <div class="form-field fecha">
          <label for="fecha">Día a consultar</label>
          <input id="fecha" type="date" [value]="fecha()" (change)="cambiarFecha($event)" />
        </div>

        @if (cargandoFranjas()) {
          <p class="texto-suave">Consultando…</p>
        } @else if (franjas().length === 0) {
          <p class="alerta alerta--exito">Sin reservas ni préstamos: el recurso está libre todo el día.</p>
        } @else {
          <ul class="franjas">
            @for (f of franjas(); track f.fechaHoraInicio + f.tipoOcupacion) {
              <li>
                <strong>{{ f.fechaHoraInicio | date: 'HH:mm' }} – {{ f.fechaHoraFin | date: 'HH:mm' }}</strong>
                <span class="texto-suave">{{ f.tipoOcupacion === 'RESERVA' ? 'Reserva' : 'Préstamo' }}</span>
              </li>
            }
          </ul>
        }
      </section>
    }
  `,
  styles: `
    .datos {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 6px 16px;
      margin: 0;
    }
    .datos dt {
      font-weight: 600;
    }
    .datos dd {
      margin: 0;
    }
    .fecha {
      max-width: 240px;
      margin-bottom: 16px;
    }
    .franjas {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .franjas li {
      display: flex;
      gap: 12px;
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
    }
  `,
})
export class RecursoDetalle {
  private readonly servicio = inject(RecursoService);

  readonly id = input.required<string>();

  protected readonly fecha = signal(hoy());
  protected readonly cargandoFranjas = signal(true);

  /** `undefined` mientras carga, `null` si falló. */
  protected readonly recurso = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) => this.servicio.obtener(id).pipe(catchError(() => of(null)))),
    ),
    { initialValue: undefined as Recurso | null | undefined },
  );

  /** Cada cambio de recurso o de día cancela la consulta anterior (switchMap) y pide la nueva. */
  protected readonly franjas = toSignal(
    toObservable(computed(() => ({ id: this.id(), fecha: this.fecha() }))).pipe(
      tap(() => this.cargandoFranjas.set(true)),
      switchMap(({ id, fecha }) =>
        this.servicio.disponibilidad(id, fecha).pipe(
          map((lista) => [...lista].sort((a, b) => a.fechaHoraInicio.localeCompare(b.fechaHoraInicio))),
          catchError(() => of<FranjaOcupada[]>([])),
          finalize(() => this.cargandoFranjas.set(false)),
        ),
      ),
    ),
    { initialValue: [] as FranjaOcupada[] },
  );

  protected cambiarFecha(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    if (valor) this.fecha.set(valor);
  }
}
