import { DatePipe } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Observable,
  Subject,
  catchError,
  filter,
  finalize,
  forkJoin,
  map,
  merge,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { ConfirmService } from '../../shared/confirm-dialog/confirm.service';
import { StatusBadge } from '../../shared/status-badge/status-badge';
import { ToastService } from '../../shared/toast/toast.service';
import { Mantenimiento, RecursoOpcion, estaAbierto } from './mantenimiento.model';
import { MantenimientoService } from './mantenimiento.service';

interface Seguimiento {
  mantenimiento: Mantenimiento;
  recurso: RecursoOpcion;
}

/**
 * Seguimiento de un mantenimiento (`/mantenimientos/:id`): editar el diagnóstico, pasarlo a EN_PROCESO,
 * finalizarlo (decidiendo si el recurso queda DISPONIBLE, RN-05) o cancelarlo.
 */
@Component({
  selector: 'app-mantenimiento-detalle',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, StatusBadge],
  templateUrl: './mantenimiento-detalle.html',
  styleUrl: './mantenimiento-detalle.css',
})
export class MantenimientoDetalle {
  private readonly servicio = inject(MantenimientoService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly recargar$ = new Subject<void>();

  /** Parámetro `:id` de la ruta (llega por withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly seguimiento = signal<Seguimiento | null>(null);
  protected readonly cargando = signal(true);
  protected readonly ocupado = signal(false);
  protected readonly finalizando = signal(false);

  protected readonly habilitarAlFinalizar = new FormControl(true, { nonNullable: true });
  protected readonly formulario = this.fb.group({
    diagnostico: this.fb.control('', [Validators.required, Validators.maxLength(255)]),
    observaciones: this.fb.control('', [Validators.required, Validators.maxLength(255)]),
  });

  protected readonly abierto = computed(() => {
    const s = this.seguimiento();
    return s !== null && estaAbierto(s.mantenimiento.estadoMantenimiento);
  });

  /** Tras cerrar el mantenimiento el recurso puede seguir bloqueado y el gestor lo habilita aparte. */
  protected readonly puedeHabilitarRecurso = computed(() => {
    const s = this.seguimiento();
    return s !== null && !this.abierto() && s.recurso.estadoOperativo === 'BLOQUEADO';
  });

  constructor() {
    merge(toObservable(this.id), this.recargar$.pipe(map(() => this.id())))
      .pipe(
        tap(() => this.cargando.set(true)),
        switchMap((id) =>
          this.servicio.obtener(Number(id)).pipe(
            switchMap((mantenimiento) =>
              forkJoin({ mantenimiento: of(mantenimiento), recurso: this.servicio.recurso(mantenimiento.recursoId) }),
            ),
            catchError(() => of(null)),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((datos) => {
        this.seguimiento.set(datos);
        this.cargando.set(false);
        if (datos) {
          this.formulario.reset({
            diagnostico: datos.mantenimiento.diagnostico,
            observaciones: datos.mantenimiento.observaciones,
          });
        }
      });
  }

  protected invalido(campo: 'diagnostico' | 'observaciones'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  protected guardar(): void {
    const actual = this.seguimiento()?.mantenimiento;
    if (!actual) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { diagnostico, observaciones } = this.formulario.getRawValue();
    this.ejecutar(
      this.servicio.actualizar(actual.id, {
        diagnostico: diagnostico.trim(),
        observaciones: observaciones.trim(),
        recursoId: actual.recursoId,
        estadoMantenimiento: actual.estadoMantenimiento,
      }),
      'Cambios guardados.',
    );
  }

  protected pasarAEnProceso(): void {
    const actual = this.seguimiento()?.mantenimiento;
    if (!actual) return;
    this.ejecutar(
      this.servicio.actualizar(actual.id, {
        diagnostico: actual.diagnostico,
        observaciones: actual.observaciones,
        recursoId: actual.recursoId,
        estadoMantenimiento: 'EN_PROCESO',
      }),
      'El mantenimiento pasó a «En proceso».',
    );
  }

  protected finalizar(): void {
    const actual = this.seguimiento()?.mantenimiento;
    if (!actual) return;
    const habilitar = this.habilitarAlFinalizar.value;
    this.ejecutar(
      this.servicio.finalizar(actual.id, habilitar),
      habilitar
        ? 'Mantenimiento finalizado. El recurso quedó disponible.'
        : 'Mantenimiento finalizado. El recurso sigue bloqueado hasta que lo habilites.',
    );
  }

  protected cancelar(): void {
    const actual = this.seguimiento()?.mantenimiento;
    if (!actual) return;
    this.confirm
      .confirmar({
        titulo: 'Cancelar mantenimiento',
        mensaje: `Se cancelará el mantenimiento de «${actual.recursoNombre}». El recurso seguirá bloqueado hasta que lo habilites.`,
        textoConfirmar: 'Cancelar mantenimiento',
        textoCancelar: 'Volver',
        peligro: true,
      })
      .pipe(filter(Boolean))
      .subscribe(() => this.ejecutar(this.servicio.cancelar(actual.id), 'Mantenimiento cancelado.'));
  }

  protected habilitarRecurso(): void {
    const actual = this.seguimiento()?.mantenimiento;
    if (!actual) return;
    this.ejecutar(this.servicio.habilitarRecurso(actual.recursoId), 'El recurso quedó disponible.');
  }

  /** Corre una acción sobre el servidor, avisa el resultado y vuelve a leer el estado real. */
  private ejecutar(accion: Observable<unknown>, mensajeExito: string): void {
    this.ocupado.set(true);
    accion.pipe(finalize(() => this.ocupado.set(false))).subscribe({
      next: () => {
        this.toast.exito(mensajeExito);
        this.finalizando.set(false);
        this.recargar$.next();
      },
      error: () => undefined, // el interceptor ya mostró el mensaje del servidor
    });
  }
}
