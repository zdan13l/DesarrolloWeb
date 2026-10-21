import { DatePipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap } from 'rxjs';
import { ErrorApi, leerErrorApi } from '../../core/models/api-error';
import { StatusBadge } from '../../shared/status-badge/status-badge';
import { ToastService } from '../../shared/toast/toast.service';
import { EstadoFisico, Prestamo } from './prestamo.model';
import { PrestamoService } from './prestamo.service';

/** CU6. Registrar la devolución de un préstamo activo. */
@Component({
  selector: 'app-prestamo-devolucion',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, StatusBadge],
  template: `
    <header class="page-header">
      <h1>Registrar devolución</h1>
      <a class="btn" routerLink="/prestamos">Volver</a>
    </header>

    @let p = prestamo();
    @if (p === undefined) {
      <p class="texto-suave">Cargando…</p>
    } @else if (p === null) {
      <p class="alerta alerta--error">No se pudo cargar el préstamo.</p>
    } @else {
      <section class="card">
        <h2>{{ p.recursoNombre }} <app-status-badge [estado]="p.estadoPrestamo" /></h2>
        <dl class="datos">
          <dt>Prestado a</dt>
          <dd>{{ p.usuarioNombre }}</dd>
          <dt>Entrega</dt>
          <dd>{{ p.fechaHoraEntrega | date: 'dd/MM/yyyy HH:mm' }}</dd>
          <dt>Límite</dt>
          <dd>{{ p.fechaHoraLimite | date: 'dd/MM/yyyy HH:mm' }}</dd>
          <dt>Estado al entregar</dt>
          <dd><app-status-badge [estado]="p.estadoInicial" /></dd>
          <dt>Accesorios</dt>
          <dd>{{ p.accesorios }}</dd>
        </dl>
      </section>

      @if (p.estadoPrestamo !== 'ACTIVO') {
        <p class="alerta alerta--aviso">Este préstamo ya fue devuelto; no admite otra devolución.</p>
      } @else {
        @if (errorApi(); as e) {
          <div class="alerta alerta--error" role="alert">
            <strong>No se pudo registrar la devolución</strong>
            <p>{{ e.message }}</p>
          </div>
        }

        <form class="card" [formGroup]="form" (ngSubmit)="guardar()" novalidate>
          <div class="form-grid">
            <div class="form-field">
              <label for="estadoFinal">Estado físico al devolver</label>
              <select id="estadoFinal" formControlName="estadoFinal">
                <option value="BUENO">Bueno</option>
                <option value="REGULAR">Regular</option>
                <option value="DANADO">Dañado</option>
              </select>
            </div>
            <div class="form-field">
              <label for="observaciones">Observaciones (opcional)</label>
              <textarea id="observaciones" formControlName="observaciones"></textarea>
            </div>
          </div>
          <p class="texto-suave">La fecha de devolución es el momento en que registras esta acción.</p>
          <div class="form-actions">
            <button type="submit" class="btn btn--primario" [disabled]="guardando()">
              {{ guardando() ? 'Registrando…' : 'Registrar devolución' }}
            </button>
          </div>
        </form>
      }
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
  `,
})
export class PrestamoDevolucion {
  private readonly servicio = inject(PrestamoService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  protected readonly guardando = signal(false);
  protected readonly errorApi = signal<ErrorApi | null>(null);

  /** `undefined` mientras carga, `null` si falló. */
  protected readonly prestamo = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) => this.servicio.obtener(id).pipe(catchError(() => of(null)))),
    ),
    { initialValue: undefined as Prestamo | null | undefined },
  );

  protected readonly form = new FormGroup({
    estadoFinal: new FormControl<EstadoFisico>('BUENO', { nonNullable: true, validators: Validators.required }),
    observaciones: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.errorApi.set(null));
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { estadoFinal, observaciones } = this.form.getRawValue();
    const texto = observaciones.trim();

    this.errorApi.set(null);
    this.guardando.set(true);
    this.servicio
      .devolver(this.id(), { estadoFinal, ...(texto ? { observaciones: texto } : {}) })
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (devuelto) => {
          this.toast.exito(devuelto.devolucionTardia ? 'Devolución registrada (fuera de plazo)' : 'Devolución registrada');
          void this.router.navigate(['/prestamos']);
        },
        // Un 409 (p. ej. ya devuelto) se muestra aquí, sin toast.
        error: (err: unknown) => this.errorApi.set(leerErrorApi(err)),
      });
  }
}
