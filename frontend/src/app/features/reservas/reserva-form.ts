import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, filter, finalize, of, switchMap } from 'rxjs';
import { ErrorApi, leerErrorApi } from '../../core/models/api-error';
import { ToastService } from '../../shared/toast/toast.service';
import { OpcionRecurso, OpcionUsuario, ReservaRequest } from './reserva.model';
import { ReservaService } from './reserva.service';

/** `2026-03-05T14:30:00Z` → `2026-03-05T11:30` (hora local, valor de un `datetime-local`). */
function aValorLocal(iso: string): string {
  const fecha = new Date(iso);
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}T${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;
}

/** Hora local escrita por la persona → ISO-8601 UTC que espera el backend. */
function aIso(valorLocal: string): string {
  return new Date(valorLocal).toISOString();
}

type CampoForm = 'recursoId' | 'usuarioId' | 'inicio' | 'fin';

/** CU2 y CU3. Crear o modificar una reserva; el conflicto de horario (409) se muestra en el propio formulario. */
@Component({
  selector: 'app-reserva-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <header class="page-header">
      <h1>{{ esEdicion() ? 'Editar reserva' : 'Nueva reserva' }}</h1>
      <a class="btn" routerLink="/reservas">Volver</a>
    </header>

    @if (falloCarga()) {
      <p class="alerta alerta--error">No se pudo cargar la reserva a editar.</p>
    }

    @if (errorApi(); as e) {
      <div class="alerta alerta--error" role="alert">
        <strong>{{ e.status === 409 ? 'No se pudo guardar por un conflicto' : 'No se pudo guardar la reserva' }}</strong>
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
        <div class="form-field" [class.form-field--error]="invalido('recursoId')">
          <label for="recurso">Recurso</label>
          <select id="recurso" formControlName="recursoId">
            <option [ngValue]="null">Selecciona…</option>
            @for (r of recursos(); track r.id) {
              <option [ngValue]="r.id">{{ r.nombre }}</option>
            }
          </select>
          @if (invalido('recursoId')) {
            <p class="form-error">Selecciona un recurso.</p>
          }
        </div>

        <div class="form-field" [class.form-field--error]="invalido('usuarioId')">
          <label for="usuario">Reservado por</label>
          <select id="usuario" formControlName="usuarioId">
            <option [ngValue]="null">Selecciona…</option>
            @for (u of usuarios(); track u.id) {
              <option [ngValue]="u.id">{{ u.nombre }} {{ u.apellido }}</option>
            }
          </select>
          @if (invalido('usuarioId')) {
            <p class="form-error">Selecciona un usuario.</p>
          }
        </div>

        <div class="form-field" [class.form-field--error]="invalido('inicio')">
          <label for="inicio">Inicio</label>
          <input id="inicio" type="datetime-local" formControlName="inicio" />
          @if (invalido('inicio')) {
            <p class="form-error">La fecha de inicio es obligatoria.</p>
          }
        </div>

        <div class="form-field" [class.form-field--error]="invalido('fin')">
          <label for="fin">Fin</label>
          <input id="fin" type="datetime-local" formControlName="fin" />
          @if (invalido('fin')) {
            <p class="form-error">La fecha de fin es obligatoria.</p>
          }
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn--primario" [disabled]="guardando()">
          {{ guardando() ? 'Guardando…' : esEdicion() ? 'Guardar cambios' : 'Reservar' }}
        </button>
      </div>
    </form>
  `,
})
export class ReservaForm {
  private readonly servicio = inject(ReservaService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Presente solo en `/reservas/:id/editar`. */
  readonly id = input<string>();
  /** `?recursoId=` desde el detalle del recurso. */
  readonly recursoId = input<string>();

  protected readonly esEdicion = computed(() => !!this.id());
  protected readonly guardando = signal(false);
  protected readonly falloCarga = signal(false);
  protected readonly errorApi = signal<ErrorApi | null>(null);

  protected readonly recursos = toSignal(
    this.servicio.recursos().pipe(catchError(() => of<OpcionRecurso[]>([]))),
    { initialValue: [] },
  );
  protected readonly usuarios = toSignal(
    this.servicio.usuarios().pipe(catchError(() => of<OpcionUsuario[]>([]))),
    { initialValue: [] },
  );

  protected readonly form = new FormGroup({
    recursoId: new FormControl<number | null>(null, Validators.required),
    usuarioId: new FormControl<number | null>(null, Validators.required),
    inicio: new FormControl('', { nonNullable: true, validators: Validators.required }),
    fin: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  constructor() {
    // Al tocar cualquier campo el aviso anterior deja de ser válido.
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.errorApi.set(null));

    toObservable(this.recursoId)
      .pipe(takeUntilDestroyed())
      .subscribe((valor) => {
        if (valor && !this.esEdicion()) this.form.controls.recursoId.setValue(Number(valor));
      });

    toObservable(this.id)
      .pipe(
        filter((id): id is string => !!id),
        switchMap((id) => this.servicio.obtener(id)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (reserva) =>
          this.form.patchValue({
            recursoId: reserva.recursoId,
            usuarioId: reserva.usuarioId,
            inicio: aValorLocal(reserva.fechaHoraInicio),
            fin: aValorLocal(reserva.fechaHoraFin),
          }),
        error: () => this.falloCarga.set(true),
      });
  }

  protected invalido(campo: CampoForm): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    const datos: ReservaRequest = {
      recursoId: valores.recursoId as number,
      usuarioId: valores.usuarioId as number,
      fechaHoraInicio: aIso(valores.inicio),
      fechaHoraFin: aIso(valores.fin),
    };

    const id = this.id();
    const peticion = id ? this.servicio.actualizar(id, datos) : this.servicio.crear(datos);
    this.errorApi.set(null);
    this.guardando.set(true);
    peticion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.toast.exito(id ? 'Reserva actualizada' : 'Reserva creada');
        void this.router.navigate(['/reservas']);
      },
      // Peticiones sin toast: aquí se muestra el motivo, sobre todo el 409 de horario ocupado o recurso bloqueado.
      error: (err: unknown) => this.errorApi.set(leerErrorApi(err)),
    });
  }
}
