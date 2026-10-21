import { toSignal } from '@angular/core/rxjs-interop';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { ToastService } from '../../shared/toast/toast.service';
import { MantenimientoService } from './mantenimiento.service';

/** Abre una intervención (`/mantenimientos/nuevo`): deja el mantenimiento ABIERTO y bloquea el recurso. */
@Component({
  selector: 'app-mantenimiento-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './mantenimiento-form.html',
})
export class MantenimientoForm {
  private readonly servicio = inject(MantenimientoService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly recursos = toSignal(this.servicio.recursos().pipe(catchError(() => of([]))), {
    initialValue: [],
  });

  protected readonly enviando = signal(false);

  protected readonly formulario = this.fb.group({
    recursoId: this.fb.control<number | null>(null, Validators.required),
    diagnostico: this.fb.control('', [Validators.required, Validators.maxLength(255)]),
    observaciones: this.fb.control('', [Validators.required, Validators.maxLength(255)]),
  });

  protected invalido(campo: 'recursoId' | 'diagnostico' | 'observaciones'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  protected enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();

    this.enviando.set(true);
    this.servicio
      .crear({
        recursoId: valores.recursoId as number,
        diagnostico: valores.diagnostico.trim(),
        observaciones: valores.observaciones.trim(),
      })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (mantenimiento) => {
          this.toast.exito(`Mantenimiento abierto: «${mantenimiento.recursoNombre}» quedó bloqueado.`);
          void this.router.navigate(['/mantenimientos', mantenimiento.id]);
        },
        error: () => undefined, // el interceptor ya mostró el mensaje del servidor
      });
  }
}
