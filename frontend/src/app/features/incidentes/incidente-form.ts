import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { ahoraParaInput, inputAIso } from './fecha-local';
import {
  Incidente,
  IncidenteRequest,
  SEVERIDADES,
  SeveridadIncidente,
  TIPOS_INCIDENTE,
  TipoIncidente,
} from './incidente.model';
import { IncidenteService } from './incidente.service';

@Component({
  selector: 'app-incidente-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './incidente-form.html',
})
export class IncidenteForm {
  private readonly servicio = inject(IncidenteService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly tipos = TIPOS_INCIDENTE;
  protected readonly severidades = SEVERIDADES;

  protected readonly recursos = toSignal(this.servicio.recursos().pipe(catchError(() => of([]))), {
    initialValue: [],
  });
  protected readonly usuarios = toSignal(this.servicio.usuariosActivos().pipe(catchError(() => of([]))), {
    initialValue: [],
  });

  protected readonly enviando = signal(false);
  /** Incidente recién reportado: la pantalla pasa de formulario a confirmación. */
  protected readonly reportado = signal<Incidente | null>(null);

  protected readonly formulario = this.fb.group({
    tipoIncidente: this.fb.control<TipoIncidente | ''>('', Validators.required),
    severidadIncidente: this.fb.control<SeveridadIncidente | ''>('', Validators.required),
    descripcion: this.fb.control('', [Validators.required, Validators.maxLength(255)]),
    fecha: this.fb.control(ahoraParaInput(), Validators.required),
    recursoId: this.fb.control<number | null>(null, Validators.required),
    usuarioId: this.fb.control<number | null>(null, Validators.required),
  });

  private readonly severidadElegida = toSignal(this.formulario.controls.severidadIncidente.valueChanges, {
    initialValue: this.formulario.controls.severidadIncidente.value,
  });

  /** Aviso previo: el usuario debe saber que este reporte bloqueará el recurso. */
  protected readonly bloqueara = computed(() => this.severidadElegida() === 'CRITICA');

  protected invalido(campo: keyof typeof this.formulario.controls): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  protected enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    const solicitud: IncidenteRequest = {
      tipoIncidente: valores.tipoIncidente as TipoIncidente,
      severidadIncidente: valores.severidadIncidente as SeveridadIncidente,
      descripcion: valores.descripcion.trim(),
      fecha: inputAIso(valores.fecha),
      recursoId: valores.recursoId as number,
      usuarioId: valores.usuarioId as number,
    };

    this.enviando.set(true);
    this.servicio
      .crear(solicitud)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (incidente) => this.reportado.set(incidente),
        error: () => undefined,
      });
  }

  protected reportarOtro(): void {
    this.reportado.set(null);
    this.formulario.reset({
      tipoIncidente: '',
      severidadIncidente: '',
      descripcion: '',
      fecha: ahoraParaInput(),
      recursoId: null,
      usuarioId: null,
    });
  }
}
