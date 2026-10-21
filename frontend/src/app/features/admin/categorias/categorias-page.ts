import { toSignal } from '@angular/core/rxjs-interop';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, catchError, filter, finalize, of, switchMap, tap } from 'rxjs';
import { ConfirmService } from '../../../shared/confirm-dialog/confirm.service';
import { Columna, DataTable } from '../../../shared/data-table/data-table';
import { ToastService } from '../../../shared/toast/toast.service';
import { Categoria, CategoriaRequest } from './categoria.model';
import { CategoriaService } from './categoria.service';

/** CRUD de categorías (`/admin/categorias`). */
@Component({
  selector: 'app-categorias-page',
  imports: [ReactiveFormsModule, DataTable],
  templateUrl: './categorias-page.html',
})
export class CategoriasPage {
  private readonly servicio = inject(CategoriaService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly recargar$ = new BehaviorSubject<void>(undefined);

  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  /** `null`: sin formulario; `'nueva'`: creando; una categoría: editándola. */
  protected readonly editando = signal<Categoria | 'nueva' | null>(null);

  protected readonly categorias = toSignal(
    this.recargar$.pipe(
      tap(() => this.cargando.set(true)),
      switchMap(() =>
        this.servicio.listar().pipe(
          catchError(() => of([] as Categoria[])),
          finalize(() => this.cargando.set(false)),
        ),
      ),
    ),
    { initialValue: [] as Categoria[] },
  );

  protected readonly formulario = this.fb.group({
    nombre: this.fb.control('', [Validators.required, Validators.maxLength(255)]),
    descripcion: this.fb.control('', Validators.maxLength(255)),
  });

  protected readonly columnas: Columna<Categoria>[] = [
    { clave: 'nombre', etiqueta: 'Nombre' },
    { clave: 'descripcion', etiqueta: 'Descripción' },
  ];

  protected invalido(campo: 'nombre' | 'descripcion'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  protected nueva(): void {
    this.formulario.reset({ nombre: '', descripcion: '' });
    this.editando.set('nueva');
  }

  protected editar(categoria: Categoria): void {
    this.formulario.reset({ nombre: categoria.nombre, descripcion: categoria.descripcion ?? '' });
    this.editando.set(categoria);
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
    const { nombre, descripcion } = this.formulario.getRawValue();
    const solicitud: CategoriaRequest = { nombre: nombre.trim(), descripcion: descripcion.trim() || null };

    this.guardando.set(true);
    const operacion =
      destino === 'nueva' ? this.servicio.crear(solicitud) : this.servicio.actualizar(destino.id, solicitud);
    operacion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.toast.exito(destino === 'nueva' ? 'Categoría creada.' : 'Categoría actualizada.');
        this.editando.set(null);
        this.recargar$.next();
      },
      error: () => undefined, // el interceptor ya mostró el mensaje del servidor
    });
  }

  protected eliminar(categoria: Categoria): void {
    this.confirm
      .confirmar({
        titulo: 'Eliminar categoría',
        mensaje: `¿Eliminar la categoría «${categoria.nombre}»? Esta acción no se puede deshacer.`,
        textoConfirmar: 'Eliminar',
        peligro: true,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.servicio.eliminar(categoria.id)),
      )
      .subscribe({
        next: () => {
          this.toast.exito('Categoría eliminada.');
          if (this.editando() === categoria) this.editando.set(null);
          this.recargar$.next();
        },
        error: () => undefined, // el interceptor ya mostró el mensaje del servidor
      });
  }
}
