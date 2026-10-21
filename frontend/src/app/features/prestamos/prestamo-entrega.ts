import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { ErrorApi, leerErrorApi } from '../../core/models/api-error';
import { ToastService } from '../../shared/toast/toast.service';
import { EstadoFisico, PrestamoRequest, ReservaParaEntrega } from './prestamo.model';
import { PrestamoService } from './prestamo.service';

const SIN_ESPACIOS = Validators.pattern(/\S/);

type CampoForm = 'reservaId' | 'fechaHoraEntrega' | 'fechaHoraLimite' | 'accesorios' | 'observaciones';

/** Hora local en formato `datetime-local` (`2026-03-05T11:30`). */
function aValorLocal(fecha: Date): string {
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}T${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;
}

/** CU5. Registrar la entrega de un recurso a partir de una reserva confirmada. */
@Component({
  selector: 'app-prestamo-entrega',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  template: `
    <header class="page-header">
      <h1>Registrar entrega</h1>
      <a class="btn" routerLink="/prestamos">Volver</a>
    </header>

    @if (errorApi(); as e) {
      <div class="alerta alerta--error" role="alert">
        <strong>No se pudo registrar la entrega</strong>
        <p>{{ e.message }}</p>
        @if (e.errors.length) {
          <ul>
            @for (campo of e.errors; track campo.campo) {
              <li>{{ campo.campo }}: {{ campo.mensaje }}</li>
            }
          </ul>
        }
      </div>
    }

    <form class="card" [formGroup]="form" (ngSubmit)="guardar()" novalidate>
      <div class="form-grid">
        <div class="form-field" [class.form-field--error]="invalido('reservaId')">
          <label for="reserva">Reserva confirmada</label>
          <select id="reserva" formControlName="reservaId">
            <option [ngValue]="null">Selecciona…</option>
            @for (r of reservas(); track r.id) {
              <option [ngValue]="r.id">
                {{ r.recursoNombre }} — {{ r.usuarioNombre }} ({{ r.fechaHoraInicio | date: 'dd/MM HH:mm' }})
              </option>
            }
          </select>
          @if (invalido('reservaId')) {
            <p class="form-error">Selecciona la reserva que respalda la entrega.</p>
          }
          @if (reservas().length === 0) {
            <p class="texto-suave">No hay reservas confirmadas disponibles.</p>
          }
        </div>

        <div class="form-field">
          <label for="estadoInicial">Estado físico al entregar</label>
          <select id="estadoInicial" formControlName="estadoInicial">
            <option value="BUENO">Bueno</option>
            <option value="REGULAR">Regular</option>
            <option value="DANADO">Dañado</option>
          </select>
        </div>

        <div class="form-field" [class.form-field--error]="invalido('fechaHoraEntrega')">
          <label for="entrega">Fecha y hora de entrega</label>
          <input id="entrega" type="datetime-local" formControlName="fechaHoraEntrega" />
          @if (invalido('fechaHoraEntrega')) {
            <p class="form-error">La fecha de entrega es obligatoria.</p>
          }
        </div>

        <div class="form-field" [class.form-field--error]="invalido('fechaHoraLimite')">
          <label for="limite">Fecha y hora límite de devolución</label>
          <input id="limite" type="datetime-local" formControlName="fechaHoraLimite" />
          @if (invalido('fechaHoraLimite')) {
            <p class="form-error">La fecha límite es obligatoria.</p>
          }
        </div>
      </div>

      <div class="form-grid campos-largos">
        <div class="form-field" [class.form-field--error]="invalido('accesorios')">
          <label for="accesorios">Accesorios entregados</label>
          <textarea id="accesorios" formControlName="accesorios" placeholder="Cargador, cable HDMI… o «Ninguno»"></textarea>
          @if (invalido('accesorios')) {
            <p class="form-error">Indica los accesorios entregados.</p>
          }
        </div>

        <div class="form-field" [class.form-field--error]="invalido('observaciones')">
          <label for="observaciones">Observaciones</label>
          <textarea id="observaciones" formControlName="observaciones"></textarea>
          @if (invalido('observaciones')) {
            <p class="form-error">Las observaciones son obligatorias.</p>
          }
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn--primario" [disabled]="guardando()">
          {{ guardando() ? 'Registrando…' : 'Registrar entrega' }}
        </button>
      </div>
    </form>
  `,
  styles: `
    .campos-largos {
      margin-top: 16px;
    }
  `,
})
export class PrestamoEntrega {
  private readonly servicio = inject(PrestamoService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly guardando = signal(false);
  protected readonly errorApi = signal<ErrorApi | null>(null);

  protected readonly reservas = toSignal(
    this.servicio.reservasConfirmadas().pipe(catchError(() => of<ReservaParaEntrega[]>([]))),
    { initialValue: [] as ReservaParaEntrega[] },
  );

  protected readonly form = new FormGroup({
    reservaId: new FormControl<number | null>(null, Validators.required),
    estadoInicial: new FormControl<EstadoFisico>('BUENO', { nonNullable: true }),
    fechaHoraEntrega: new FormControl(aValorLocal(new Date()), { nonNullable: true, validators: Validators.required }),
    fechaHoraLimite: new FormControl('', { nonNullable: true, validators: Validators.required }),
    accesorios: new FormControl('', { nonNullable: true, validators: [Validators.required, SIN_ESPACIOS] }),
    observaciones: new FormControl('', { nonNullable: true, validators: [Validators.required, SIN_ESPACIOS] }),
  });

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.errorApi.set(null));

    // La reserva fija recurso y usuario; el límite de devolución se propone con el fin de la reserva.
    this.form.controls.reservaId.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      const reserva = this.reservaElegida();
      if (reserva) this.form.controls.fechaHoraLimite.setValue(aValorLocal(new Date(reserva.fechaHoraFin)));
    });
  }

  private reservaElegida(): ReservaParaEntrega | null {
    const id = this.form.controls.reservaId.value;
    return this.reservas().find((r) => r.id === id) ?? null;
  }

  protected invalido(campo: CampoForm): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  protected guardar(): void {
    const reserva = this.reservaElegida();
    if (this.form.invalid || !reserva) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    const datos: PrestamoRequest = {
      fechaHoraEntrega: new Date(valores.fechaHoraEntrega).toISOString(),
      fechaHoraLimite: new Date(valores.fechaHoraLimite).toISOString(),
      estadoInicial: valores.estadoInicial,
      observaciones: valores.observaciones,
      accesorios: valores.accesorios,
      recursoId: reserva.recursoId,
      usuarioId: reserva.usuarioId,
      reservaId: reserva.id,
    };

    this.errorApi.set(null);
    this.guardando.set(true);
    this.servicio
      .entregar(datos)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.toast.exito('Entrega registrada');
          void this.router.navigate(['/prestamos']);
        },
        // RN-03 (recurso ya prestado), recurso bloqueado o sin modalidad de préstamo llegan como 409.
        error: (err: unknown) => this.errorApi.set(leerErrorApi(err)),
      });
  }
}
