import { toSignal } from '@angular/core/rxjs-interop';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, catchError, filter, finalize, of, switchMap, tap } from 'rxjs';
import { ConfirmService } from '../../../shared/confirm-dialog/confirm.service';
import { Columna, DataTable } from '../../../shared/data-table/data-table';
import { ToastService } from '../../../shared/toast/toast.service';
import { Ubicacion, UbicacionRequest } from './ubicacion.model';
import { UbicacionService } from './ubicacion.service';

/** CRUD de ubicaciones (`/admin/ubicaciones`). */
@Component({
  selector: 'app-ubicaciones-page',
  imports: [ReactiveFormsModule, DataTable],
  templateUrl: './ubicaciones-page.html',
})
export class UbicacionesPage {
  private readonly servicio = inject(UbicacionService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly recargar$ = new BehaviorSubject<void>(undefined);

  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  /** `null`: sin formulario; `'nueva'`: creando; una ubicación: editándola. */
  protected readonly editando = signal<Ubicacion | 'nueva' | null>(null);

  protected readonly ubicaciones = toSignal(
    this.recargar$.pipe(
      tap(() => this.cargando.set(true)),
      switchMap(() =>
        this.servicio.listar().pipe(
          catchError(() => of([] as Ubicacion[])),
          finalize(() => this.cargando.set(false)),
        ),
      ),
    ),
    { initialValue: [] as Ubicacion[] },
  );

  protected readonly formulario = this.fb.group({
    nombre: this.fb.control('', [Validators.required, Validators.maxLength(255)]),
    edificio: this.fb.control('', [Validators.required, Validators.maxLength(255)]),
    piso: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    detalle: this.fb.control('', Validators.maxLength(255)),
  });

  protected readonly columnas: Columna<Ubicacion>[] = [
    { clave: 'nombre', etiqueta: 'Nombre' },
    { clave: 'edificio', etiqueta: 'Edificio' },
    { clave: 'piso', etiqueta: 'Piso' },
    { clave: 'detalle', etiqueta: 'Detalle' },
  ];

  protected invalido(campo: 'nombre' | 'edificio' | 'piso' | 'detalle'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  protected nueva(): void {
    this.formulario.reset({ nombre: '', edificio: '', piso: null, detalle: '' });
    this.editando.set('nueva');
  }

  protected editar(ubicacion: Ubicacion): void {
    this.formulario.reset({
      nombre: ubicacion.nombre,
      edificio: ubicacion.edificio,
      piso: ubicacion.piso,
      detalle: ubicacion.detalle ?? '',
    });
    this.editando.set(ubicacion);
  }

  protected cerrarFormulario(): void {
    this.editando.set(null);
  }

  protected guardar(): void {
    const destino = this.editando();
    if (destino === null) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    const solicitud: UbicacionRequest = {
      nombre: valores.nombre.trim(),
      edificio: valores.edificio.trim(),
      piso: valores.piso as number,
      detalle: valores.detalle.trim() || null,
    };

    this.guardando.set(true);
    const operacion =
      destino === 'nueva' ? this.servicio.crear(solicitud) : this.servicio.actualizar(destino.id, solicitud);
    operacion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.toast.exito(destino === 'nueva' ? 'Ubicación creada.' : 'Ubicación actualizada.');
        this.editando.set(null);
        this.recargar$.next();
      },
      error: () => undefined,
    });
  }

  protected eliminar(ubicacion: Ubicacion): void {
    this.confirm
      .confirmar({
        titulo: 'Eliminar ubicación',
        mensaje: `¿Eliminar la ubicación «${ubicacion.nombre}»? Esta acción no se puede deshacer.`,
        textoConfirmar: 'Eliminar',
        peligro: true,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.servicio.eliminar(ubicacion.id)),
      )
      .subscribe({
        next: () => {
          this.toast.exito('Ubicación eliminada.');
          if (this.editando() === ubicacion) this.editando.set(null);
          this.recargar$.next();
        },
        error: () => undefined,
      });
  }
}
